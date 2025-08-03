import React from 'react';

interface KiteIconProps {
  className?: string;
}

export const KiteIcon = ({ className = "w-4 h-4" }: KiteIconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 2L8 8L12 12L16 8L12 2Z" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="#10B981" fillOpacity="0.3"/>
    <path d="M12 12L8 18L12 22L16 18L12 12Z" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="#10B981" fillOpacity="0.3"/>
  </svg>
);
