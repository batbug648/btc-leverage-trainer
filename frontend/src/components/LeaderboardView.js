import React, { useState, useEffect } from 'react';
import './LeaderboardView.css';

function LeaderboardView({ contract }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardType, setLeaderboardType] = useState(0); // 0 = POINTS

  useEffect(() => {
    loadLeaderboard();
  }, [contract, leaderboardType]);

  const loadLeaderboard = async () => {
    if (!contract) return;
    try {
      const board = await contract.getTopN(leaderboardType, 10);
      const entries = board
        .filter(entry => entry.user !== '0x0000000000000000000000000000000000000000')
        .map((entry, index) => ({
          rank: index + 1,
          address: entry.user,
          score: Number(entry.score),
          timestamp: Number(entry.timestamp)
        }));
      setLeaderboard(entries);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    }
  };

  const getLeaderboardName = (type) => {
    const names = ['Points', 'Streak', 'Best Streak', 'Accuracy', 'Total Predictions'];
    return names[type] || 'Points';
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="leaderboard-view">
      <h2>🏆 Leaderboard</h2>

      <div className="leaderboard-tabs">
        <button 
          className={leaderboardType === 0 ? 'active' : ''} 
          onClick={() => setLeaderboardType(0)}
        >
          💰 Points
        </button>
        <button 
          className={leaderboardType === 1 ? 'active' : ''} 
          onClick={() => setLeaderboardType(1)}
        >
          🔥 Streak
        </button>
        <button 
          className={leaderboardType === 2 ? 'active' : ''} 
          onClick={() => setLeaderboardType(2)}
        >
          ⭐ Best Streak
        </button>
        <button 
          className={leaderboardType === 3 ? 'active' : ''} 
          onClick={() => setLeaderboardType(3)}
        >
          🎯 Accuracy
        </button>
      </div>

      <div className="leaderboard-table">
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player</th>
              <th>{getLeaderboardName(leaderboardType)}</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.length > 0 ? (
              leaderboard.map((entry) => (
                <tr key={entry.rank}>
                  <td className="rank">
                    {entry.rank === 1 && '🥇'}
                    {entry.rank === 2 && '🥈'}
                    {entry.rank === 3 && '🥉'}
                    {entry.rank > 3 && `#${entry.rank}`}
                  </td>
                  <td className="address">{formatAddress(entry.address)}</td>
                  <td className="score">{entry.score}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="empty">
                  No entries yet. Be the first!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default LeaderboardView;
