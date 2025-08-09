import React from 'react';

interface EventIconProps {
  className?: string;
}

export const EventIcon = ({ className = "w-4 h-4" }: EventIconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="#8B5CF6" fillOpacity="0.3"/>
  </svg>
);
