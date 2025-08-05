"use client";

import { useState, useEffect } from "react";
import { BookingRow } from "./BookingRow";

interface BookingsTableProps {
  initialBookings: any[];
}

export function BookingsTable({ initialBookings }: BookingsTableProps) {
  const [bookings, setBookings] = useState(initialBookings);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  useEffect(() => {
    setBookings(initialBookings);
  }, [initialBookings]);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr>
            <th className="py-2 px-4 text-left">Start Date</th>
            <th className="py-2 px-4 text-left">Status</th>
            <th className="py-2 px-4 text-left">Reference</th>
            <th className="py-2 px-4 text-left">Lessons</th>
            <th className="py-2 px-4"></th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <BookingRow
              key={booking.id}
              booking={booking}
              expandedRow={expandedRow}
              setExpandedRow={setExpandedRow}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}