"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { getUserWalletName } from "@/getters/user-wallet-getters";
import { DateTime } from "@/components/formatters/DateTime";
import { HelmetIcon, BookingIcon } from "@/svgs";
import { ENTITY_DATA } from "@/lib/constants";
import { DropdownExpandableRow } from "./DropdownExpandableRow";
import { PackageDetails } from "@/getters/package-details";
import { formatFriendlyDate } from "@/getters/event-getters";

interface ReferenceBooking {
  bookingId: string;
  bookingCreatedAt: string | null;
  bookingStartDate: string;
  bookingEndDate: string;
  packageCapacity: number;
  packagePrice: number;
  packageDuration: number;
  packageDescription: string | null;
  teacherName: string | null;
  note: string | null;
  referenceId: string | null;
  role: string;
  students: Array<{
    id: string;
    name: string;
    last_name: string | null;
  }>;
}

interface ReferenceBookingRowProps {
  data: ReferenceBooking;
  expandedRow: string | null;
  setExpandedRow: (id: string | null) => void;
}

export function ReferenceBookingRow({
  data: booking,
  expandedRow,
  setExpandedRow
}: ReferenceBookingRowProps) {
  const isExpanded = expandedRow === booking.bookingId;
  const router = useRouter();
  
  const toggleExpand = () => {
    if (isExpanded) {
      setExpandedRow(null);
    } else {
      setExpandedRow(booking.bookingId);
    }
  };

  // Create a mock reference object for getUserWalletName
  const reference = {
    role: booking.role,
    note: booking.note,
    teacher: booking.teacherName ? { name: booking.teacherName } : null
  };

  const packageEntity = ENTITY_DATA.find(entity => entity.name === "Package");
  const studentEntity = ENTITY_DATA.find(entity => entity.name === "Student");
  const bookingEntity = ENTITY_DATA.find(entity => entity.name === "Booking");

  // Calculate total price
  const totalPrice = booking.packagePrice * booking.students.length;

  return (
    <>
      <tr className="border-b border-border">
        <td className="py-2 px-4 text-left font-medium">
          {getUserWalletName(reference)}
        </td>
        <td className="py-2 px-4 text-left">
          {booking.bookingCreatedAt ? (
            <DateTime dateString={booking.bookingCreatedAt} formatType="date" />
          ) : (
            'N/A'
          )}
        </td>
        <td className="py-2 px-4 text-left">
          {booking.packageCapacity}
        </td>
        <td className="py-2 px-4 text-left">
          {booking.packagePrice}
        </td>
        <td className="py-2 px-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleExpand}
            className="h-8 w-8"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </td>
      </tr>
      <DropdownExpandableRow
        isExpanded={isExpanded}
        colSpan={5}
        sections={[
          {
            title: "Package Details",
            icon: packageEntity?.icon,
            color: packageEntity?.color || "text-orange-500",
            children: (
              <PackageDetails 
                packageData={{
                  description: booking.packageDescription,
                  price_per_student: booking.packagePrice,
                  duration: booking.packageDuration,
                  capacity_students: booking.packageCapacity,
                }}
                variant="simple"
                totalPrice={totalPrice}
              />
            )
          },
          {
            title: (
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {booking.students && booking.students.length > 0 ? (
                    booking.students.map((_, index) => (
                      <HelmetIcon key={index} className="w-4 h-4" />
                    ))
                  ) : (
                    <HelmetIcon className="w-4 h-4" />
                  )}
                </div>
                <span>Students</span>
              </div>
            ),
            color: studentEntity?.color || "text-yellow-500",
            children: (
              <div className="flex flex-wrap gap-2">
                {booking.students && booking.students.length > 0 ? (
                  booking.students.map((student) => (
                    <button
                      key={student.id}
                      onClick={() => router.push(`/students/${student.id}`)}
                      className="px-2 py-1 text-sm font-medium border border-yellow-500 rounded hover:bg-muted transition-colors"
                    >
                      {student.name} {student.last_name || ''}
                    </button>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">
                    No students assigned
                  </span>
                )}
              </div>
            )
          },
          {
            title: "Booking",
            icon: BookingIcon,
            color: "text-blue-500",
            children: (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.push(`/bookings/${booking.bookingId}`)}
                  className="px-3 py-1.5 text-sm font-medium border border-blue-500 rounded hover:bg-blue-50 transition-colors"
                >
                  {formatFriendlyDate(booking.bookingStartDate, false)} → {formatFriendlyDate(booking.bookingEndDate, false)}
                </button>
              </div>
            )
          }
        ]}
      />
    </>
  );
}
