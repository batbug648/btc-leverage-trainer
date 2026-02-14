import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import './PositionHistory.css';

function PositionHistory({ contract, account, currentDay, onSuccess }) {
  const [yesterdayPositions, setYesterdayPositions] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadYesterdayPositions = useCallback(async () => {
    const yesterday = currentDay - 1;
    const positions = [];

    for (let leverage = 0; leverage <= 2; leverage++) {
      try {
        const pos = await contract.getPosition(yesterday, account, leverage);
        
        if (Number(pos.amount) > 0) {
          const market = await contract.dailyMarkets(yesterday);
          
          if (market.resolved) {
            positions.push({
              leverage,
              leverageName: leverage === 0 ? '1x Normal' : leverage === 1 ? '2x Leveraged' : '10x Leveraged',
              direction: Number(pos.direction) === 0 ? 'LONG' : 'SHORT',
              amount: Number(pos.amount) / 100,
              claimed: pos.claimed,
              liquidated: pos.liquidated,
              startPrice: Number(market.startPrice) / 100,
              endPrice: Number(market.endPrice) / 100,
              resolved: market.resolved
            });
          }
        }
      } catch (error) {
        console.error(`Error loading position ${leverage}:`, error);
      }
    }
    
    setYesterdayPositions(positions);
  }, [contract, account, currentDay]);

  useEffect(() => {
    if (contract && account && currentDay > 0) {
      loadYesterdayPositions();
    }
  }, [contract, account, currentDay, loadYesterdayPositions]);

  const closePosition = async (leverage) => {
    if (!contract) return;
    setLoading(true);
    try {
      const yesterday = currentDay - 1;
      
      // Get position data before closing
      const position = yesterdayPositions.find(p => p.leverage === leverage);
      const pnl = calculatePnL(position);
      
      const tx = await contract.closePosition(yesterday, leverage);
      await tx.wait();
      
      // Trigger confetti and sound for wins only!
      if (pnl.isProfit) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        playWinSound();
        alert('🎉 Winner! Position closed with profit!');
      } else {
        alert('Position closed. Better luck next time!');
      }
      
      loadYesterdayPositions();
      onSuccess();
    } catch (error) {
      console.error('Error closing position:', error);
      alert('Failed to close position.');
    } finally {
      setLoading(false);
    }
  };

  const calculatePnL = (position) => {
    const priceChange = ((position.endPrice - position.startPrice) / position.startPrice) * 100;
    const multiplier = position.leverage === 0 ? 1 : position.leverage === 1 ? 2 : 10;
    let pnlPercent = position.direction === 'LONG' ? priceChange * multiplier : -priceChange * multiplier;
    
    // Check for 10x liquidation
    let isLiquidated = false;
    if (position.leverage === 2) {
      if ((position.direction === 'LONG' && priceChange <= -10) ||
          (position.direction === 'SHORT' && priceChange >= 10)) {
        isLiquidated = true;
      }
    }
    
    const pnlAmount = isLiquidated ? -position.amount : (position.amount * pnlPercent) / 100;
    const finalAmount = isLiquidated ? 0 : Math.max(0, position.amount + pnlAmount);
    
    return {
      pnlAmount: pnlAmount,
      finalAmount: finalAmount,
      isProfit: pnlAmount > 0,
      priceChange: priceChange,
      isLiquidated: isLiquidated
    };
  };

  const playWinSound = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  if (yesterdayPositions.length === 0) {
    return null;
  }

  return (
    <div className="position-history">
      <h3>📊 Yesterday's Positions - Ready to Close!</h3>
      <div className="positions-grid">
        {yesterdayPositions.map((pos, idx) => {
          const pnl = calculatePnL(pos);
          return (
            <div key={idx} className={`position-card ${pnl.isProfit ? 'profit' : 'loss'}`}>
              <div className="position-header">
                <h4>{pos.leverageName}</h4>
                <span className={`direction ${pos.direction.toLowerCase()}`}>
                  {pos.direction === 'LONG' ? '📈' : '📉'} {pos.direction}
                </span>
              </div>
              <div className="position-details">
                <div className="detail-row">
                  <span>Amount:</span><span>${pos.amount.toFixed(2)}</span>
                </div>
                <div className="detail-row">
                  <span>BTC Price:</span>
                  <span>${pos.startPrice.toLocaleString()} → ${pos.endPrice.toLocaleString()}</span>
                </div>
                <div className="detail-row">
                  <span>Change:</span>
                  <span className={pnl.priceChange >= 0 ? 'positive' : 'negative'}>
                    {pnl.priceChange >= 0 ? '+' : ''}{pnl.priceChange.toFixed(2)}%
                  </span>
                </div>
              </div>
              <div className={`pnl-display ${pnl.isProfit ? 'profit' : 'loss'}`}>
                <div className="pnl-label">Your P&L:</div>
                <div className="pnl-value">
                  {pnl.isProfit ? '+' : ''}{pnl.pnlAmount >= 0 ? '$' : '-$'}{Math.abs(pnl.pnlAmount).toFixed(2)}
                </div>
                <div className="final-amount">Final: ${pnl.finalAmount.toFixed(2)}</div>
              </div>
              {pos.claimed ? (
                <div className="claimed-badge">✅ Claimed</div>
              ) : pnl.isLiquidated ? (
                <div className="liquidated-badge">💥 Liquidated</div>
              ) : (
                <button className="close-btn" onClick={() => closePosition(pos.leverage)} disabled={loading}>
                  {loading ? 'Closing...' : `Close & Claim ${pnl.isProfit ? '🎉' : ''}`}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PositionHistory;
