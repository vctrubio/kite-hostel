import React from 'react';

interface BookingIconProps {
  className?: string;
}

export const BookingIcon = ({ className = "w-4 h-4" }: BookingIconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M8 2V6M16 2V6M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="9" cy="14" r="2" fill="#3B82F6"/>
    <circle cx="15" cy="14" r="2" fill="#3B82F6"/>
  </svg>
);
