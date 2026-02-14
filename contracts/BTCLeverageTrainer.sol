// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract BTCLeverageTrainer is Ownable, ReentrancyGuard {
    
    enum LeverageType {
        NORMAL_1X,
        LEVERAGE_2X,
        LEVERAGE_10X
    }
    
    enum Direction {
        LONG,
        SHORT
    }
    
    struct DailyMarket {
        uint256 dayIndex;
        uint256 startPrice;
        uint256 endPrice;
        bool resolved;
        bool active;
    }
    
    struct Position {
        Direction direction;
        LeverageType leverage;
        uint256 amount;
        bool claimed;
        bool liquidated;
    }
    
    struct UserAccount {
        uint256 balance;
        uint256 totalTrades;
        uint256 winningTrades;
        uint256 totalPnL;
        bool isNegativePnL;
        uint256 streak;
        uint256 bestStreak;
        uint256 lastActiveDay;
    }
    
    mapping(uint256 => DailyMarket) public dailyMarkets;
    mapping(uint256 => mapping(address => mapping(LeverageType => Position))) public positions;
    mapping(address => UserAccount) public accounts;
    
    uint256 public currentDay;
    uint256 public constant STARTING_BALANCE = 100000;
    uint256 public constant MIN_POSITION = 1000;
    uint256 public constant DAILY_BONUS = 500;
    
    event DayStarted(uint256 indexed dayIndex, uint256 startPrice);
    event PositionOpened(uint256 indexed dayIndex, address indexed user, Direction direction, LeverageType leverage, uint256 amount);
    event DayResolved(uint256 indexed dayIndex, uint256 startPrice, uint256 endPrice, int256 percentChange);
    event PositionClosed(uint256 indexed dayIndex, address indexed user, LeverageType leverage, uint256 pnl, bool isProfit, bool liquidated);
    event DailyBonusClaimed(address indexed user, uint256 amount, uint256 streak);
    
    constructor() Ownable(msg.sender) {
        currentDay = 1;
        _startNewDay(9650000);
    }
    
    function initializeAccount() external {
        UserAccount storage account = accounts[msg.sender];
        require(account.balance == 0, "Already initialized");
        account.balance = STARTING_BALANCE;
        emit DailyBonusClaimed(msg.sender, STARTING_BALANCE, 0);
    }
    
    function claimDailyBonus() external {
        UserAccount storage account = accounts[msg.sender];
        require(account.lastActiveDay < currentDay, "Already claimed today");
        
        if (account.balance == 0) {
            account.balance = STARTING_BALANCE;
        }
        
        if (account.lastActiveDay == currentDay - 1) {
            account.streak++;
        } else {
            account.streak = 1;
        }
        
        if (account.streak > account.bestStreak) {
            account.bestStreak = account.streak;
        }
        
        account.lastActiveDay = currentDay;
        uint256 bonus = DAILY_BONUS + (account.streak * 100);
        account.balance += bonus;
        
        emit DailyBonusClaimed(msg.sender, bonus, account.streak);
    }
    
    function openPosition(Direction direction, LeverageType leverage, uint256 amountInCents) external nonReentrant {
        require(amountInCents >= MIN_POSITION, "Position too small");
        
        DailyMarket storage market = dailyMarkets[currentDay];
        require(market.active, "Trading not active");
        
        UserAccount storage account = accounts[msg.sender];
        if (account.balance == 0) {
            account.balance = STARTING_BALANCE;
        }
        
        require(account.balance >= amountInCents, "Insufficient balance");
        
        Position storage pos = positions[currentDay][msg.sender][leverage];
        require(pos.amount == 0, "Already have position");
        
        account.balance -= amountInCents;
        pos.direction = direction;
        pos.leverage = leverage;
        pos.amount = amountInCents;
        account.totalTrades++;
        
        emit PositionOpened(currentDay, msg.sender, direction, leverage, amountInCents);
    }
    
    function closePosition(uint256 dayIndex, LeverageType leverage) external nonReentrant {
        DailyMarket storage market = dailyMarkets[dayIndex];
        require(market.resolved, "Day not resolved");
        
        Position storage pos = positions[dayIndex][msg.sender][leverage];
        require(pos.amount > 0, "No position");
        require(!pos.claimed, "Already claimed");
        
        pos.claimed = true;
        UserAccount storage account = accounts[msg.sender];
        
        (uint256 pnl, bool isProfit, bool liquidated) = _calculatePnL(
            pos.amount, pos.direction, pos.leverage, market.startPrice, market.endPrice
        );
        
        pos.liquidated = liquidated;
        
        if (!liquidated) {
            account.balance += pnl;
            if (isProfit && pnl > pos.amount) {
                account.winningTrades++;
            }
        }
        
        emit PositionClosed(dayIndex, msg.sender, leverage, pnl, isProfit, liquidated);
    }
    
    function resolveDay(uint256 endPriceInCents) external onlyOwner {
        DailyMarket storage market = dailyMarkets[currentDay];
        require(market.active, "Day not active");
        require(!market.resolved, "Already resolved");
        
        market.endPrice = endPriceInCents;
        market.resolved = true;
        market.active = false;
        
        int256 percentChange = _calculatePercentChange(market.startPrice, endPriceInCents);
        emit DayResolved(currentDay, market.startPrice, endPriceInCents, percentChange);
    }
    
    function startNewDay(uint256 startPriceInCents) external onlyOwner {
        DailyMarket storage prevMarket = dailyMarkets[currentDay];
        require(prevMarket.resolved || currentDay == 1, "Previous day not resolved");
        
        currentDay++;
        _startNewDay(startPriceInCents);
    }
    
    function getAccount(address user) external view returns (
        uint256 balance, uint256 totalTrades, uint256 winningTrades,
        uint256 totalPnL, bool isNegativePnL, uint256 streak, uint256 bestStreak
    ) {
        UserAccount storage account = accounts[user];
        return (account.balance, account.totalTrades, account.winningTrades,
                account.totalPnL, account.isNegativePnL, account.streak, account.bestStreak);
    }
    
    function getTodayMarket() external view returns (uint256 dayIndex, uint256 startPrice, bool isActive) {
        DailyMarket storage market = dailyMarkets[currentDay];
        return (currentDay, market.startPrice, market.active);
    }
    
    function getPosition(uint256 dayIndex, address user, LeverageType leverage) 
        external 
        view 
        returns (Position memory) 
    {
        return positions[dayIndex][user][leverage];
    }
    
    function _startNewDay(uint256 startPriceInCents) internal {
        DailyMarket storage market = dailyMarkets[currentDay];
        market.dayIndex = currentDay;
        market.startPrice = startPriceInCents;
        market.active = true;
        market.resolved = false;
        emit DayStarted(currentDay, startPriceInCents);
    }
    
    function _calculatePnL(uint256 positionAmount, Direction direction, LeverageType leverage,
        uint256 startPrice, uint256 endPrice) internal pure returns (uint256 pnl, bool isProfit, bool liquidated) {
        
        int256 priceChangePercentBps = _calculatePercentChange(startPrice, endPrice);
        uint256 multiplier = leverage == LeverageType.NORMAL_1X ? 1 : leverage == LeverageType.LEVERAGE_2X ? 2 : 10;
        
        if (leverage == LeverageType.LEVERAGE_10X) {
            if ((direction == Direction.LONG && priceChangePercentBps <= -1000) ||
                (direction == Direction.SHORT && priceChangePercentBps >= 1000)) {
                return (0, false, true);
            }
        }
        
        int256 pnlPercent;
        if (direction == Direction.LONG) {
            pnlPercent = priceChangePercentBps * int256(multiplier);
        } else {
            pnlPercent = -priceChangePercentBps * int256(multiplier);
        }
        
        int256 pnlAmount = (int256(positionAmount) * pnlPercent) / 10000;
        int256 finalAmount = int256(positionAmount) + pnlAmount;
        
        if (finalAmount < 0) {
            return (0, false, true);
        }
        
        pnl = uint256(finalAmount);
        isProfit = pnl > positionAmount;
        liquidated = false;
    }
    
    function _calculatePercentChange(uint256 startPrice, uint256 endPrice) internal pure returns (int256) {
        int256 change = int256(endPrice) - int256(startPrice);
        return (change * 10000) / int256(startPrice);
    }
}
