import React, { useState, useEffect } from 'react';
import { Maximize, Camera, X, CheckCircle, Zap } from 'lucide-react';

const PaymentScanner = ({ onScanSuccess, onCancel }) => {
  const [scanning, setScanning] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (scanning) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setScanning(false);
            setTimeout(() => onScanSuccess(), 800);
            return 100;
          }
          return prev + 5;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [scanning, onScanSuccess]);

  return (
    <div className="scanner-container glass-panel" style={{
      position: 'relative',
      width: '100%',
      maxWidth: '350px',
      height: '350px',
      margin: '0 auto',
      overflow: 'hidden',
      borderRadius: '24px',
      border: '2px solid var(--primary-color)',
      background: '#000'
    }}>
      {/* Simulated Camera View */}
      <div className="camera-view" style={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(45deg, #1a1a1a 25%, #262626 50%, #1a1a1a 75%)',
        backgroundSize: '200% 200%',
        animation: 'shimmer 3s infinite linear',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}>
        {/* Scanning Line Animation */}
        {scanning && (
          <div className="scan-line" style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '4px',
            background: 'var(--primary-color)',
            boxShadow: '0 0 15px var(--primary-color)',
            animation: 'scan 2s infinite ease-in-out',
            zIndex: 10
          }}></div>
        )}

        {/* QR Frame */}
        <div className="qr-frame" style={{
          width: '200px',
          height: '200px',
          border: '2px solid rgba(255,255,255,0.3)',
          borderRadius: '16px',
          position: 'relative'
        }}>
          <div className="corner tl" style={{ position: 'absolute', top: -2, left: -2, width: 20, height: 20, borderTop: '4px solid var(--primary-color)', borderLeft: '4px solid var(--primary-color)', borderTopLeftRadius: 8 }}></div>
          <div className="corner tr" style={{ position: 'absolute', top: -2, right: -2, width: 20, height: 20, borderTop: '4px solid var(--primary-color)', borderRight: '4px solid var(--primary-color)', borderTopRightRadius: 8 }}></div>
          <div className="corner bl" style={{ position: 'absolute', bottom: -2, left: -2, width: 20, height: 20, borderBottom: '4px solid var(--primary-color)', borderLeft: '4px solid var(--primary-color)', borderBottomLeftRadius: 8 }}></div>
          <div className="corner br" style={{ position: 'absolute', bottom: -2, right: -2, width: 20, height: 20, borderBottom: '4px solid var(--primary-color)', borderRight: '4px solid var(--primary-color)', borderBottomRightRadius: 8 }}></div>
          
          {!scanning && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#10b981' }}>
              <CheckCircle size={64} style={{ animation: 'pop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }} />
            </div>
          )}
        </div>

        <div className="scanner-info" style={{
          position: 'absolute',
          bottom: '20px',
          color: '#fff',
          fontSize: '0.8rem',
          textAlign: 'center',
          width: '100%'
        }}>
          {scanning ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Zap size={14} fill="currentColor" />
              <span>Align QR code within the frame</span>
            </div>
          ) : (
            <span style={{ color: '#10b981', fontWeight: '700' }}>QR Code Detected!</span>
          )}
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 10%; }
          50% { top: 90%; }
          100% { top: 10%; }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes pop {
          0% { transform: scale(0); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default PaymentScanner;
