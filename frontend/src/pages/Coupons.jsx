import React from 'react';
import { Ticket, Percent, Zap, Gift, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import './Coupons.css';

const CouponCard = ({ code, discount, description, type, expiry }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const Icon = type === 'special' ? Zap : type === 'seasonal' ? Gift : Percent;

  return (
    <div className={`coupon-card ${type}`}>
      <div className="coupon-left">
        <div className="coupon-icon">
          <Icon size={24} />
        </div>
      </div>
      <div className="coupon-middle">
        <div className="coupon-discount">{discount} OFF</div>
        <div className="coupon-code-wrap" onClick={copyToClipboard}>
          <span className="coupon-code">{code}</span>
          <button className="copy-btn">
            {copied ? <Check size={14} className="text-green" /> : <Copy size={14} />}
          </button>
          {copied && <span className="copy-tooltip">Copied!</span>}
        </div>
        <p className="coupon-desc">{description}</p>
        <span className="coupon-expiry">Expires: {expiry}</span>
      </div>
    </div>
  );
};

const Coupons = () => {
  const availableCoupons = [
    {
      code: 'WELCOME25',
      discount: '25%',
      description: 'First project concession for new users.',
      type: 'special',
      expiry: 'Dec 2026'
    },
    {
      code: 'SUMMER_DEV',
      discount: '15%',
      description: 'Seasonal discount for developer services.',
      type: 'seasonal',
      expiry: 'Aug 2026'
    },
    {
      code: 'FASTTRACK',
      discount: '10%',
      description: 'Reduce service fees for priority projects.',
      type: 'standard',
      expiry: 'No Expiry'
    },
    {
      code: 'PREMIUM_HUB',
      discount: '$50',
      description: 'Flat concession for premium project postings.',
      type: 'special',
      expiry: 'Oct 2026'
    }
  ];

  return (
    <div className="coupons-page animate-fade-in">
      <div className="coupons-hero">
        <div className="container">
          <h1 className="coupons-title">Coupons & Concessions</h1>
          <p className="coupons-subtitle">Save on your next project with exclusive offers and rewards.</p>
        </div>
      </div>

      <div className="container coupons-body">
        <div className="coupons-grid">
          {availableCoupons.map((coupon, index) => (
            <CouponCard key={index} {...coupon} />
          ))}
        </div>

        <div className="rewards-section glass-panel">
          <div className="rewards-info">
            <h3>How it works?</h3>
            <p>Apply these codes during checkout or when submitting a project proposal to receive immediate price concessions. Some codes are limited to specific categories.</p>
          </div>
          <button className="btn btn-primary">Learn More</button>
        </div>
      </div>
    </div>
  );
};

export default Coupons;
