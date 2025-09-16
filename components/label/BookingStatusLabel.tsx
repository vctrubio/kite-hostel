"use client";

import * as React from "react";
import { useState, useTransition } from "react";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BOOKING_STATUSES, type BookingStatus, getBookingStatusColor } from "@/lib/constants";
import { updateBookingStatus, deleteBooking } from "@/actions/booking-actions";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface BookingStatusLabelProps {
  bookingId: string;
  currentStatus: BookingStatus;
  showDeleteOption?: boolean;
}

export function BookingStatusLabel({ bookingId, currentStatus, showDeleteOption = false }: BookingStatusLabelProps) {
  const [status, setStatus] = useState<BookingStatus>(currentStatus);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

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

  const handleDeleteBooking = () => {
    startTransition(async () => {
      const { success, error } = await deleteBooking(bookingId);
      if (success) {
        toast.success("Booking deleted successfully!");
        router.push('/bookings');
      } else {
        toast.error(error || "Failed to delete booking");
      }
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Label
          className={cn(
            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-colors group",
            getBookingStatusColor(status),
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
        {showDeleteOption && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleDeleteBooking}
              disabled={isPending}
              className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              Delete Booking
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}