import React from 'react';
import './UserStats.css';

function UserStats({ stats, onClaimBonus }) {
  if (!stats) {
    return (
      <div className="user-stats loading">
        <p>Loading stats...</p>
      </div>
    );
  }

  const accuracy = stats.total > 0 ? ((stats.correct / stats.total) * 100).toFixed(1) : 0;

  return (
    <div className="user-stats">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-value">{stats.points}</div>
          <div className="stat-label">Points</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-value">{stats.streak}</div>
          <div className="stat-label">Daily Streak</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-value">{stats.bestStreak}</div>
          <div className="stat-label">Best Streak</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-value">{accuracy}%</div>
          <div className="stat-label">Accuracy</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Predictions</div>
        </div>

        <div className="stat-card action-card">
          <button className="claim-bonus-btn" onClick={onClaimBonus}>
            🎁 Claim Daily Bonus
          </button>
          <div className="stat-label">+10 points per day</div>
        </div>
      </div>
    </div>
  );
}

export default UserStats;
