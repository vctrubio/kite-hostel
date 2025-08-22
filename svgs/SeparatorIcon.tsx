import React from 'react';

interface SeparatorIconProps {
  className?: string;
}

export const SeparatorIcon = ({ className = "w-4 h-4" }: SeparatorIconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="6" r="1.5" fill="currentColor" opacity="0.4"/>
    <circle cx="12" cy="12" r="1.5" fill="currentColor" opacity="0.6"/>
    <circle cx="12" cy="18" r="1.5" fill="currentColor" opacity="0.4"/>
  </svg>
);