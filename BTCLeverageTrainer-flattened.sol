// Sources flattened with hardhat v2.28.4 https://hardhat.org

// SPDX-License-Identifier: MIT

// File @openzeppelin/contracts/utils/Context.sol@v5.4.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.1) (utils/Context.sol)

pragma solidity ^0.8.20;

/**
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }

    function _contextSuffixLength() internal view virtual returns (uint256) {
        return 0;
    }
}


// File @openzeppelin/contracts/access/Ownable.sol@v5.4.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (access/Ownable.sol)

pragma solidity ^0.8.20;

/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * The initial owner is set to the address provided by the deployer. This can
 * later be changed with {transferOwnership}.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be applied to your functions to restrict their use to
 * the owner.
 */
abstract contract Ownable is Context {
    address private _owner;

    /**
     * @dev The caller account is not authorized to perform an operation.
     */
    error OwnableUnauthorizedAccount(address account);

    /**
     * @dev The owner is not a valid owner account. (eg. `address(0)`)
     */
    error OwnableInvalidOwner(address owner);

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the address provided by the deployer as the initial owner.
     */
    constructor(address initialOwner) {
        if (initialOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(initialOwner);
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if the sender is not the owner.
     */
    function _checkOwner() internal view virtual {
        if (owner() != _msgSender()) {
            revert OwnableUnauthorizedAccount(_msgSender());
        }
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby disabling any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        if (newOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Internal function without access restriction.
     */
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}


// File @openzeppelin/contracts/utils/ReentrancyGuard.sol@v5.4.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.1.0) (utils/ReentrancyGuard.sol)

pragma solidity ^0.8.20;

/**
 * @dev Contract module that helps prevent reentrant calls to a function.
 *
 * Inheriting from `ReentrancyGuard` will make the {nonReentrant} modifier
 * available, which can be applied to functions to make sure there are no nested
 * (reentrant) calls to them.
 *
 * Note that because there is a single `nonReentrant` guard, functions marked as
 * `nonReentrant` may not call one another. This can be worked around by making
 * those functions `private`, and then adding `external` `nonReentrant` entry
 * points to them.
 *
 * TIP: If EIP-1153 (transient storage) is available on the chain you're deploying at,
 * consider using {ReentrancyGuardTransient} instead.
 *
 * TIP: If you would like to learn more about reentrancy and alternative ways
 * to protect against it, check out our blog post
 * https://blog.openzeppelin.com/reentrancy-after-istanbul/[Reentrancy After Istanbul].
 */
abstract contract ReentrancyGuard {
    // Booleans are more expensive than uint256 or any type that takes up a full
    // word because each write operation emits an extra SLOAD to first read the
    // slot's contents, replace the bits taken up by the boolean, and then write
    // back. This is the compiler's defense against contract upgrades and
    // pointer aliasing, and it cannot be disabled.

    // The values being non-zero value makes deployment a bit more expensive,
    // but in exchange the refund on every call to nonReentrant will be lower in
    // amount. Since refunds are capped to a percentage of the total
    // transaction's gas, it is best to keep them low in cases like this one, to
    // increase the likelihood of the full refund coming into effect.
    uint256 private constant NOT_ENTERED = 1;
    uint256 private constant ENTERED = 2;

    uint256 private _status;

    /**
     * @dev Unauthorized reentrant call.
     */
    error ReentrancyGuardReentrantCall();

    constructor() {
        _status = NOT_ENTERED;
    }

    /**
     * @dev Prevents a contract from calling itself, directly or indirectly.
     * Calling a `nonReentrant` function from another `nonReentrant`
     * function is not supported. It is possible to prevent this from happening
     * by making the `nonReentrant` function external, and making it call a
     * `private` function that does the actual work.
     */
    modifier nonReentrant() {
        _nonReentrantBefore();
        _;
        _nonReentrantAfter();
    }

    function _nonReentrantBefore() private {
        // On the first call to nonReentrant, _status will be NOT_ENTERED
        if (_status == ENTERED) {
            revert ReentrancyGuardReentrantCall();
        }

        // Any calls to nonReentrant after this point will fail
        _status = ENTERED;
    }

    function _nonReentrantAfter() private {
        // By storing the original value once again, a refund is triggered (see
        // https://eips.ethereum.org/EIPS/eip-2200)
        _status = NOT_ENTERED;
    }

    /**
     * @dev Returns true if the reentrancy guard is currently set to "entered", which indicates there is a
     * `nonReentrant` function in the call stack.
     */
    function _reentrancyGuardEntered() internal view returns (bool) {
        return _status == ENTERED;
    }
}


// File contracts/BTCLeverageTrainer.sol

// Original license: SPDX_License_Identifier: MIT
pragma solidity ^0.8.20;


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
