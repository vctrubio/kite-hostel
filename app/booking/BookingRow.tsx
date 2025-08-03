"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DateSince } from "@/components/formatters/DateSince";
import { Duration } from "@/components/formatters/Duration";
import { FormatDateRange } from "@/components/formatters/DateRange";

interface BookingRowProps {
  booking: any; // Will be BookingWithRelations type
  expandedRow: string | null;
  setExpandedRow: (id: string | null) => void;
}

export function BookingRow({ booking, expandedRow, setExpandedRow }: BookingRowProps) {
  const isExpanded = expandedRow === booking.id;
  const router = useRouter();

  const toggleExpand = () => {
    if (isExpanded) {
      setExpandedRow(null);
    }
    else {
      setExpandedRow(booking.id);
    }
  };

  return (
    <>
      <tr className="cursor-pointer">
        <td onClick={toggleExpand} className="py-2 px-4 text-left"><FormatDateRange startDate={booking.date_start} endDate={booking.date_end} /></td>
        <td onClick={toggleExpand} className="py-2 px-4 text-left">{booking.status}</td>
        <td onClick={toggleExpand} className="py-2 px-4 text-left">{booking.reference?.teacher?.name || booking.reference?.role || 'N/A'}</td>
        <td onClick={toggleExpand} className="py-2 px-4 text-left">{booking.lessonCount}</td>
        <td className="py-2 px-4 text-right">
          <Button onClick={(e) => {
            e.stopPropagation(); // Prevent row from expanding/collapsing
            // router.push(`/bookings/${booking.id}`); // Uncomment if you have a booking details page
          }}>
            View Details
          </Button>
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={6} className="py-2 px-4">
            <div className="grid grid-cols-2 gap-2 p-2">
              <div>
                <p className="font-semibold">Package Details:</p>
                <p>Description: {booking.package?.description}</p>
                <p>Hours: <Duration minutes={booking.package?.duration} /></p>
                <p>Capacity: {booking.package?.capacity_students}</p>
                <p>Kites: {booking.package?.capacity_kites}</p>
                <p>Price: {booking.package?.price_per_student}€</p>
              </div>
              <div>
                <p className="font-semibold">Students:</p>
                {booking.students && booking.students.length > 0 ? (
                  <ul className="list-disc pl-5">
                    {booking.students.map((bs: any) => (
                      <li key={bs.student.id}>{bs.student.name}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No students associated.</p>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
