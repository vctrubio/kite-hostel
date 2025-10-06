"use client";

import * as React from "react";
import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { getBookingStatusColor, type BookingStatus, BOOKING_STATUSES } from "@/lib/constants";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { updateBookingStatus } from "@/actions/booking-actions";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

interface FormatedDateExpProps {
  startDate: string;
  endDate: string;
  selectedDate: string;
  status: BookingStatus;
  bookingId: string;
}

export function FormatedDateExp({ 
  startDate,
  endDate,
  selectedDate,
  status,
  bookingId
}: FormatedDateExpProps) {
  const [currentStatus, setCurrentStatus] = useState<BookingStatus>(status);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleStatusChange = (newStatus: BookingStatus) => {
    if (newStatus === currentStatus) return;

    startTransition(async () => {
      const { success, error } = await updateBookingStatus(bookingId, newStatus);
      if (success) {
        setCurrentStatus(newStatus);
        router.refresh();
      } else {
        console.error("Failed to update status:", error);
      }
    });
  };

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
    return getBookingStatusColor(currentStatus);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div
          className={cn(
            "inline-flex items-center px-4 py-2 rounded-md text-xs font-medium font-bold cursor-pointer transition-colors group",
            getExpiryColor(),
            isPending && "opacity-50 cursor-not-allowed"
          )}
        >
          {getExpiryText()}
          <ChevronDown
            className={cn(
              "ml-1 h-3 w-3 transition-transform duration-200 group-data-[state=open]:rotate-180",
              isPending && "animate-spin"
            )}
          />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48" align="end">
        <div className="p-2 text-xs text-muted-foreground">
          Change Booking Status
        </div>
        <DropdownMenuSeparator />
        {BOOKING_STATUSES.map((s) => {
          const getStatusClasses = (status: BookingStatus) => {
            switch (status) {
              case "active":
                return "data-[highlighted]:bg-blue-100 data-[highlighted]:dark:bg-blue-500/30 data-[highlighted]:text-blue-800 data-[highlighted]:dark:text-blue-200";
              case "completed":
                return "data-[highlighted]:bg-green-100 data-[highlighted]:dark:bg-green-600/30 data-[highlighted]:text-green-800 data-[highlighted]:dark:text-green-200";
              case "uncomplete":
                return "data-[highlighted]:bg-red-100 data-[highlighted]:dark:bg-red-600/30 data-[highlighted]:text-red-800 data-[highlighted]:dark:text-red-200";
              default:
                return "data-[highlighted]:bg-gray-100 data-[highlighted]:dark:bg-gray-600/30 data-[highlighted]:text-gray-800 data-[highlighted]:dark:text-gray-200";
            }
          };

          return (
            <DropdownMenuItem
              key={s}
              onClick={() => handleStatusChange(s)}
              disabled={isPending}
              className={cn(
                "cursor-pointer transition-colors focus:outline-none",
                s === currentStatus 
                  ? "bg-accent text-accent-foreground data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground" 
                  : getStatusClasses(s)
              )}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}