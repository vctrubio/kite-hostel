"use client";

import React, { useState, useTransition } from "react";
import { ChevronDown, ChevronUp, Send, Settings, Trash2 } from "lucide-react";
import { BookmarkIcon } from "@/svgs";
import { type BookingData } from "@/backend/WhiteboardClass";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { BOOKING_STATUSES, type BookingStatus } from "@/lib/constants";
import { updateBookingStatus, deleteBooking } from "@/actions/booking-actions";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface FooterDropdownProps {
  booking: BookingData;
  onBookingComplete?: (bookingId: string) => void; //to implement back to parent, set lesson status of active lesson to compelte too
}

export default function FooterDropdown({
  booking,
  onBookingComplete,
}: FooterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDropdownToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleAirplaneSend = () => {
    console.log("Airplane send clicked", { bookingId: booking.id, booking });
  };

  const handleStatusChange = (newStatus: BookingStatus) => {
    if (newStatus === booking.status) return;

    startTransition(async () => {
      const { success, error } = await updateBookingStatus(
        booking.id,
        newStatus,
      );
      if (success) {
        if (newStatus === "completed" && onBookingComplete) {
          onBookingComplete(booking.id);
        }
        router.refresh();
      } else {
        console.error("Failed to update status:", error);
      }
    });
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteBooking(booking.id);
      router.refresh();
    } catch (error) {
      console.error("Failed to delete booking:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Calculate package totals
  const packageHours = booking.package ? booking.package.duration / 60 : 0;
  const totalPrice = booking.package
    ? booking.package.price_per_student * booking.package.capacity_students
    : 0;

  return (
    <div className="border-t border-border/50">
      {/* Footer Icons Bar */}
      <div className="flex items-center justify-between p-3 bg-muted/10">
        <button
          onClick={handleDropdownToggle}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          {isOpen ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
          <span className="text-sm">Details</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAirplaneSend}
            className="p-2 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-md transition-colors"
            title="Send booking"
          >
            <Send className="w-4 h-4" />
          </button>

          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 text-muted-foreground hover:text-black dark:hover:text-white hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors"
            title="Delete booking"
          >
            <Trash2 className={`w-4 h-4 ${isDeleting ? "animate-spin" : ""}`} />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "p-2 text-muted-foreground hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-950/30 rounded-md transition-colors",
                  isPending && "opacity-50 cursor-not-allowed",
                )}
                title="Booking settings"
                disabled={isPending}
              >
                <Settings className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40" align="end">
              <div className="p-2 text-xs text-muted-foreground">
                Change Status
              </div>
              <DropdownMenuSeparator />
              {BOOKING_STATUSES.map((status) => (
                <DropdownMenuItem
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  disabled={isPending}
                  className={cn(
                    "cursor-pointer",
                    status === booking.status &&
                    "bg-accent text-accent-foreground",
                  )}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Dropdown Content */}
      {isOpen && (
        <div className="p-4 bg-muted/5 space-y-4 border-t border-border/30">
          {/* Package Information */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <BookmarkIcon className="w-4 h-4" />
              <span>Package Details</span>
            </div>

            {booking.package && (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Description:</span>
                  <p className="font-medium">
                    {booking.package.description || "No description"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Duration:</span>
                  <p className="font-medium">{packageHours}h</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Kite Capacity:</span>
                  <p className="font-medium">
                    {booking.package.capacity_kites} kites
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    Price per Student:
                  </span>
                  <p className="font-medium">
                    €{booking.package.price_per_student}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    Student Capacity:
                  </span>
                  <p className="font-medium">
                    {booking.package.capacity_students} students
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Price:</span>
                  <p className="font-medium text-green-600">€{totalPrice}</p>
                </div>
              </div>
            )}
          </div>

          {/* Reference Information */}
          {booking.reference && (
            <div className="space-y-3">
              <div className="text-sm font-medium text-muted-foreground">
                Reference Information
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Reference:</span>
                  <p className="font-medium">{booking.reference.id}</p>
                </div>
                {booking.reference.teacher && (
                  <div>
                    <span className="text-muted-foreground">Teacher:</span>
                    <p className="font-medium">
                      {booking.reference.teacher.name}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Booking Dates */}
          <div className="space-y-3">
            <div className="text-sm font-medium text-muted-foreground">
              Booking Timeline
            </div>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created:</span>
                <span className="font-medium">
                  {booking.created_at
                    ? new Date(booking.created_at).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Start Date:</span>
                <span className="font-medium">
                  {new Date(booking.date_start).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">End Date:</span>
                <span className="font-medium">
                  {new Date(booking.date_end).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
