import React from 'react';
import { Calendar, AlertTriangle, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AvailabilityBadge = ({ status }) => {
  const { t } = useTranslation();
  
  const getStatusInfo = () => {
    switch (status) {
      case 'AVAILABLE':
        return { color: '#10b981', icon: <Calendar size={14} />, label: 'Available' };
      case 'BUSY':
        return { color: '#f59e0b', icon: <Clock size={14} />, label: 'Busy' };
      case 'OVERLOADED':
        return { color: '#ef4444', icon: <AlertTriangle size={14} />, label: 'Overloaded' };
      default:
        return { color: '#94a3b8', icon: <Calendar size={14} />, label: 'Unknown' };
    }
  };

  const info = getStatusInfo();

  return (
    <div className="availability-badge" style={{ 
      display: 'inline-flex', 
      alignItems: 'center', 
      gap: '6px',
      padding: '4px 10px',
      borderRadius: '6px',
      background: `${info.color}15`,
      color: info.color,
      fontSize: '0.75rem',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    }}>
      {info.icon}
      <span>{info.label}</span>
    </div>
  );
};

export default AvailabilityBadge;
