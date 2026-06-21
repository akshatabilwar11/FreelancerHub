import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import paymentService from '../services/paymentService';
import projectService from '../services/projectService';
import PaymentScanner from './common/PaymentScanner';
import { X, Camera, QrCode } from 'lucide-react';

const PaymentModal = ({ project, onClose, onActivated }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState('display'); // 'display' or 'scan'
  
  // Hardcoded freelancerId for demo purposes, or default to 0 if not assigned.
  // In a real scenario, activation pays platform escrow before freelancer is assigned.
  const escrowFreelancerId = 0; 
  
  const paymentData = {
    projectId: project.id,
    freelancerId: escrowFreelancerId,
    amount: project.budget,
    status: 'ESCROWED'
  };

  const handleSimulatePayment = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Process Payment
      await paymentService.processPayment(paymentData);
      
      // 2. Activate Project
      await projectService.activateProject(project.id);
      
      onActivated(); // Callback to refresh the dashboard
      onClose(); // Close the modal
    } catch (err) {
      console.error(err);
      setError('Payment or activation failed. Please check backend logs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', 
      justifyContent: 'center', alignItems: 'center', zIndex: 2000
    }}>
      <div className="glass-panel" style={{
        background: 'var(--bg-card)', padding: '2rem', borderRadius: '12px', 
        width: '90%', maxWidth: '400px', position: 'relative', textAlign: 'center'
      }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', cursor: 'pointer' }}>
          <X size={24} color="var(--text-secondary)" />
        </button>
        
        <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Activate Project</h2>
        <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
          To activate <strong>{project.title}</strong>, please deposit the project budget of ₹{project.budget} into the secure escrow.
        </p>
        
        <div className="payment-mode-toggle" style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <button 
            className={`btn ${mode === 'display' ? 'btn-primary' : 'btn-outline'}`} 
            style={{ padding: '6px 16px', fontSize: '13px' }}
            onClick={() => setMode('display')}
          >
            <QrCode size={14} style={{ marginRight: '6px' }} /> Show QR
          </button>
          <button 
            className={`btn ${mode === 'scan' ? 'btn-primary' : 'btn-outline'}`} 
            style={{ padding: '6px 16px', fontSize: '13px' }}
            onClick={() => setMode('scan')}
          >
            <Camera size={14} style={{ marginRight: '6px' }} /> Scan to Pay
          </button>
        </div>
        
        {mode === 'display' ? (
          <div style={{ background: 'white', padding: '1rem', display: 'inline-block', borderRadius: '8px', marginBottom: '1.5rem' }}>
            <QRCodeSVG 
              value={JSON.stringify({ projectId: project.id, amount: project.budget, type: 'ESCROW_DEPOSIT' })} 
              size={200} 
            />
          </div>
        ) : (
          <div style={{ marginBottom: '1.5rem' }}>
            <PaymentScanner onScanSuccess={handleSimulatePayment} onCancel={() => setMode('display')} />
          </div>
        )}
        
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Scan with your payment app, or simulate it below.</p>
        
        {error && <div style={{ color: 'red', marginBottom: '1rem', fontSize: '14px' }}>{error}</div>}
        
        <button 
          className="btn btn-primary" 
          style={{ width: '100%', padding: '0.75rem' }} 
          onClick={handleSimulatePayment}
          disabled={loading}
        >
          {loading ? 'Processing...' : `Simulate Payment of ₹${project.budget}`}
        </button>
      </div>
    </div>
  );
};

export default PaymentModal;
