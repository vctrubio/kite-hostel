"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { getBookingStatusColor, type BookingStatus } from "@/lib/constants";

interface FormatedDateExpProps {
  startDate: string;
  endDate: string;
  selectedDate: string;
  status: BookingStatus;
}

export function FormatedDateExp({ 
  startDate,
  endDate,
  selectedDate,
  status
}: FormatedDateExpProps) {

  // Calculate days until expiry
  const calculateDaysUntilExpiry = () => {
    const currentDate = new Date(selectedDate);
    const expiryDate = new Date(endDate);
    
    // Reset time to avoid time zone issues
    currentDate.setHours(0, 0, 0, 0);
    expiryDate.setHours(0, 0, 0, 0);
    
    const timeDiff = expiryDate.getTime() - currentDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    return daysDiff;
  };

  const daysUntilExpiry = calculateDaysUntilExpiry();

  // Format the booking date range
  const formatDateRange = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const startFormatted = start.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
    const endFormatted = end.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
    
    if (start.getTime() === end.getTime()) {
      return startFormatted;
    }
    return `${startFormatted} - ${endFormatted}`;
  };

  // Format the expiry text
  const getExpiryText = () => {
    const dateRange = formatDateRange();
    const daysSuffix = daysUntilExpiry <= 0 ? `${Math.abs(daysUntilExpiry)}` : `-${daysUntilExpiry}`;
    return `${dateRange} • ${daysSuffix}d`;
  };

  // Get color based on booking status
  const getExpiryColor = () => {
    return getBookingStatusColor(status);
  };

  return (
    <div
      className={cn(
        "inline-flex items-center px-4 py-2 rounded-md text-xs font-medium font-bold",
        getExpiryColor()
      )}
    >
      {getExpiryText()}
    </div>
  );
}