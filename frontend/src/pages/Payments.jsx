import React, { useState, useEffect } from 'react';
import { DollarSign, CreditCard, Clock, CheckCircle, ArrowUpRight, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import paymentService from '../services/paymentService';
import projectService from '../services/projectService';
import './Payments.css';

const PaymentItem = ({ payment }) => (
  <div className="payment-item glass-panel">
    <div className="payment-icon-wrap" style={{ fontWeight: '800', fontSize: '1.2rem', color: 'var(--primary-color)' }}>
      ₹
    </div>
    <div className="payment-details">
      <p className="payment-project">Project #{payment.projectId}</p>
      <p className="payment-meta">To Freelancer #{payment.freelancerId}</p>
    </div>
    <div className="payment-amount">
      <span>₹{payment.amount?.toLocaleString('en-IN')}</span>
    </div>
    <div className={`payment-status ${payment.status?.toLowerCase()}`}>
      {payment.status === 'COMPLETED' ? <CheckCircle size={14} /> : <Clock size={14} />}
      {payment.status}
    </div>
  </div>
);

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { user } = useAuth();

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const data = await paymentService.getAllPayments();
        if (Array.isArray(data)) {
          const isFreelancer = user?.roles?.some(r => r.toUpperCase().includes('FREELANCER'));
          const isClient = user?.roles?.some(r => r.toUpperCase().includes('CLIENT'));
          
          if (isFreelancer) {
            const freelancerPayments = data.filter(p => p.freelancerId == user.id);
            setPayments(freelancerPayments);
          } else if (isClient) {
            // Fetch client's projects to get project IDs
            const clientProjects = await projectService.getProjectsByClient(user.id);
            const projectIds = Array.isArray(clientProjects) ? clientProjects.map(proj => proj.id) : [];
            const clientPayments = data.filter(p => projectIds.includes(p.projectId));
            setPayments(clientPayments);
          } else {
            // Admin or other role sees all payments
            setPayments(data);
          }
        } else {
          setPayments([]);
        }
      } catch (err) {
        setError('Failed to load payment history.');
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, [user]);

  const totalEarnings = payments.reduce((sum, p) => sum + (p.amount || 0), 0);


  return (
    <div className="payments-page animate-fade-in">
      <div className="payments-hero">
        <div className="container">
          <h1 className="payments-title">Payments & Earnings</h1>
          <p className="payments-subtitle">Manage your financial activity and transaction history.</p>
        </div>
      </div>

      <div className="container payments-body">
        <div className="payments-overview">
          <div className="stat-widget glass-panel">
            <div className="stat-widget-icon" style={{ background: 'rgba(16,185,129,0.2)' }}>
              <TrendingUp size={24} color="#10B981" />
            </div>
            <div>
              <p className="stat-widget-label">Total Volume</p>
              <h3 className="stat-widget-value">₹{totalEarnings.toLocaleString('en-IN')}</h3>
            </div>
          </div>
          <div className="stat-widget glass-panel">
            <div className="stat-widget-icon" style={{ background: 'rgba(79,70,229,0.2)' }}>
              <CreditCard size={24} color="#4F46E5" />
            </div>
            <div>
              <p className="stat-widget-label">Transactions</p>
              <h3 className="stat-widget-value">{payments.length}</h3>
            </div>
          </div>
        </div>

        <section className="payment-history">
          <div className="section-header">
            <h2 className="section-heading">Transaction History</h2>
            <button className="btn btn-secondary btn-sm">
              <ArrowUpRight size={14} /> Export CSV
            </button>
          </div>

          {loading ? (
            <div className="dash-loading">
              <span className="spinner"></span> Loading transactions…
            </div>
          ) : error ? (
            <div className="notif-error glass-panel">
              <p>{error}</p>
            </div>
          ) : payments.length === 0 ? (
            <div className="empty-state glass-panel">
              <CreditCard size={48} />
              <p>No transactions found.</p>
            </div>
          ) : (
            <div className="payments-list">
              {payments.map(payment => (
                <PaymentItem key={payment.id} payment={payment} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Payments;
