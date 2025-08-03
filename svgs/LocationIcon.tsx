import React from 'react';

interface LocationIconProps {
  className?: string;
}

export const LocationIcon = ({ className = "w-4 h-4" }: LocationIconProps) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);
