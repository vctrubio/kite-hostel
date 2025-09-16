"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Booking4LessonTable } from "@/components/forms/Booking4LessonTable";
import { getBookings } from "@/actions/booking-actions";
import { BookingWithRelations } from "@/backend/types";

interface LessonFormProps {
  onSubmit?: () => void;
}

export function LessonForm({}: LessonFormProps) {
  const [bookings, setBookings] = useState<BookingWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data, error } = await getBookings();
      if (data) {
        setBookings(data);
      } else if (error) {
        console.error("Error fetching bookings:", error);
        toast.error("Failed to load bookings: " + error);
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
      toast.error("An unexpected error occurred while loading bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  if (loading) {
    return;
  }

  return (
    <div className="w-full p-6">
      <Booking4LessonTable bookings={bookings} onRefresh={fetchBookings} />
    </div>
  );
}
