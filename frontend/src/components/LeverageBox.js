import React, { useState } from 'react';
import './LeverageBox.css';

function LeverageBox({ title, subtitle, leverage, icon, description, example, warning, contract, account, onSuccess }) {
  const [amount, setAmount] = useState(100);
  const [selectedDirection, setSelectedDirection] = useState(null);

  const openPosition = async (isLong) => {
  if (!contract) {
    alert('⚠️ Please connect your wallet first');
    return;
  }
  if (amount < 10) {
    alert('⚠️ Minimum position is $10');
    return;
  }
  try {
    const amountInCents = Math.floor(amount * 100);
    const direction = isLong ? 0 : 1;
    const tx = await contract.openPosition(direction, leverage, amountInCents);
    await tx.wait();
    alert(`✅ Position opened! ${isLong ? 'LONG' : 'SHORT'} $${amount} at ${title}`);
    setSelectedDirection(isLong ? 'LONG' : 'SHORT');
    onSuccess();
  } catch (error) {
    console.error('Error:', error);
    if (error.message.includes('insufficient funds') || error.message.includes('Insufficient balance')) {
      alert('⚠️ Insufficient balance. You need more virtual USD.');
    } else if (error.message.includes('Already have position')) {
      alert('⚠️ You already have a position for this leverage level today.');
    } else if (error.message.includes('Trading not active')) {
      alert('⚠️ Trading day has ended. Wait for the next day to start.');
    } else if (error.message.includes('user rejected')) {
      alert('❌ Transaction cancelled');
    } else {
      alert('⚠️ Failed to open position. Please try again.');
    }
  }
};
 
  return (
    <div className={`leverage-box leverage-${leverage}`}>
      <div className="box-header">
        <div className="box-icon">{icon}</div>
        <div className="box-title">
          <h3>{title}</h3>
          <p className="subtitle">{subtitle}</p>
        </div>
      </div>
      <div className="box-description">
        <p>{description}</p>
        <p className="example">{example}</p>
        {warning && <p className="warning">{warning}</p>}
      </div>
      <div className="position-controls">
        <div className="amount-input">
          <label>Amount (USD):</label>
          <div className="input-group">
            <span className="dollar-sign">$</span>
            <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} min="10" step="10" />
          </div>
        </div>
        <div className="quick-amounts">
          <button onClick={() => setAmount(50)}>$50</button>
          <button onClick={() => setAmount(100)}>$100</button>
          <button onClick={() => setAmount(250)}>$250</button>
          <button onClick={() => setAmount(500)}>$500</button>
        </div>
        <div className="direction-buttons">
          <button className="btn-long" onClick={() => openPosition(true)} disabled={selectedDirection !== null}>
            📈 LONG
          </button>
          <button className="btn-short" onClick={() => openPosition(false)} disabled={selectedDirection !== null}>
            📉 SHORT
          </button>
        </div>
        {selectedDirection && (
          <div className="position-active">
            <p>✅ {selectedDirection} position active!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default LeverageBox;
