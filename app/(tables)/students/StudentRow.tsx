"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DateSince } from "@/components/formatters/DateSince";
import { Checkbox } from "@/components/ui/checkbox";

import { InferSelectModel } from "drizzle-orm";
import { Booking } from "@/drizzle/migrations/schema";
import { BookingView } from "@/components/views/BookingView";

interface StudentRowProps {
  student: {
    id: string;
    created_at: string;
    name: string;
    desc: string;
    languages: string[];
    passport_number: string | null;
    country: string | null;
    phone: string | null;
    totalBookings: number;
    bookings: InferSelectModel<typeof Booking>[];
  };
  expandedRow: string | null;
  setExpandedRow: (id: string | null) => void;
  isAvailable: boolean;
  isSelected: boolean;
  onSelectStudent: (id: string) => void;
}

export function StudentRow({ student, expandedRow, setExpandedRow, isAvailable, isSelected, onSelectStudent }: StudentRowProps) {
  const isExpanded = expandedRow === student.id;
  const router = useRouter();

  const toggleExpand = () => {
    if (isExpanded) {
      setExpandedRow(null);
    } else {
      setExpandedRow(student.id);
    }
  };

  return (
    <>
      <tr className={`cursor-pointer ${isSelected ? 'bg-blue-100' : ''}`}>
        <td className="py-2 px-4 text-left">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onSelectStudent(student.id)}
            disabled={!isAvailable}
          />
        </td>
        <td onClick={toggleExpand} className="py-2 px-4 text-left"><DateSince dateString={student.created_at} /></td>
        <td onClick={toggleExpand} className="py-2 px-4 text-left">{student.name}</td>
        <td onClick={toggleExpand} className="py-2 px-4 text-left">{student.desc}</td>
        <td onClick={toggleExpand} className="py-2 px-4 text-left">{student.totalBookings}</td>
        <td className="py-2 px-4 text-left">
          {student.bookings.length > 0 ? (
            <BookingView booking={student.bookings.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]} />
          ) : (
            "N/A"
          )}
        </td>
        <td className="py-2 px-4 text-right">
          <Button onClick={(e) => {
            e.stopPropagation(); // Prevent row from expanding/collapsing
            router.push(`/students/${student.id}`);
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
                <p className="font-semibold">Languages:</p>
                <p>{student.languages.join(", ")}</p>
              </div>
              <div>
                <p className="font-semibold">Passport Number:</p>
                <p>{student.passport_number || 'N/A'}</p>
              </div>
              <div>
                <p className="font-semibold">Country:</p>
                <p>{student.country || 'N/A'}</p>
              </div>
              <div>
                <p className="font-semibold">Phone:</p>
                <p>{student.phone || 'N/A'}</p>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
