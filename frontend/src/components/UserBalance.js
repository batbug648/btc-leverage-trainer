import React from 'react';
import './UserBalance.css';

function UserBalance({ balance, stats, onClaimBonus }) {
  const winRate = stats && stats.totalTrades > 0 
    ? ((stats.winningTrades / stats.totalTrades) * 100).toFixed(1) 
    : '0.0';

  return (
    <div className="user-balance">
      <h3>Your Trading Account</h3>
      <button className="bonus-btn" onClick={onClaimBonus}>
        🎁 Claim Daily Bonus
      </button>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Balance</div>
          <div className="stat-value">${balance ? balance.toFixed(2) : '0.00'}</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-label">Total P&L</div>
          <div className="stat-value">
            {stats?.isNegativePnL ? '-' : '+'}${stats ? (stats.totalPnL / 100).toFixed(2) : '0.00'}
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-label">Win Rate</div>
          <div className="stat-value">
            {winRate}%
            <div className="stat-subtext">
              {stats?.winningTrades || 0}/{stats?.totalTrades || 0} trades
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-label">Streak</div>
          <div className="stat-value">
            🔥 {stats?.streak || 0}
            <div className="stat-subtext">Best: {stats?.bestStreak || 0}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserBalance;
