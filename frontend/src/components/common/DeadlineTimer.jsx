import React from 'react';
import { differenceInDays, formatDistanceToNow, isPast } from 'date-fns';
import { Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const DeadlineTimer = ({ deadline }) => {
  const { t } = useTranslation();
  if (!deadline) return null;

  const date = new Date(deadline);
  const isExpired = isPast(date);
  const daysLeft = differenceInDays(date, new Date());

  const getStatusColor = () => {
    if (isExpired) return '#ef4444'; // Red
    if (daysLeft <= 3) return '#f59e0b'; // Amber
    return '#10b981'; // Green
  };

  return (
    <div className="deadline-timer" style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '6px', 
      color: getStatusColor(),
      fontWeight: '600',
      fontSize: '0.85rem'
    }}>
      <Clock size={14} />
      <span>
        {isExpired 
          ? 'Expired' 
          : daysLeft === 0 
            ? 'Due today' 
            : t('days_left', { count: daysLeft })
        }
      </span>
    </div>
  );
};

export default DeadlineTimer;
