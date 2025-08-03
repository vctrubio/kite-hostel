import React from 'react';

interface CalendarIconProps {
  className?: string;
}

export const CalendarIcon = ({ className = "w-4 h-4" }: CalendarIconProps) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <path d="m9 16 2 2 4-4" />
  </svg>
);
