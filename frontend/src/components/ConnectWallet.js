import React from 'react';
import './ConnectWallet.css';

function ConnectWallet({ onConnect, loading }) {
  return (
    <button 
      className="connect-wallet-btn" 
      onClick={onConnect}
      disabled={loading}
    >
      {loading ? '🔄 Connecting...' : '🦊 Connect Wallet'}
    </button>
  );
}

export default ConnectWallet;