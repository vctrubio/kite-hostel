import React from 'react';

interface PaymentIconProps {
  className?: string;
}

export const PaymentIcon = ({ className = "w-4 h-4" }: PaymentIconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="2" y="5" width="20" height="14" rx="2" stroke="#10B981" strokeWidth="2"/>
    <path d="M2 10H22" stroke="#10B981" strokeWidth="2"/>
    <path d="M6 15H8" stroke="#10B981" strokeWidth="2"/>
    <path d="M12 15H18" stroke="#10B981" strokeWidth="2"/>
  </svg>
);
