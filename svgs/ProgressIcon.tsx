import React from 'react';

interface ProgressIconProps {
  className?: string;
}

export const ProgressIcon = ({ className = "w-4 h-4" }: ProgressIconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="31.4" strokeDashoffset="15.7" opacity="0.3"/>
  </svg>
);
