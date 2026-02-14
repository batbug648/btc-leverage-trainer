// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PredictionCore
 * @notice Core prediction market contract - optimized for transaction volume (AVAX burn)
 * @dev Each user action generates a transaction for Retro9000 scoring
 */
contract PredictionCore is Ownable, ReentrancyGuard {
    
    // ============ State Variables ============
    
    struct Prediction {
        uint256 id;
        string question;
        string category; // "crypto", "sports", "weather", "memes", "markets"
        uint256 endTime;
        uint256 resolveTime;
        bool resolved;
        bool outcome; // true = YES/UP, false = NO/DOWN
        uint256 totalYesStake;
        uint256 totalNoStake;
        uint256 createdAt;
        address creator;
    }
    
    struct UserPosition {
        uint256 yesStake;
        uint256 noStake;
        bool claimed;
    }
    
    // Prediction ID => Prediction data
    mapping(uint256 => Prediction) public predictions;
    
    // Prediction ID => User => Position
    mapping(uint256 => mapping(address => UserPosition)) public positions;
    
    // User => Points balance
    mapping(address => uint256) public userPoints;
    
    // User => Last active day (for streaks)
    mapping(address => uint256) public lastActiveDay;
    
    // User => Current streak
    mapping(address => uint256) public streaks;
    
    // User => Best streak
    mapping(address => uint256) public bestStreaks;
    
    // User => Total predictions made
    mapping(address => uint256) public totalPredictions;
    
    // User => Correct predictions
    mapping(address => uint256) public correctPredictions;
    
    uint256 public nextPredictionId = 1;
    uint256 public constant STARTING_POINTS = 1000;
    uint256 public constant DAILY_BONUS = 10;
    uint256 public constant MIN_STAKE = 10;
    
    // ============ Events ============
    
    event PredictionCreated(
        uint256 indexed predictionId,
        string question,
        string category,
        uint256 endTime
    );
    
    event StakePlaced(
        uint256 indexed predictionId,
        address indexed user,
        bool isYes,
        uint256 amount,
        uint256 newBalance
    );
    
    event PredictionResolved(
        uint256 indexed predictionId,
        bool outcome,
        uint256 totalYesStake,
        uint256 totalNoStake
    );
    
    event WinningsClaimed(
        uint256 indexed predictionId,
        address indexed user,
        uint256 amount
    );
    
    event DailyBonusClaimed(
        address indexed user,
        uint256 amount,
        uint256 streak
    );
    
    event UserInitialized(
        address indexed user,
        uint256 startingPoints
    );
    
    // ============ Constructor ============
    
    constructor() Ownable(msg.sender) {
        // Create a few starter predictions
        _createInitialPredictions();
    }
    
    // ============ User Functions (Transaction Generators) ============
    
    /**
     * @notice Initialize user account (1 transaction)
     */
    function initializeAccount() external {
        require(userPoints[msg.sender] == 0, "Already initialized");
        userPoints[msg.sender] = STARTING_POINTS;
        emit UserInitialized(msg.sender, STARTING_POINTS);
    }
    
    /**
     * @notice Claim daily bonus (1 transaction per day)
     * @dev Encourages daily engagement
     */
    function claimDailyBonus() external {
        uint256 today = block.timestamp / 1 days;
        require(lastActiveDay[msg.sender] < today, "Already claimed today");
        
        if (userPoints[msg.sender] == 0) {
            userPoints[msg.sender] = STARTING_POINTS;
        }
        
        // Update streak
        if (lastActiveDay[msg.sender] == today - 1) {
            streaks[msg.sender]++;
        } else {
            streaks[msg.sender] = 1;
        }
        
        if (streaks[msg.sender] > bestStreaks[msg.sender]) {
            bestStreaks[msg.sender] = streaks[msg.sender];
        }
        
        lastActiveDay[msg.sender] = today;
        
        // Bonus increases with streak
        uint256 bonus = DAILY_BONUS + (streaks[msg.sender] * 2);
        userPoints[msg.sender] += bonus;
        
        emit DailyBonusClaimed(msg.sender, bonus, streaks[msg.sender]);
    }
    
    /**
     * @notice Place a stake on a prediction (1 transaction per stake)
     * @param predictionId The prediction to stake on
     * @param isYes True for YES/UP, false for NO/DOWN
     * @param amount Points to stake
     */
    function placeStake(
        uint256 predictionId,
        bool isYes,
        uint256 amount
    ) external nonReentrant {
        require(amount >= MIN_STAKE, "Stake too small");
        require(predictionId < nextPredictionId, "Invalid prediction");
        
        Prediction storage pred = predictions[predictionId];
        require(block.timestamp < pred.endTime, "Prediction closed");
        require(!pred.resolved, "Already resolved");
        
        // Initialize user if needed
        if (userPoints[msg.sender] == 0) {
            userPoints[msg.sender] = STARTING_POINTS;
        }
        
        require(userPoints[msg.sender] >= amount, "Insufficient points");
        
        userPoints[msg.sender] -= amount;
        
        UserPosition storage position = positions[predictionId][msg.sender];
        
        if (isYes) {
            position.yesStake += amount;
            pred.totalYesStake += amount;
        } else {
            position.noStake += amount;
            pred.totalNoStake += amount;
        }
        
        totalPredictions[msg.sender]++;
        
        emit StakePlaced(predictionId, msg.sender, isYes, amount, userPoints[msg.sender]);
    }
    
    /**
     * @notice Claim winnings from a resolved prediction (1 transaction per claim)
     * @param predictionId The prediction to claim from
     */
    function claimWinnings(uint256 predictionId) external nonReentrant {
        require(predictionId < nextPredictionId, "Invalid prediction");
        
        Prediction storage pred = predictions[predictionId];
        require(pred.resolved, "Not resolved yet");
        
        UserPosition storage position = positions[predictionId][msg.sender];
        require(!position.claimed, "Already claimed");
        
        uint256 winnings = _calculateWinnings(predictionId, msg.sender);
        require(winnings > 0, "No winnings");
        
        position.claimed = true;
        userPoints[msg.sender] += winnings;
        
        // Track correct predictions
        if ((pred.outcome && position.yesStake > 0) || (!pred.outcome && position.noStake > 0)) {
            correctPredictions[msg.sender]++;
        }
        
        emit WinningsClaimed(predictionId, msg.sender, winnings);
    }
    
    // ============ Admin Functions ============
    
    /**
     * @notice Create a new prediction market
     */
    function createPrediction(
        string memory question,
        string memory category,
        uint256 durationMinutes
    ) external onlyOwner {
        uint256 predictionId = nextPredictionId++;
        
        Prediction storage pred = predictions[predictionId];
        pred.id = predictionId;
        pred.question = question;
        pred.category = category;
        pred.endTime = block.timestamp + (durationMinutes * 1 minutes);
        pred.resolveTime = pred.endTime + 10 minutes; // Grace period
        pred.createdAt = block.timestamp;
        pred.creator = msg.sender;
        
        emit PredictionCreated(predictionId, question, category, pred.endTime);
    }
    
    /**
     * @notice Resolve a prediction with outcome
     */
    function resolvePrediction(uint256 predictionId, bool outcome) external onlyOwner {
        require(predictionId < nextPredictionId, "Invalid prediction");
        
        Prediction storage pred = predictions[predictionId];
        require(!pred.resolved, "Already resolved");
        require(block.timestamp >= pred.endTime, "Not ended yet");
        
        pred.resolved = true;
        pred.outcome = outcome;
        
        emit PredictionResolved(
            predictionId,
            outcome,
            pred.totalYesStake,
            pred.totalNoStake
        );
    }
    
    // ============ View Functions ============
    
    function getPrediction(uint256 predictionId) external view returns (Prediction memory) {
        return predictions[predictionId];
    }
    
    function getUserPosition(uint256 predictionId, address user) 
        external 
        view 
        returns (UserPosition memory) 
    {
        return positions[predictionId][user];
    }
    
    function getUserStats(address user) 
        external 
        view 
        returns (
            uint256 points,
            uint256 streak,
            uint256 bestStreak,
            uint256 total,
            uint256 correct
        ) 
    {
        return (
            userPoints[user],
            streaks[user],
            bestStreaks[user],
            totalPredictions[user],
            correctPredictions[user]
        );
    }
    
    function calculateWinnings(uint256 predictionId, address user) 
        external 
        view 
        returns (uint256) 
    {
        return _calculateWinnings(predictionId, user);
    }
    
    // ============ Internal Functions ============
    
    function _calculateWinnings(uint256 predictionId, address user) 
        internal 
        view 
        returns (uint256) 
    {
        Prediction storage pred = predictions[predictionId];
        if (!pred.resolved) return 0;
        
        UserPosition storage position = positions[predictionId][user];
        if (position.claimed) return 0;
        
        uint256 winningStake = pred.outcome ? position.yesStake : position.noStake;
        if (winningStake == 0) return 0;
        
        uint256 totalWinningStake = pred.outcome ? pred.totalYesStake : pred.totalNoStake;
        uint256 totalLosingStake = pred.outcome ? pred.totalNoStake : pred.totalYesStake;
        
        if (totalWinningStake == 0) return 0;
        
        // Return original stake + proportional share of losing side
        uint256 shareOfLosingSide = (winningStake * totalLosingStake) / totalWinningStake;
        return winningStake + shareOfLosingSide;
    }
    
    function _createInitialPredictions() internal {
        // BTC Prediction
        uint256 id1 = nextPredictionId++;
        predictions[id1] = Prediction({
            id: id1,
            question: "Will BTC be above $100,000 by Friday?",
            category: "crypto",
            endTime: block.timestamp + 3 days,
            resolveTime: block.timestamp + 3 days + 1 hours,
            resolved: false,
            outcome: false,
            totalYesStake: 0,
            totalNoStake: 0,
            createdAt: block.timestamp,
            creator: msg.sender
        });
        
        // AVAX Prediction
        uint256 id2 = nextPredictionId++;
        predictions[id2] = Prediction({
            id: id2,
            question: "Will AVAX reach $50 this week?",
            category: "crypto",
            endTime: block.timestamp + 5 days,
            resolveTime: block.timestamp + 5 days + 1 hours,
            resolved: false,
            outcome: false,
            totalYesStake: 0,
            totalNoStake: 0,
            createdAt: block.timestamp,
            creator: msg.sender
        });
        
        // Sports Prediction
        uint256 id3 = nextPredictionId++;
        predictions[id3] = Prediction({
            id: id3,
            question: "Will the Lakers win their next game?",
            category: "sports",
            endTime: block.timestamp + 2 days,
            resolveTime: block.timestamp + 2 days + 1 hours,
            resolved: false,
            outcome: false,
            totalYesStake: 0,
            totalNoStake: 0,
            createdAt: block.timestamp,
            creator: msg.sender
        });
    }
}
