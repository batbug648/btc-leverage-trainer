# 💰 BTC Leverage Trainer

**Learn leverage trading without losing real money!**

A decentralized educational platform built on Avalanche where users can practice BTC leverage trading with virtual USD. Experience the thrill and risk of 1x, 2x, and 10x leverage positions using real market mechanics - completely risk-free.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Avalanche](https://img.shields.io/badge/Avalanche-E84142?logo=avalanche&logoColor=white)
![Solidity](https://img.shields.io/badge/Solidity-%23363636.svg?logo=solidity&logoColor=white)
![React](https://img.shields.io/badge/React-%2320232a.svg?logo=react&logoColor=%2361DAFB)

---

## 🎯 What is BTC Leverage Trainer?

BTC Leverage Trainer is an educational Web3 application that teaches users about leveraged trading in a safe, virtual environment. Users predict whether BTC will go up or down, choose their leverage level (1x, 2x, or 10x), and see real P&L calculations - all without risking actual money.

### Key Features

- 💵 **Virtual Money** - Start with $1,000 virtual USD
- 📊 **Three Leverage Levels** - Choose 1x (safe), 2x (moderate), or 10x (risky)
- 📈 **LONG & SHORT** - Bet on BTC going up or down
- 💥 **Liquidation Mechanics** - Learn about liquidation with 10x leverage
- 🎓 **Educational Focus** - Understand leverage without losing real money
- ⚡ **Instant Transactions** - Built on Avalanche for fast, cheap transactions
- 🎁 **Daily Bonuses** - Earn streak bonuses for consistent play

---

## 🚀 Live Demo

**Avalanche C-Chain Mainnet:** 0x3E2f3FBC78bF575DC2E2CBF45eD7B48dCc3F4751

**Fuji Testnet:** [Contract Address: 0xE7778fA83E02E38B1417c55962e96b09a635f1eb]

---

## 🎮 How It Works

### 1. Initialize Your Account
Connect your wallet and receive $1,000 virtual money to start trading.

### 2. Open Positions
Choose from three leverage boxes:
- **1x Normal** - Safe trading with 1:1 gains/losses
- **2x Leveraged** - Double the gains AND losses
- **10x Leveraged** - 10x multiplier with liquidation risk

Select LONG (bet BTC goes up) or SHORT (bet BTC goes down) and enter your amount.

### 3. Wait for Resolution
Each trading day closes when the admin resolves it with the actual BTC close price.

### 4. Close & Claim
After the day resolves, close your positions to see your P&L:
- Profitable trades increase your balance
- Losing trades decrease it
- 10x positions can be liquidated if BTC moves -10% against you

### 5. Repeat Daily
Build your trading skills, track your win rate, and climb the streak leaderboard!

---

## 📚 Learning Objectives

This platform teaches:

✅ **Leverage Mechanics** - How leverage multiplies both gains and losses  
✅ **LONG vs SHORT** - Understanding directional bets  
✅ **Risk Management** - Why position sizing matters  
✅ **Liquidation Risk** - What happens with high leverage  
✅ **P&L Calculation** - How profits and losses are calculated  
✅ **Emotional Trading** - Practice without real money stress  

---

## 🛠️ Technology Stack

### Smart Contracts
- **Solidity ^0.8.20** - Smart contract language
- **Hardhat** - Development environment
- **OpenZeppelin** - Secure contract libraries

### Frontend
- **React 18** - UI framework
- **ethers.js 6** - Blockchain interaction
- **CSS3** - Custom styling with gradients

### Blockchain
- **Avalanche C-Chain** - Fast, low-cost transactions
- **MetaMask** - Wallet connection

---

## 📦 Installation & Setup

### Prerequisites
- Node.js v16+
- MetaMask wallet
- AVAX for gas (testnet or mainnet)

### Clone Repository
```bash
git clone https://github.com/yourusername/btc-leverage-trainer.git
cd btc-leverage-trainer
```

### Install Dependencies
```bash
# Install contract dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
```

### Configure Environment

Create `frontend/.env`:
```env
REACT_APP_LEVERAGE_TRAINER_ADDRESS=0xYourContractAddress
REACT_APP_CHAIN_ID=43114
REACT_APP_NETWORK_NAME=Avalanche C-Chain
```

For testnet, use Chain ID `43113` and network name `Avalanche Fuji Testnet`.

### Deploy Contract
```bash
# Compile contracts
npm run compile

# Deploy to Fuji testnet
npx hardhat run scripts/deploy-leverage.js --network fuji

# Deploy to mainnet
npx hardhat run scripts/deploy-leverage.js --network mainnet
```

### Run Frontend
```bash
cd frontend
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🎮 Admin Operations

The contract owner can control daily trading cycles:

### Resolve Current Day
```bash
# Edit scripts/resolve.js to set close price
npx hardhat run scripts/resolve.js --network fuji
```

### Start New Day
```bash
# Edit scripts/newday.js to set start price
npx hardhat run scripts/newday.js --network fuji
```

---

## 💡 Example Scenarios

### Scenario 1: Successful 2x LONG
- Open: 2x LONG $100 at BTC = $96,500
- Close: BTC rises to $99,395 (+3%)
- Result: **+$6 profit** (3% × 2x = 6% gain on $100)

### Scenario 2: Failed 10x SHORT
- Open: 10x SHORT $100 at BTC = $96,500
- Close: BTC rises to $106,150 (+10%)
- Result: **LIQUIDATED** (10% move against position)

### Scenario 3: Mixed Portfolio
- 1x LONG $100 (BTC +2%) = +$2
- 2x SHORT $100 (BTC +2%) = -$4
- 10x SHORT $100 (BTC +2%) = -$20
- **Net: -$22 loss**

---

## 🏗️ Contract Architecture

### Key Functions

**User Functions:**
- `initializeAccount()` - Get starting balance
- `claimDailyBonus()` - Earn daily streak bonuses
- `openPosition()` - Open LONG or SHORT position
- `closePosition()` - Claim P&L after day resolves

**Admin Functions:**
- `resolveDay()` - End current day with close price
- `startNewDay()` - Begin new trading day

**View Functions:**
- `getAccount()` - Get user stats
- `getTodayMarket()` - Get current market info
- `getPosition()` - Get position details

---

## 🔒 Security Features

✅ **ReentrancyGuard** - Prevents reentrancy attacks  
✅ **Ownable** - Admin functions restricted to owner  
✅ **Safe Math** - Overflow/underflow protection  
✅ **Position Validation** - Can't open duplicate positions  
✅ **Balance Checks** - Ensures sufficient funds  

---

## 📊 Stats Tracking

The platform tracks:
- 💰 Balance
- 📈 Total P&L
- 🎯 Win Rate
- 🔥 Current Streak
- 🏆 Best Streak
- 📊 Total Trades

---

## 🎯 Built for Avalanche Retro9000

This project is submitted for the **Avalanche Retro9000** incentive program, showcasing:
- Educational DeFi use case
- High transaction volume potential
- User engagement mechanics
- Real-world trading education

**Target Metrics:**
- 100+ active users
- 800+ daily transactions
- 24,000+ monthly transactions

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- **Avalanche** - For the fast, low-cost blockchain
- **OpenZeppelin** - For secure contract libraries
- **Retro9000** - For the incentive program

---

## ⚠️ Disclaimer

**This platform uses virtual money only.** No real cryptocurrency or fiat currency is at risk. This is an educational tool for learning about leverage trading mechanics. Past virtual performance does not guarantee future real trading results. Always do your own research before trading with real money.

---

**⭐ Star this repo if you learned something about leverage trading!**

## 📞 Contact

**Developer:** Brian Gregory  
**X (Twitter):** [@ExWifeTokenPepe](https://x.com/ExWifeTokenPepe)  
**Email:** 0x3E2f3FBC78bF575DC2E2CBF45eD7B48dCc3F4751

---
