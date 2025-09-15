"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { getUserWalletName } from "@/getters/user-wallet-getters";
import { FormatDateRange } from "@/components/formatters/DateRange";
import { DateTime } from "@/components/formatters/DateTime";
import { Duration } from "@/components/formatters/Duration";
import { BookmarkIcon } from "@/svgs";

interface ReferenceBooking {
  bookingId: string;
  bookingCreatedAt: string | null;
  bookingStartDate: string;
  packageCapacity: number;
  packagePrice: number;
  packageDuration: number;
  packageDescription: string | null;
  teacherName: string | null;
  note: string | null;
  referenceId: string | null;
  role: string;
}

interface ReferenceBookingRowProps {
  data: ReferenceBooking;
  expandedRow: string | null;
  setExpandedRow: (id: string | null) => void;
}

export function ReferenceBookingRow({
  data: booking,
  expandedRow,
  setExpandedRow
}: ReferenceBookingRowProps) {
  const isExpanded = expandedRow === booking.bookingId;
  
  const toggleExpand = () => {
    if (isExpanded) {
      setExpandedRow(null);
    } else {
      setExpandedRow(booking.bookingId);
    }
  };

  // Create a mock reference object for getUserWalletName
  const reference = {
    role: booking.role,
    note: booking.note,
    teacher: booking.teacherName ? { name: booking.teacherName } : null
  };

  return (
    <>
      <tr className="border-b border-border">
        <td className="py-2 px-4 text-left font-medium">
          {getUserWalletName(reference)}
        </td>
        <td className="py-2 px-4 text-left">
          {booking.bookingCreatedAt ? (
            <DateTime dateString={booking.bookingCreatedAt} formatType="date" />
          ) : (
            'N/A'
          )}
        </td>
        <td className="py-2 px-4 text-left">
          {booking.packageCapacity}
        </td>
        <td className="py-2 px-4 text-left">
          {booking.packagePrice}
        </td>
        <td className="py-2 px-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleExpand}
            className="h-8 w-8"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={5} className="py-4 px-4 bg-background/30">
            <div className="w-full space-y-3">
              {/* Package Details - Same style as BookingRow */}
              <div className="flex items-center gap-4 w-full p-3 bg-background/50 rounded-md border-l-4 border-amber-500">
                <BookmarkIcon className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded text-sm font-medium">
                    <Duration minutes={booking.packageDuration || 0} />
                  </span>
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded text-sm font-medium">
                    €{booking.packagePrice}/student
                  </span>
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded text-sm font-medium">
                    €{booking.packageDuration ? Math.round((booking.packagePrice / (booking.packageDuration / 60)) * 100) / 100 : 0}/h
                  </span>
                  <span className="text-sm text-muted-foreground">Students: {booking.packageCapacity}</span>
                  <span className="text-sm text-muted-foreground">Booking: <DateTime dateString={booking.bookingStartDate} formatType="date" /></span>
                  {booking.packageDescription && (
                    <span className="text-sm text-muted-foreground italic">&quot;{booking.packageDescription}&quot;</span>
                  )}
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
