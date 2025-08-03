import React from 'react';

interface AdminIconProps {
  className?: string;
}

export const AdminIcon = ({ className = "w-4 h-4" }: AdminIconProps) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
    <path d="M9 12l2 2 4-4" />
    <circle cx="12" cy="8.5" r="1.5" />
  </svg>
);
