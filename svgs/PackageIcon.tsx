import React from 'react';

interface PackageIconProps {
  className?: string;
}

export const PackageIcon = ({ className = "w-4 h-4" }: PackageIconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M21 8L12 3L3 8L12 13L21 8Z" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 12L12 17L3 12" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 16L12 21L3 16" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
