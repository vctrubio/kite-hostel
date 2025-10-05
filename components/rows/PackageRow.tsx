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
    totalRevenue?: number;
  };
}

export function PackageRow({
  data: pkg,
}: PackageRowProps) {
  const router = useRouter();

  return (
    <>
      <tr>
        <td className="py-2 px-4 text-left">
          {pkg.description}
        </td>
        <td className="py-2 px-4 text-left">
          {pkg.capacity_kites}
        </td>
        <td className="py-2 px-4 text-left">
          {pkg.capacity_students}
        </td>
        <td className="py-2 px-4 text-left">
          <Duration minutes={pkg.duration} />
        </td>
        <td className="py-2 px-4 text-left">
          <div className="flex items-center gap-2">
            <span>€{pkg.price_per_student}</span>
            {pkg.capacity_students > 1 && (
              <span className="text-sm text-muted-foreground">(€{pkg.price_per_student * pkg.capacity_students})</span>
            )}
          </div>
        </td>
        <td className="py-2 px-4 text-left">
          €{(() => {
            const hourlyRate = pkg.price_per_student / (pkg.duration / 60);
            return hourlyRate % 1 === 0 ? hourlyRate.toString() : hourlyRate.toFixed(2);
          })()}
        </td>
        <td className="py-2 px-4 text-left">
          {pkg.bookingCount === 0 ? (
            <span className="font-bold text-muted-foreground">0</span>
          ) : (
            <div className="flex items-center gap-2">
              <span className="font-medium">{pkg.bookingCount}</span>
              <span className="text-sm text-green-600">(€{pkg.totalRevenue ? Math.round(pkg.totalRevenue) : 0})</span>
            </div>
          )}
        </td>
        <td className="py-2 px-4 text-right">
          <Button
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
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
