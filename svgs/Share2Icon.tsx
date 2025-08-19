import React from 'react';

interface Share2IconProps {
  className?: string;
}

export const Share2Icon = ({ className = "w-4 h-4" }: Share2IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="2"/>
    <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
    <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="2"/>
    <path d="m8.59 13.51 6.83 3.98" stroke="currentColor" strokeWidth="2"/>
    <path d="m15.41 6.51-6.82 3.98" stroke="currentColor" strokeWidth="2"/>
  </svg>
);