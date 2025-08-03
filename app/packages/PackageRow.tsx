
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DateSince } from "@/components/formatters/DateSince";

import { Duration } from "@/components/formatters/Duration";

import { getBookingCountByPackageId } from "@/actions/getters";

interface PackageRowProps {
  pkg: {
    id: string;
    duration: number;
    capacity_students: number;
    price_per_student: number;
    description: string;
    capacity_kites: number;
  };
  expandedRow: string | null;
  setExpandedRow: (id: string | null) => void;
}

export function PackageRow({ pkg, expandedRow, setExpandedRow }: PackageRowProps) {
  const isExpanded = expandedRow === pkg.id;
  const router = useRouter();
  const [bookingCount, setBookingCount] = useState<number | null>(null);

  const toggleExpand = async () => {
    if (isExpanded) {
      setExpandedRow(null);
    } else {
      setExpandedRow(pkg.id);
      const { count } = await getBookingCountByPackageId(pkg.id);
      setBookingCount(count);
    }
  };

  return (
    <>
      <tr className="cursor-pointer">
        <td onClick={toggleExpand} className="py-2 px-4 text-left"><Duration minutes={pkg.duration} /></td>
        <td onClick={toggleExpand} className="py-2 px-4 text-left">{pkg.capacity_students}</td>
        <td onClick={toggleExpand} className="py-2 px-4 text-left">{pkg.price_per_student}</td>
        <td onClick={toggleExpand} className="py-2 px-4 text-left">{pkg.description}</td>
        <td onClick={toggleExpand} className="py-2 px-4 text-left">{pkg.capacity_kites}</td>
        <td className="py-2 px-4 text-right">
          <Button onClick={(e) => {
            e.stopPropagation(); // Prevent row from expanding/collapsing
            router.push(`/packages/${pkg.id}`);
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
                <p className="font-semibold">Price per hour:</p>
                <p>€{(pkg.price_per_student / (pkg.duration / 60)).toFixed(2)}</p>
              </div>
              <div>
                <p className="font-semibold">Bookings:</p>
                <p>{bookingCount}</p>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
