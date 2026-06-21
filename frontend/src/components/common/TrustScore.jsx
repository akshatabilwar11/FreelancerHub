import React from 'react';
import { ShieldCheck, ShieldAlert, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const TrustScore = ({ score }) => {
  const { t } = useTranslation();
  
  const getStatus = () => {
    if (score >= 90) return { color: '#10b981', icon: <ShieldCheck size={18} />, label: 'Highly Trusted' };
    if (score >= 70) return { color: '#3b82f6', icon: <Shield size={18} />, label: 'Verified' };
    return { color: '#f59e0b', icon: <ShieldAlert size={18} />, label: 'At Risk' };
  };

  const status = getStatus();

  return (
    <div className="trust-score-badge" style={{ 
      display: 'inline-flex', 
      alignItems: 'center', 
      gap: '8px',
      padding: '6px 12px',
      borderRadius: '20px',
      background: `${status.color}15`,
      color: status.color,
      border: `1px solid ${status.color}30`,
      fontSize: '0.85rem',
      fontWeight: '700'
    }}>
      {status.icon}
      <span>{t('trust_score')}: {score}%</span>
    </div>
  );
};

export default TrustScore;
