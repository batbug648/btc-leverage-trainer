// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AchievementNFT
 * @notice Achievement badges as NFTs - each mint = 1 transaction for Retro9000
 * @dev Soulbound tokens (non-transferable) representing user achievements
 */
contract AchievementNFT is ERC721, Ownable {
    
    uint256 private _nextTokenId = 1;
    
    // Achievement types
    enum AchievementType {
        FIRST_PREDICTION,      // Made first prediction
        STREAK_3,              // 3-day streak
        STREAK_7,              // 7-day streak
        STREAK_30,             // 30-day streak
        PREDICTIONS_10,        // Made 10 predictions
        PREDICTIONS_50,        // Made 50 predictions
        PREDICTIONS_100,       // Made 100 predictions
        ACCURACY_60,           // 60%+ accuracy with 20+ predictions
        ACCURACY_70,           // 70%+ accuracy with 20+ predictions
        ACCURACY_80,           // 80%+ accuracy with 20+ predictions
        WHALE,                 // 10,000+ points
        EARLY_ADOPTER,         // One of first 100 users
        CATEGORY_MASTER        // Made predictions in all 5 categories
    }
    
    struct Achievement {
        AchievementType achievementType;
        uint256 timestamp;
        string metadata;
    }
    
    // TokenId => Achievement data
    mapping(uint256 => Achievement) public achievements;
    
    // User => AchievementType => Has earned
    mapping(address => mapping(AchievementType => bool)) public userAchievements;
    
    // User => List of tokenIds
    mapping(address => uint256[]) public userTokens;
    
    address public predictionContract;
    
    event AchievementEarned(
        address indexed user,
        uint256 indexed tokenId,
        AchievementType achievementType
    );
    
    constructor() ERC721("Avalanche Predictions Achievement", "APA") Ownable(msg.sender) {}
    
    function setPredictionContract(address _predictionContract) external onlyOwner {
        predictionContract = _predictionContract;
    }
    
    /**
     * @notice Mint an achievement NFT (1 transaction per achievement)
     * @dev Can only be called by owner or prediction contract
     */
    function mintAchievement(
        address user,
        AchievementType achievementType,
        string memory metadata
    ) external {
        require(
            msg.sender == owner() || msg.sender == predictionContract,
            "Not authorized"
        );
        require(!userAchievements[user][achievementType], "Already earned");
        
        uint256 tokenId = _nextTokenId++;
        
        achievements[tokenId] = Achievement({
            achievementType: achievementType,
            timestamp: block.timestamp,
            metadata: metadata
        });
        
        userAchievements[user][achievementType] = true;
        userTokens[user].push(tokenId);
        
        _safeMint(user, tokenId);
        
        emit AchievementEarned(user, tokenId, achievementType);
    }
    
    /**
     * @notice Get all achievements for a user
     */
    function getUserAchievements(address user) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return userTokens[user];
    }
    
    /**
     * @notice Check if user has specific achievement
     */
    function hasAchievement(address user, AchievementType achievementType) 
        external 
        view 
        returns (bool) 
    {
        return userAchievements[user][achievementType];
    }
    
    /**
     * @notice Get achievement details
     */
    function getAchievement(uint256 tokenId) 
        external 
        view 
        returns (Achievement memory) 
    {
        return achievements[tokenId];
    }
    
    /**
     * @notice Soulbound: Prevent transfers
     */
    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        returns (address)
    {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) {
            revert("Soulbound: Transfer not allowed");
        }
        return super._update(to, tokenId, auth);
    }
    
    /**
     * @notice Override tokenURI for metadata
     */
    function tokenURI(uint256 tokenId) 
        public 
        view 
        override 
        returns (string memory) 
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        
        Achievement memory achievement = achievements[tokenId];
        
        // In production, this would return IPFS/Arweave URL
        // For now, return achievement type as string
        return string(abi.encodePacked(
            "Achievement: ",
            _achievementTypeName(achievement.achievementType)
        ));
    }
    
    function _achievementTypeName(AchievementType aType) 
        internal 
        pure 
        returns (string memory) 
    {
        if (aType == AchievementType.FIRST_PREDICTION) return "First Prediction";
        if (aType == AchievementType.STREAK_3) return "3-Day Streak";
        if (aType == AchievementType.STREAK_7) return "7-Day Streak";
        if (aType == AchievementType.STREAK_30) return "30-Day Streak";
        if (aType == AchievementType.PREDICTIONS_10) return "10 Predictions";
        if (aType == AchievementType.PREDICTIONS_50) return "50 Predictions";
        if (aType == AchievementType.PREDICTIONS_100) return "100 Predictions";
        if (aType == AchievementType.ACCURACY_60) return "60% Accuracy";
        if (aType == AchievementType.ACCURACY_70) return "70% Accuracy";
        if (aType == AchievementType.ACCURACY_80) return "80% Accuracy";
        if (aType == AchievementType.WHALE) return "Whale (10k Points)";
        if (aType == AchievementType.EARLY_ADOPTER) return "Early Adopter";
        if (aType == AchievementType.CATEGORY_MASTER) return "Category Master";
        return "Unknown";
    }
}
