import React from 'react';

interface ClockIconProps {
  className?: string;
}

export const ClockIcon = ({ className = "w-4 h-4" }: ClockIconProps) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12,6 12,12 16,14" />
  </svg>
);
