import React from 'react';

interface BookIconProps {
  className?: string;
}

export const BookIcon = ({ className = "w-4 h-4" }: BookIconProps) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    <path d="M8 7h8" />
    <path d="M8 11h8" />
    <path d="M8 15h6" />
    <circle cx="15" cy="15" r="2" />
    <path d="M15 13v4" />
    <path d="M13 15h4" />
  </svg>
);
