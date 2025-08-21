"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { BookingRow } from "./BookingRow";
import { BookingWithRelations, DateFilter } from "@/backend/types";

interface BookingsTableProps {
  initialBookings: BookingWithRelations[];
}

export function BookingsTable({ initialBookings }: BookingsTableProps) {
  const [bookings, setBookings] = useState(initialBookings);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter>({
    type: "current_month",
    startDate: null,
    endDate: null,
  });
  const router = useRouter();

  useEffect(() => {
    setBookings(initialBookings);
  }, [initialBookings]);

  useEffect(() => {
    console.log("Date filter changed in BookingsTable:", dateFilter);
  }, [dateFilter]);

  const activeBookings = bookings.filter((b) => b.status === "active").length;
  const completedBookings = bookings.filter(
    (b) => b.status === "completed",
  ).length;
  const totalBookings = bookings.length;

  const stats = [
    { description: "Total Bookings", value: totalBookings },
    { description: "Active Bookings", value: activeBookings },
    { description: "Completed Bookings", value: completedBookings },
  ];

  const actionButtons = [
    {
      icon: Plus,
      label: "Create New Booking",
      action: () => router.push("/bookings/form"),
    },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr>
            <th className="py-2 px-4 text-left">Start Date</th>
            <th className="py-2 px-4 text-left">Status</th>
            <th className="py-2 px-4 text-left">Reference</th>
            <th className="py-2 px-4 text-left">Students</th>
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
