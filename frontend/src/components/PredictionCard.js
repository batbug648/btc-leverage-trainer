import React, { useState, useEffect } from 'react';
import './PredictionCard.css';

function PredictionCard({ prediction, onPlaceStake, userAddress, contract }) {
  const [stakeAmount, setStakeAmount] = useState(50);
  const [userPosition, setUserPosition] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    loadUserPosition();
    updateTimeLeft();
    const timer = setInterval(updateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [prediction.id, userAddress]);

  const loadUserPosition = async () => {
    if (!contract || !userAddress) return;
    try {
      const pos = await contract.getUserPosition(prediction.id, userAddress);
      setUserPosition({
        yesStake: Number(pos.yesStake),
        noStake: Number(pos.noStake),
        claimed: pos.claimed
      });
    } catch (error) {
      console.error('Error loading position:', error);
    }
  };

  const updateTimeLeft = () => {
    const now = Date.now() / 1000;
    const remaining = prediction.endTime - now;
    
    if (remaining <= 0) {
      setTimeLeft('Ended');
    } else {
      const hours = Math.floor(remaining / 3600);
      const minutes = Math.floor((remaining % 3600) / 60);
      setTimeLeft(`${hours}h ${minutes}m`);
    }
  };

  const handleStake = (isYes) => {
    if (stakeAmount < 10) {
      alert('Minimum stake is 10 points');
      return;
    }
    onPlaceStake(prediction.id, isYes, stakeAmount);
  };

  const getCategoryEmoji = (category) => {
    const emojis = {
      'crypto': '₿',
      'sports': '⚽',
      'weather': '🌤️',
      'memes': '😂',
      'markets': '📈'
    };
    return emojis[category] || '🎯';
  };

  const totalStake = prediction.totalYesStake + prediction.totalNoStake;
  const yesPercent = totalStake > 0 ? (prediction.totalYesStake / totalStake * 100).toFixed(1) : 50;
  const noPercent = totalStake > 0 ? (prediction.totalNoStake / totalStake * 100).toFixed(1) : 50;

  return (
    <div className="prediction-card">
      <div className="prediction-header">
        <span className="category-badge">
          {getCategoryEmoji(prediction.category)} {prediction.category}
        </span>
        <span className="time-left">{timeLeft}</span>
      </div>

      <h3 className="prediction-question">{prediction.question}</h3>

      <div className="odds-display">
        <div className="odds-bar">
          <div className="yes-bar" style={{ width: `${yesPercent}%` }}></div>
          <div className="no-bar" style={{ width: `${noPercent}%` }}></div>
        </div>
        <div className="odds-labels">
          <span className="yes-label">YES {yesPercent}%</span>
          <span className="no-label">NO {noPercent}%</span>
        </div>
      </div>

      {userPosition && (userPosition.yesStake > 0 || userPosition.noStake > 0) && (
        <div className="user-position">
          <p>Your position:</p>
          {userPosition.yesStake > 0 && <span className="position-yes">YES: {userPosition.yesStake} pts</span>}
          {userPosition.noStake > 0 && <span className="position-no">NO: {userPosition.noStake} pts</span>}
        </div>
      )}

      <div className="stake-controls">
        <div className="amount-selector">
          <label>Stake amount:</label>
          <div className="amount-buttons">
            <button onClick={() => setStakeAmount(10)} className={stakeAmount === 10 ? 'active' : ''}>10</button>
            <button onClick={() => setStakeAmount(50)} className={stakeAmount === 50 ? 'active' : ''}>50</button>
            <button onClick={() => setStakeAmount(100)} className={stakeAmount === 100 ? 'active' : ''}>100</button>
            <button onClick={() => setStakeAmount(250)} className={stakeAmount === 250 ? 'active' : ''}>250</button>
          </div>
        </div>

        <div className="prediction-buttons">
          <button 
            className="btn-yes" 
            onClick={() => handleStake(true)}
            disabled={timeLeft === 'Ended'}
          >
            ✅ YES / LONG
          </button>
          <button 
            className="btn-no" 
            onClick={() => handleStake(false)}
            disabled={timeLeft === 'Ended'}
          >
            ❌ NO / SHORT
          </button>
        </div>
      </div>

      <div className="prediction-stats">
        <span>Total staked: {totalStake} pts</span>
        <span>Participants: {Math.floor(totalStake / 50)}</span>
      </div>
    </div>
  );
}

export default PredictionCard;
