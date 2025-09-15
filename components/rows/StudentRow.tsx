"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Send } from "lucide-react";
import { DateSince } from "@/components/formatters/DateSince";
import { Checkbox } from "@/components/ui/checkbox";
import { InferSelectModel } from "drizzle-orm";
import { Booking } from "@/drizzle/migrations/schema";
import { BookingView } from "@/components/views/BookingView";
import { EventCountWithDuration } from "@/getters/event-getters";
import { ENTITY_DATA } from "@/lib/constants";
import { DropdownExpandableRow } from "./DropdownExpandableRow";

interface StudentRowProps {
  data: {
    id: string;
    created_at: string;
    name: string;
    last_name: string | null;
    desc: string;
    languages: string[];
    passport_number: string | null;
    country: string | null;
    phone: string | null;
    totalBookings: number;
    bookings: InferSelectModel<typeof Booking>[];
    eventCount?: number;
    totalEventHours?: number;
    isAvailable?: boolean;
  };
  expandedRow: string | null;
  setExpandedRow: (id: string | null) => void;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export function StudentRow({ data: student, expandedRow, setExpandedRow, isSelected, onSelect }: StudentRowProps) {
  const isExpanded = expandedRow === student.id;
  const router = useRouter();
  const isAvailable = student.isAvailable ?? !student.bookings?.some((b: any) => b.status === "active");
  
  const studentEntity = ENTITY_DATA.find(entity => entity.name === "Student");
  const bookingEntity = ENTITY_DATA.find(entity => entity.name === "Booking");

  const toggleExpand = () => {
    if (isExpanded) {
      setExpandedRow(null);
    } else {
      setExpandedRow(student.id);
    }
  };

  return (
    <>
      <tr className={`${isSelected ? 'bg-blue-100' : ''} border-b border-border`}>
        <td className="py-2 px-4 text-left">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onSelect(student.id)}
            disabled={!isAvailable}
          />
        </td>
        <td className="py-2 px-4 text-left"><DateSince dateString={student.created_at} /></td>
        <td className="py-2 px-4 text-left">{student.name}</td>
        <td className="py-2 px-4 text-left">{student.last_name || 'N/A'}</td>
        <td className="py-2 px-4 text-left">{student.desc}</td>
        <td className="py-2 px-4 text-left">{student.totalBookings || student.bookings?.length || 0}</td>
        <td className="py-2 px-4 text-left">
          <EventCountWithDuration
            eventCount={student.eventCount || 0}
            totalHours={student.totalEventHours || 0}
          />
        </td>
        <td className="py-2 px-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleExpand}
              className="h-8 w-8"
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/students/${student.id}`);
              }}
              className="h-8 w-8"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </td>
      </tr>
      <DropdownExpandableRow
        isExpanded={isExpanded}
        colSpan={8}
        sections={[
          {
            title: "Student Details",
            icon: studentEntity?.icon,
            color: studentEntity?.color || "text-yellow-500",
            children: (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground min-w-20">Languages:</span>
                  <span className="text-sm font-medium">
                    {student.languages?.join(", ") || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground min-w-16">Country:</span>
                  <span className="text-sm font-medium">
                    {student.country || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground min-w-16">Passport:</span>
                  <span className="text-sm font-medium">
                    {student.passport_number || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground min-w-12">Phone:</span>
                  <span className="text-sm font-medium">
                    {student.phone || 'N/A'}
                  </span>
                </div>
              </div>
            )
          },
          ...(student.bookings && student.bookings.length > 0 ? [{
            title: `All Bookings (${student.bookings.length})`,
            icon: bookingEntity?.icon,
            color: bookingEntity?.color || "text-blue-500",
            children: (
              <div className="space-y-3">
                {student.bookings
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .map((booking) => (
                    <div key={booking.id} className="p-3 rounded border">
                      <BookingView booking={booking} />
                    </div>
                  ))
                }
              </div>
            )
          }] : [])
        ]}
      />
    </>
  );
}
