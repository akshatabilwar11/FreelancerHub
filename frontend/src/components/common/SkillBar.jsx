import React from 'react';

const SkillBar = ({ skill, percentage, color = '#14B8A6' }) => {
  return (
    <div className="skill-bar-container" style={{ marginBottom: '1.25rem' }}>
      <div className="skill-info" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginBottom: '0.5rem',
        fontSize: '0.9rem',
        fontWeight: '600',
        color: 'var(--text-primary)'
      }}>
        <span>{skill}</span>
        <span>{percentage}%</span>
      </div>
      <div className="skill-track" style={{ 
        height: '8px', 
        background: 'var(--border-color)', 
        borderRadius: '4px',
        overflow: 'hidden'
      }}>
        <div className="skill-fill" style={{ 
          width: `${percentage}%`, 
          height: '100%', 
          background: color,
          borderRadius: '4px',
          transition: 'width 1s ease-out'
        }}></div>
      </div>
    </div>
  );
};

export default SkillBar;
