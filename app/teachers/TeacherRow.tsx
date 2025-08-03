"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

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
        <td onClick={toggleExpand} className="py-2 px-4 text-left">{new Date(teacher.created_at).toLocaleDateString()}</td>
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
          <td colSpan={4} className="py-2 px-4">
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
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
