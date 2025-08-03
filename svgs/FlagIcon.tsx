import React from 'react';

interface FlagIconProps {
  className?: string;
}

export const FlagIcon = ({ className = "w-4 h-4" }: FlagIconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} style={{ transform: 'scaleX(-1)' }}>
    <path d="M4 15V21M4 15L8 12L12 15L16 12L20 15V3L16 6L12 3L8 6L4 3V15Z" stroke="#00eeff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="#00eeff" fillOpacity="0.3"/>
  </svg>
);
