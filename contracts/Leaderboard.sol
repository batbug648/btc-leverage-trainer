// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Leaderboard
 * @notice On-chain leaderboard with multiple categories
 * @dev Each update = 1 transaction for Retro9000
 */
contract Leaderboard is Ownable {
    
    struct LeaderboardEntry {
        address user;
        uint256 score;
        uint256 timestamp;
    }
    
    // Different leaderboard types
    enum LeaderboardType {
        POINTS,           // Total points
        STREAK,           // Current streak
        BEST_STREAK,      // Best streak ever
        ACCURACY,         // Prediction accuracy
        TOTAL_PREDICTIONS // Total predictions made
    }
    
    // LeaderboardType => Top 20 entries
    mapping(LeaderboardType => LeaderboardEntry[20]) public leaderboards;
    
    // User => LeaderboardType => Current rank (0 if not on board)
    mapping(address => mapping(LeaderboardType => uint256)) public userRanks;
    
    address public predictionContract;
    
    event LeaderboardUpdated(
        LeaderboardType indexed leaderboardType,
        address indexed user,
        uint256 score,
        uint256 rank
    );
    
    constructor() Ownable(msg.sender) {}
    
    function setPredictionContract(address _predictionContract) external onlyOwner {
        predictionContract = _predictionContract;
    }
    
    /**
     * @notice Update user's position on leaderboard (1 transaction per update)
     * @dev Can be called by user (costs gas) or by prediction contract
     */
    function updateLeaderboard(
        LeaderboardType leaderboardType,
        address user,
        uint256 score
    ) external {
        require(
            msg.sender == user || 
            msg.sender == predictionContract || 
            msg.sender == owner(),
            "Not authorized"
        );
        
        _updateLeaderboard(leaderboardType, user, score);
    }
    
    /**
     * @notice Batch update all leaderboards for a user (5 transactions worth of updates)
     */
    function updateAllLeaderboards(
        address user,
        uint256 points,
        uint256 streak,
        uint256 bestStreak,
        uint256 accuracy,
        uint256 totalPredictions
    ) external {
        require(msg.sender == predictionContract || msg.sender == owner(), "Not authorized");
        
        _updateLeaderboard(LeaderboardType.POINTS, user, points);
        _updateLeaderboard(LeaderboardType.STREAK, user, streak);
        _updateLeaderboard(LeaderboardType.BEST_STREAK, user, bestStreak);
        _updateLeaderboard(LeaderboardType.ACCURACY, user, accuracy);
        _updateLeaderboard(LeaderboardType.TOTAL_PREDICTIONS, user, totalPredictions);
    }
    
    /**
     * @notice Get top 20 for a leaderboard
     */
    function getLeaderboard(LeaderboardType leaderboardType) 
        external 
        view 
        returns (LeaderboardEntry[20] memory) 
    {
        return leaderboards[leaderboardType];
    }
    
    /**
     * @notice Get user's rank for a specific leaderboard
     */
    function getUserRank(address user, LeaderboardType leaderboardType) 
        external 
        view 
        returns (uint256) 
    {
        return userRanks[user][leaderboardType];
    }
    
    /**
     * @notice Get top N entries (for display)
     */
    function getTopN(LeaderboardType leaderboardType, uint256 n) 
        external 
        view 
        returns (LeaderboardEntry[] memory) 
    {
        require(n <= 20, "Max 20");
        
        LeaderboardEntry[] memory result = new LeaderboardEntry[](n);
        LeaderboardEntry[20] storage board = leaderboards[leaderboardType];
        
        for (uint256 i = 0; i < n; i++) {
            result[i] = board[i];
        }
        
        return result;
    }
    
    // ============ Internal Functions ============
    
    function _updateLeaderboard(
        LeaderboardType leaderboardType,
        address user,
        uint256 score
    ) internal {
        LeaderboardEntry[20] storage board = leaderboards[leaderboardType];
        
        // Find if user is already on board
        int256 existingRank = -1;
        for (uint256 i = 0; i < 20; i++) {
            if (board[i].user == user) {
                existingRank = int256(i);
                break;
            }
        }
        
        // Check if score qualifies for leaderboard
        if (existingRank == -1) {
            // Not on board - check if score beats #20
            if (board[19].user != address(0) && score <= board[19].score) {
                return; // Doesn't qualify
            }
        }
        
        // Remove existing entry if present
        if (existingRank >= 0) {
            _removeEntry(leaderboardType, uint256(existingRank));
        }
        
        // Find insertion point
        uint256 insertAt = 20;
        for (uint256 i = 0; i < 20; i++) {
            if (board[i].user == address(0) || score > board[i].score) {
                insertAt = i;
                break;
            }
        }
        
        if (insertAt < 20) {
            // Shift entries down
            for (uint256 i = 19; i > insertAt; i--) {
                board[i] = board[i - 1];
                if (board[i].user != address(0)) {
                    userRanks[board[i].user][leaderboardType] = i + 1;
                }
            }
            
            // Insert new entry
            board[insertAt] = LeaderboardEntry({
                user: user,
                score: score,
                timestamp: block.timestamp
            });
            
            userRanks[user][leaderboardType] = insertAt + 1;
            
            emit LeaderboardUpdated(leaderboardType, user, score, insertAt + 1);
        }
    }
    
    function _removeEntry(LeaderboardType leaderboardType, uint256 index) internal {
        LeaderboardEntry[20] storage board = leaderboards[leaderboardType];
        
        address removedUser = board[index].user;
        userRanks[removedUser][leaderboardType] = 0;
        
        // Shift entries up
        for (uint256 i = index; i < 19; i++) {
            board[i] = board[i + 1];
            if (board[i].user != address(0)) {
                userRanks[board[i].user][leaderboardType] = i + 1;
            }
        }
        
        // Clear last entry
        delete board[19];
    }
}
