"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

import { Duration } from "@/components/formatters/Duration";

interface PackageRowProps {
  data: {
    id: string;
    duration: number;
    capacity_students: number;
    price_per_student: number;
    description: string;
    capacity_kites: number;
    bookingCount: number;
    created_at?: string;
  };
  expandedRow: string | null;
  setExpandedRow: (id: string | null) => void;
}

export function PackageRow({
  data: pkg,
  expandedRow,
  setExpandedRow,
}: PackageRowProps) {
  const isExpanded = expandedRow === pkg.id;
  const router = useRouter();

  const toggleExpand = async () => {
    if (isExpanded) {
      setExpandedRow(null);
    } else {
      setExpandedRow(pkg.id);
    }
  };

  return (
    <>
      <tr className="cursor-pointer">
        <td onClick={toggleExpand} className="py-2 px-4 text-left">
          {pkg.description}
        </td>
        <td onClick={toggleExpand} className="py-2 px-4 text-left">
          {pkg.capacity_kites}
        </td>
        <td onClick={toggleExpand} className="py-2 px-4 text-left">
          {pkg.capacity_students}
        </td>
        <td onClick={toggleExpand} className="py-2 px-4 text-left">
          <Duration minutes={pkg.duration} />
        </td>
        <td onClick={toggleExpand} className="py-2 px-4 text-left">
          €{pkg.price_per_student}
        </td>
        <td onClick={toggleExpand} className="py-2 px-4 text-left">
          €{(pkg.price_per_student / (pkg.duration / 60)).toFixed(2)}/h
        </td>
        <td onClick={toggleExpand} className="py-2 px-4 text-left">
          €{pkg.price_per_student * pkg.capacity_students}
        </td>
        <td onClick={toggleExpand} className="py-2 px-4 text-left">
          {pkg.bookingCount}
        </td>
        <td className="py-2 px-4 text-right">
          <Button
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation(); // Prevent row from expanding/collapsing
              router.push(`/packages/${pkg.id}`);
            }}
          >
            <Send className="h-4 w-4" />
          </Button>
        </td>
      </tr>
    </>
  );
}
