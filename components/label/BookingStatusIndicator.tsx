"use client";

import { type BookingStatus, getBookingStatusColor } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface BookingStatusIndicatorProps {
  currentStatus: BookingStatus;
}

export function BookingStatusIndicator({ currentStatus }: BookingStatusIndicatorProps) {
  return (
    <div
      className={cn(
        "w-3 h-3 rounded-full",
        getBookingStatusColor(currentStatus)
      )}
    />
  );
}