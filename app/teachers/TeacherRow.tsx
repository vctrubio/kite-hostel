"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DateSince } from "@/components/formatters/DateSince";

interface TeacherRowProps {
  teacher: any;
  expandedRow: string | null;
  setExpandedRow: (id: string | null) => void;
}

export function TeacherRow({ teacher, expandedRow, setExpandedRow }: TeacherRowProps) {
  const isExpanded = expandedRow === teacher.id;
  const router = useRouter();

  const toggleExpand = () => {
    if (isExpanded) {
      setExpandedRow(null);
    } else {
      setExpandedRow(teacher.id);
    }
  };

  return (
    <>
      <tr className="cursor-pointer">
        <td onClick={toggleExpand} className="py-2 px-4 text-left"><DateSince dateString={teacher.created_at} /></td>
        <td onClick={toggleExpand} className="py-2 px-4 text-left">{teacher.name}</td>
        <td onClick={toggleExpand} className="py-2 px-4 text-left">{teacher.phone || 'N/A'}</td>
        <td className="py-2 px-4 text-right">
          <Button onClick={(e) => {
            e.stopPropagation(); // Prevent row from expanding/collapsing
            router.push(`/teachers/${teacher.id}`);
          }}>
            View Details
          </Button>
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={5} className="py-2 px-4">
            <div className="grid grid-cols-2 gap-2 p-2">
              <div>
                <p className="font-semibold">Languages:</p>
                <p>{teacher.languages.join(", ")}</p>
              </div>
              <div>
                <p className="font-semibold">Passport Number:</p>
                <p>{teacher.passport_number || 'N/A'}</p>
              </div>
              <div>
                <p className="font-semibold">Country:</p>
                <p>{teacher.country || 'N/A'}</p>
              </div>
              <div>
                <p className="font-semibold">Commissions ({teacher.commissions.length}):</p>
                {teacher.commissions.length > 0 ? (
                  <ul className="list-disc list-inside">
                    {teacher.commissions.map((commission: any) => (
                      <li key={commission.id}>€{commission.price_per_hour.toFixed(0)}/h {commission.desc && `- ${commission.desc}`}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No commissions available.</p>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
