import React from 'react';
import './UserBalance.css';

function UserBalance({ stats, onClaimBonus, onInitialize }) {
  if (!stats || stats.balance === 0) {
    return (
      <div className="user-balance init-needed">
        <h2>👋 Welcome! Get Started</h2>
        <p>Initialize your account to receive $1,000 virtual money</p>
        <button className="init-button" onClick={onInitialize}>
          💰 Initialize Account ($1,000)
        </button>
      </div>
    );
  }

  const winRate = stats.totalTrades > 0 ? ((stats.winningTrades / stats.totalTrades) * 100).toFixed(1) : 0;
  const pnlDisplay = stats.isNegativePnL ? `-$${stats.totalPnL.toFixed(2)}` : `+$${stats.totalPnL.toFixed(2)}`;
  const pnlClass = stats.isNegativePnL ? 'negative' : 'positive';

  return (
    <div className="user-balance">
      <div className="balance-header">
        <h2>Your Trading Account</h2>
        <button className="claim-bonus-btn" onClick={onClaimBonus}>
          🎁 Claim Daily Bonus
        </button>
      </div>
      <div className="stats-grid">
        <div className="stat-card main-balance">
          <div className="stat-label">Balance</div>
          <div className="stat-value big">${stats.balance.toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total P&L</div>
          <div className={`stat-value ${pnlClass}`}>{pnlDisplay}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Win Rate</div>
          <div className="stat-value">{winRate}%</div>
          <div className="stat-sub">{stats.winningTrades}/{stats.totalTrades} trades</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Streak</div>
          <div className="stat-value">🔥 {stats.streak}</div>
          <div className="stat-sub">Best: {stats.bestStreak}</div>
        </div>
      </div>
    </div>
  );
}

export default UserBalance;
