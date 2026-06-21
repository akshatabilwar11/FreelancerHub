import React from 'react';

const OnlineStatus = ({ isOnline }) => {
  return (
    <div className="online-status" style={{ 
      display: 'inline-flex', 
      alignItems: 'center', 
      gap: '6px',
      fontSize: '0.85rem',
      fontWeight: '600'
    }}>
      <span style={{ 
        width: '8px', 
        height: '8px', 
        borderRadius: '50%', 
        background: isOnline ? '#10b981' : '#94a3b8',
        boxShadow: isOnline ? '0 0 8px rgba(16, 185, 129, 0.5)' : 'none'
      }}></span>
      <span style={{ color: isOnline ? '#10b981' : 'var(--text-secondary)' }}>
        {isOnline ? 'Online' : 'Offline'}
      </span>
    </div>
  );
};

export default OnlineStatus;
