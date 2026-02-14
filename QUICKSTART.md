# ⚡ QUICK START GUIDE

**Get your Avalanche Predictions app running in 10 minutes!**

## 🎯 For Mac Users

### Step 1: Check if you have Node.js (2 mins)

Open Terminal and run:
```bash
node --version
```

✅ If you see a version number (like v18.x.x), you're good!  
❌ If you get an error, install Node.js from: https://nodejs.org (download the LTS version)

### Step 2: Install Dependencies (3 mins)

```bash
# Navigate to your project folder
cd /path/to/avalanche-predictions

# Install main dependencies
npm install

# Install frontend dependencies  
cd frontend
npm install
cd ..
```

### Step 3: Set Up Your Wallet Key (1 min)

```bash
# Copy the example environment file
cp .env.example .env
```

Now open `.env` in a text editor and add your MetaMask private key:

**To get your private key:**
1. Open MetaMask
2. Click the 3 dots → Account details
3. Click "Export Private Key"
4. Enter your password
5. Copy the key

Paste it in `.env`:
```
PRIVATE_KEY=your_private_key_here_without_quotes
```

**⚠️ NEVER SHARE THIS FILE OR COMMIT IT TO GIT!**

### Step 4: Get Free Testnet AVAX (2 mins)

1. Go to https://faucet.avax.network
2. Select "Fuji (C-Chain)"
3. Paste your MetaMask address
4. Click "Request"
5. Wait ~30 seconds for AVAX to arrive

### Step 5: Compile & Deploy (2 mins)

```bash
# Compile the smart contracts
npm run compile

# Deploy to Fuji testnet
npm run deploy:fuji
```

**IMPORTANT:** Copy the three contract addresses that appear!

### Step 6: Configure Frontend (1 min)

```bash
# Copy ABIs to frontend (if you have jq installed)
# If not, just continue - we'll use placeholder ABIs for testing
./scripts/copy-abis.sh

# Or manually:
cp artifacts/contracts/PredictionCore.sol/PredictionCore.json frontend/src/contracts/
cp artifacts/contracts/AchievementNFT.sol/AchievementNFT.json frontend/src/contracts/
cp artifacts/contracts/Leaderboard.sol/Leaderboard.json frontend/src/contracts/

cd frontend
cp .env.example .env
```

Edit `frontend/.env` and add your contract addresses:
```
REACT_APP_PREDICTION_CORE_ADDRESS=0x... (from deploy output)
REACT_APP_ACHIEVEMENT_NFT_ADDRESS=0x... (from deploy output)
REACT_APP_LEADERBOARD_ADDRESS=0x... (from deploy output)
REACT_APP_CHAIN_ID=43113
REACT_APP_NETWORK_NAME=Avalanche Fuji Testnet
```

### Step 7: Run the App! (1 min)

```bash
# Make sure you're in the frontend directory
npm start
```

The app will open at http://localhost:3000 🎉

### Step 8: Test It Out

1. Click "Connect Wallet"
2. Make sure MetaMask is on "Avalanche Fuji C-Chain"
   - If not, add the network:
   - RPC: https://api.avax-test.network/ext/bc/C/rpc
   - Chain ID: 43113
3. Click "Claim Daily Bonus"
4. Make a prediction!
5. Check the leaderboard

---

## 🚀 Ready for Mainnet?

When you're ready to deploy to Avalanche C-Chain mainnet:

1. Get real AVAX (purchase on exchange, bridge to C-Chain)
2. Update `.env` if needed
3. Run: `npm run deploy:mainnet`
4. Update frontend/.env with new addresses
5. Change CHAIN_ID to 43114
6. Deploy frontend to Vercel/Netlify
7. Submit to Retro9000!

---

## ❓ Common Issues

**"Cannot find module" errors:**
```bash
rm -rf node_modules
npm install
```

**MetaMask not connecting:**
- Make sure you're on Fuji network
- Check you approved the connection
- Refresh the page

**Transactions failing:**
- Check you have AVAX for gas
- Try increasing gas in MetaMask

**Need help?**
- Check the full README.md
- Ask in Avalanche Discord
- Check Hardhat docs

---

## 📋 Checklist

- [ ] Node.js installed
- [ ] MetaMask set up with Fuji network
- [ ] Free testnet AVAX claimed
- [ ] Dependencies installed (`npm install`)
- [ ] Contracts compiled (`npm run compile`)
- [ ] Contracts deployed to Fuji
- [ ] Frontend .env configured
- [ ] App running locally
- [ ] Tested making predictions

**You're ready to win Retro9000! 🏆**
