"use client";

import { useState, useEffect } from "react";
import { ReferenceBookingCard } from "@/components/cards/ReferenceBookingCard";
import { userRole } from "@/drizzle/migrations/schema";

interface ReferencedBooking {
  bookingCreatedAt: string | null;
  bookingStartDate: string;
  packageCapacity: number;
  packagePrice: number;
  teacherName: string | null;
  note: string | null;
  referenceId: string | null;
  role: (typeof userRole.enumValues)[number];
}

interface ReferenceBookingTableProps {
  initialReferencedBookings: ReferencedBooking[];
}

export function ReferenceBookingTable({ initialReferencedBookings }: ReferenceBookingTableProps) {
  const [referencedBookings, setReferencedBookings] = useState(initialReferencedBookings);

  useEffect(() => {
    setReferencedBookings(initialReferencedBookings);
  }, [initialReferencedBookings]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Referenced Bookings</h1>
      {referencedBookings.length === 0 ? (
        <p>No referenced bookings found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {referencedBookings.map((booking, index) => (
            <ReferenceBookingCard key={index} {...booking} />
          ))}
        </div>
      )}
    </div>
  );
}
