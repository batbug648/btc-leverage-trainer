require('dotenv').config();
const { ethers } = require('ethers');
const axios = require('axios');
const cron = require('node-cron');

// Configuration
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const RPC_URL = 'https://api.avax.network/ext/bc/C/rpc';

// Contract ABI - just the functions we need
const ABI = [
  'function resolveDay(uint256 endPriceInCents) external',
  'function startNewDay(uint256 startPriceInCents) external',
  'function getTodayMarket() external view returns (uint256 dayIndex, uint256 startPrice, bool isActive)'
];

// Fetch BTC price from CoinGecko
async function getBTCPrice() {
  try {
    const response = await axios.get(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd'
    );
    const price = response.data.bitcoin.usd;
    console.log(`📊 Current BTC Price: $${price.toLocaleString()}`);
    return Math.floor(price * 100); // Convert to cents
  } catch (error) {
    console.error('Error fetching BTC price:', error.message);
    throw error;
  }
}

// Resolve and start new day
async function resolveDailyMarket() {
  try {
    console.log('\n🔄 Starting daily market resolution...');
    console.log('Time:', new Date().toISOString());

    // Connect to contract
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

    // Get current market status
    const market = await contract.getTodayMarket();
    const isActive = market[2];
    
    console.log(`Current day: ${market[0]}, Active: ${isActive}`);

    // Only resolve if day is still active
    if (isActive) {
      // Get closing price
      const closePriceInCents = await getBTCPrice();
      
      console.log('📉 Resolving current day...');
      const resolveTx = await contract.resolveDay(closePriceInCents);
      await resolveTx.wait();
      console.log(`✅ Day resolved! Close price: $${closePriceInCents / 100}`);
      
      // Wait a moment before starting new day
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    // Get opening price for new day
    const openPriceInCents = await getBTCPrice();
    
    console.log('🌅 Starting new day...');
    const startTx = await contract.startNewDay(openPriceInCents);
    await startTx.wait();
    console.log(`✅ New day started! Open price: $${openPriceInCents / 100}`);
    
    console.log('🎉 Daily resolution complete!\n');
    
  } catch (error) {
    console.error('❌ Error in daily resolution:', error.message);
    throw error;
  }
}

// Schedule daily at midnight UTC
cron.schedule('0 0 * * *', async () => {
  console.log('⏰ Scheduled task triggered');
  try {
    await resolveDailyMarket();
  } catch (error) {
    console.error('Failed to resolve daily market:', error);
  }
});

console.log('🚀 BTC Leverage Trainer - Automation Service Started');
console.log('📅 Scheduled to run daily at 00:00 UTC');
console.log('Waiting for scheduled time...\n');

// Optional: Run immediately on startup for testing
if (process.env.RUN_ON_START === 'true') {
  console.log('▶️  Running immediate resolution for testing...');
  resolveDailyMarket().catch(console.error);
}

// Keep the process alive
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down automation service...');
  process.exit(0);
});
