"use client";

import * as React from "react";
import { useState, useTransition } from "react";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BOOKING_STATUSES, type BookingStatus } from "@/lib/constants";

import { updateBookingStatus } from "@/actions/booking-actions";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

type BookingStatus = typeof BOOKING_STATUSES[number];

interface BookingStatusLabelProps {
  bookingId: string;
  currentStatus: BookingStatus;
}

export function BookingStatusLabel({ bookingId, currentStatus }: BookingStatusLabelProps) {
  const [status, setStatus] = useState<BookingStatus>(currentStatus);
  const [isPending, startTransition] = useTransition();

  const getStatusColors = (s: BookingStatus) => {
    switch (s) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "completed":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200";
      case "cancelled":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const handleStatusChange = (newStatus: BookingStatus) => {
    if (newStatus === status) return;

    startTransition(async () => {
      const { success, error } = await updateBookingStatus(bookingId, newStatus);
      if (success) {
        setStatus(newStatus);
      } else {
        console.error("Failed to update status:", error);
      }
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Label
          className={cn(
            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-colors group",
            getStatusColors(status),
            isPending && "opacity-50 cursor-not-allowed"
          )}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
          <ChevronDown
            className={cn(
              "ml-1 h-3 w-3 transition-transform duration-200 group-data-[state=open]:rotate-180",
              isPending && "animate-spin"
            )}
          />
        </Label>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-40">
        {BOOKING_STATUSES.map((s) => (
          <DropdownMenuItem
            key={s}
            onClick={() => handleStatusChange(s)}
            disabled={isPending}
            className={cn(
              "cursor-pointer",
              s === status && "bg-accent text-accent-foreground"
            )}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}