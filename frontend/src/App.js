import React, { useState } from 'react';
import { ethers } from 'ethers';
import './App.css';
import LeverageBox from './components/LeverageBox';
import UserBalance from './components/UserBalance';
import ConnectWallet from './components/ConnectWallet';
import PositionHistory from './components/PositionHistory';

// Import contract ABI
import BTCLeverageTrainerABI from './contracts/BTCLeverageTrainer.json';

function App() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [userBalance, setUserBalance] = useState(0);
  const [userStats, setUserStats] = useState(null);
  const [btcPrice, setBtcPrice] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentDay, setCurrentDay] = useState(0);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const CONTRACT_ADDRESS = process.env.REACT_APP_LEVERAGE_TRAINER_ADDRESS;

  // Connect wallet
  const connectWallet = async () => {
  if (window.ethereum) {
    setLoading(true);
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      const web3Signer = await web3Provider.getSigner();
      const address = await web3Signer.getAddress();

      setAccount(address);

      const leverageContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        BTCLeverageTrainerABI,
        web3Signer
      );
      setContract(leverageContract);

      loadMarketData(leverageContract);
      loadUserData(leverageContract, address);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet. Make sure you\'re on Avalanche C-Chain network.');
    } finally {
      setLoading(false);
    }
  } else {
    alert('Please install MetaMask!');
  }
};
       

  // Load market data
  const loadMarketData = async (contractInstance) => {
    try {
      const market = await contractInstance.getTodayMarket();
      const priceInCents = Number(market[1]);
      const price = priceInCents / 100;
      setBtcPrice(price);
      setTimeLeft(Number(market[2]));
      setCurrentDay(Number(market[0]));
    } catch (error) {
      console.error('Error loading market:', error);
    }
  };

  // Load user data
  const loadUserData = async (contractInstance, address) => {
    try {
      const account = await contractInstance.getAccount(address);
      const balanceInCents = Number(account[0]);
      const balance = balanceInCents / 100;
      
      setUserBalance(balance);
      setUserStats({
        balance: balance,
        totalTrades: Number(account[1]),
        winningTrades: Number(account[2]),
        totalPnL: Number(account[3]) / 100,
        isNegativePnL: account[4],
        streak: Number(account[5]),
        bestStreak: Number(account[6])
      });
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  // Initialize account
  const handleInitialize = async () => {
    if (!contract) return;
    try {
      const tx = await contract.initializeAccount();
      await tx.wait();
      alert('Account initialized! You have $1,000 to start trading! 🎉');
      loadUserData(contract, account);
    } catch (error) {
      console.error('Error initializing:', error);
      alert('Failed to initialize. You may already have an account.');
    }
  };

  // Claim daily bonus
  const handleClaimBonus = async () => {
  if (!contract) return;
  try {
    const tx = await contract.claimDailyBonus();
    const receipt = await tx.wait();
    
    // Get updated account to show new streak
    const accountData = await contract.getAccount(account);
    const newStreak = Number(accountData[5]);
    const bonusAmount = 5 + newStreak; // $5 base + $1 per streak day
    
    alert(`🎉 Daily bonus claimed! You received $${bonusAmount} (Streak: ${newStreak} days)`);
    loadUserData(contract, account);
  } catch (error) {
    console.error('Error claiming bonus:', error);
    alert('Failed to claim bonus. You may have already claimed today.');
  }
};

  // Refresh data
  const refreshData = () => {
    if (contract && account) {
      loadMarketData(contract);
      loadUserData(contract, account);
    }
  };

  // Format time left
  const formatTimeLeft = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
   <div className={`App ${darkMode ? 'dark-mode' : ''}`}>
      <header className="header">
        <div className="container">
          <h1>💰 BTC Leverage Trainer</h1>
          <p className="tagline">Learn leverage trading with virtual USD • Risk-free practice</p>
          {!account ? (
           <ConnectWallet onConnect={connectWallet} loading={loading} />
          ) : (
            <div className="user-info">
              <span className="address">{account.slice(0, 6)}...{account.slice(-4)}</span>
              <span className="balance">${userBalance.toFixed(2)}</span>
            </div>
          )}
        </div>
        <button 
         className="dark-mode-toggle"
         onClick={() => setDarkMode(!darkMode)}
         title="Toggle dark mode"
        >
         {darkMode ? '☀️' : '🌙'}
        </button>
      </header>

      {account ? (
        <main className="main">
          <div className="container">
            {/* User Balance Section */}
            {userStats && (
              <UserBalance 
                stats={userStats} 
                onClaimBonus={handleClaimBonus}
                onInitialize={handleInitialize}
              />
            )}

            {/* Position History - Yesterday's positions */}
            {contract && currentDay > 0 && (
              <PositionHistory 
                contract={contract}
                account={account}
                currentDay={currentDay}
                onSuccess={refreshData}
              />
            )}

            {/* Market Info */}
            <div className="market-info">
              <h2>Today's BTC Price: ${btcPrice.toLocaleString('en-US', {minimumFractionDigits: 2})}</h2>
              <p className="question">Will BTC close higher or lower than yesterday?</p>
              {timeLeft > 0 && <p className="time-left">Time left: {formatTimeLeft(timeLeft)}</p>}
            </div>

            {/* Three Leverage Boxes */}
            <div className="leverage-grid">
              <LeverageBox
                title="1x Normal"
                subtitle="Safe Trading"
                leverage={0}
                icon="📊"
                description="1:1 leverage - Standard trading with no multiplier"
                example="BTC up 5% → You gain 5%"
                contract={contract}
                account={account}
                onSuccess={refreshData}
              />

              <LeverageBox
                title="2x Leveraged"
                subtitle="Moderate Risk"
                leverage={1}
                icon="⚡"
                description="2:1 leverage - Double the gains AND losses"
                example="BTC up 5% → You gain 10%"
                contract={contract}
                account={account}
                onSuccess={refreshData}
              />

              <LeverageBox
                title="10x Leveraged"
                subtitle="HIGH RISK"
                leverage={2}
                icon="🔥"
                description="10:1 leverage - 10x gains/losses. Can get liquidated!"
                example="BTC up 5% → You gain 50%"
                warning="⚠️ BTC moves -10% against you = LIQUIDATED (lose everything)"
                contract={contract}
                account={account}
                onSuccess={refreshData}
              />
            </div>

            {/* Educational Info */}
            <div className="education-section">
              <h3>💡 How It Works</h3>
              <div className="edu-grid">
                <div className="edu-card">
                  <h4>LONG</h4>
                  <p>Bet BTC will go UP. You profit when price rises.</p>
                </div>
                <div className="edu-card">
                  <h4>SHORT</h4>
                  <p>Bet BTC will go DOWN. You profit when price falls.</p>
                </div>
                <div className="edu-card">
                  <h4>Leverage</h4>
                  <p>Multiplies your gains AND losses. Higher leverage = higher risk!</p>
                </div>
                <div className="edu-card">
                  <h4>Liquidation</h4>
                  <p>At 10x, if BTC moves -10% against you, you lose everything.</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      ) : (
        <div className="welcome">
          <div className="container">
            <h2>Learn Leverage Trading Without Risk! 🎯</h2>
            <p>Practice with virtual USD and understand how leverage works</p>
            <ul className="features">
              <li>💰 Start with $1,000 virtual money</li>
              <li>📊 Three leverage options: 1x, 2x, 10x</li>
              <li>📈 Daily BTC predictions (higher or lower)</li>
              <li>🎓 Learn about LONG, SHORT, and liquidation</li>
              <li>⚡ Built on Avalanche for instant transactions</li>
            </ul>
            <button className="cta-button" onClick={connectWallet}>
              Connect Wallet to Start Learning
            </button>
          </div>
        </div>
      )}

      <footer className="footer">
        <div className="container">
          <p>Built for Avalanche Retro9000 • Virtual money only - Learn risk-free!</p>
        </div>
      </footer>
    </div>
  );
}

export default App;