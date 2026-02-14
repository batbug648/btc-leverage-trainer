import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './App.css';
import ConnectWallet from './components/ConnectWallet';
import UserBalance from './components/UserBalance';
import LeverageBox from './components/LeverageBox';
import PositionHistory from './components/PositionHistory';
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
      setCurrentDay(Number(market[0]));
      const priceInDollars = Number(market[1]) / 100;
      setBtcPrice(priceInDollars);
      const isActive = market[2];
      
      if (!isActive) {
        setTimeLeft(0);
      } else {
        setTimeLeft(3600);
      }
    } catch (error) {
      console.error('Error loading market:', error);
    }
  };

  // Load user data
  const loadUserData = async (contractInstance, address) => {
    try {
      const accountData = await contractInstance.getAccount(address);
      const balanceInDollars = Number(accountData[0]) / 100;
      setUserBalance(balanceInDollars);
      
      setUserStats({
        totalTrades: Number(accountData[1]),
        winningTrades: Number(accountData[2]),
        totalPnL: Number(accountData[3]),
        isNegativePnL: accountData[4],
        streak: Number(accountData[5]),
        bestStreak: Number(accountData[6])
      });
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleClaimBonus = async () => {
    if (!contract) return;
    try {
      const tx = await contract.claimDailyBonus();
      await tx.wait();
      
      // Get updated account to show new streak
      const accountData = await contract.getAccount(account);
      const newStreak = Number(accountData[5]);
      const bonusAmount = 5 + newStreak;
      
      alert(`🎉 Daily bonus claimed! You received $${bonusAmount} (Streak: ${newStreak} days)`);
      loadUserData(contract, account);
    } catch (error) {
      console.error('Error claiming bonus:', error);
      alert('Failed to claim bonus. You may have already claimed today.');
    }
  };

  const refreshData = () => {
    if (contract && account) {
      loadMarketData(contract);
      loadUserData(contract, account);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  return (
    <div className={`App ${darkMode ? 'dark-mode' : ''}`}>
      <header className="header">
        <div className="container">
          <h1>💰 BTC Leverage Trainer</h1>
          <p className="tagline">Learn leverage trading with virtual USD • Risk-free practice</p>
          {account && (
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

      <main className="container">
        {!account ? (
          <div className="welcome-section">
            <h2>👋 Welcome! Get Started</h2>
            <p>Initialize your account to receive $1,000 virtual money</p>
            <ConnectWallet onConnect={connectWallet} loading={loading} />
          </div>
        ) : (
          <>
            <UserBalance 
              balance={userBalance}
              stats={userStats}
              onClaimBonus={handleClaimBonus}
            />

            <PositionHistory 
              contract={contract}
              account={account}
              currentDay={currentDay}
              onSuccess={refreshData}
            />

            <section className="market-info">
              <h2>Today's BTC Price: ${btcPrice.toLocaleString()}</h2>
              <p>Will BTC close higher or lower than yesterday?</p>
              {timeLeft > 0 && <p className="time-left">Time left: {formatTime(timeLeft)}</p>}
            </section>

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

            <section className="education-section">
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
            </section>
          </>
        )}
      </main>

      <footer className="footer">
        <p>Built for Avalanche Retro9000 • Virtual money only - Learn risk-free!</p>
      </footer>
    </div>
  );
}

export default App;
