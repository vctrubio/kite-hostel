import React from 'react';

interface EquipmentIconProps {
  className?: string;
}

export const EquipmentIcon = ({ className = "w-4 h-4" }: EquipmentIconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="3" y="6" width="18" height="12" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="#8B5CF6" fillOpacity="0.1"/>
    <path d="M3 6L12 2L21 6" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="#8B5CF6" fillOpacity="0.2"/>
    <path d="M12 2V6" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 10H16" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 14H16" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
