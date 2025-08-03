"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DateSince } from "@/components/formatters/DateSince";

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
  };
  expandedRow: string | null;
  setExpandedRow: (id: string | null) => void;
}

export function StudentRow({ student, expandedRow, setExpandedRow }: StudentRowProps) {
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
      <tr className="cursor-pointer">
        <td onClick={toggleExpand} className="py-2 px-4 text-left"><DateSince dateString={student.created_at} /></td>
        <td onClick={toggleExpand} className="py-2 px-4 text-left">{student.name}</td>
        <td onClick={toggleExpand} className="py-2 px-4 text-left">{student.desc}</td>
        <td onClick={toggleExpand} className="py-2 px-4 text-left">{student.totalBookings}</td>
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
          <td colSpan={4} className="py-2 px-4">
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
