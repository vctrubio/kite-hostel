'use client';

import { useEffect, useState } from 'react';
import { getAllReferencedBookings } from '@/actions/reference-actions';
import { ReferenceBookingCard } from '@/components/cards/ReferenceBookingCard';

import { userRole } from "@/drizzle/migrations/schema";

interface ReferencedBooking {
  bookingCreatedAt: string;
  bookingStartDate: string;
  packageCapacity: number;
  packagePrice: number;
  teacherName: string | null;
  note: string | null;
  referenceId: string | null;
  role: typeof userRole._.enumValues[number];
}

export default function Page() {
  const [referencedBookings, setReferencedBookings] = useState<ReferencedBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReferencedBookings() {
      const { data, error } = await getAllReferencedBookings();
      if (error) {
        setError(error);
      } else if (data) {
        setReferencedBookings(data);
      }
      setLoading(false);
    }
    fetchReferencedBookings();
  }, []);

  if (loading) {
    return <div>Loading referenced bookings...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

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
