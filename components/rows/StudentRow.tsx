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
      {isExpanded && (
        <tr>
          <td colSpan={8} className="py-4 px-4 bg-background/30">
            <div className="w-full space-y-3">
              {/* Student Details - First Line */}
              <div className="flex items-center gap-4 w-full p-3 bg-background/50 rounded-md border-l-4 border-yellow-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                  <div>
                    <span className="text-sm text-muted-foreground">Languages: </span>
                    <span className="text-sm font-medium">{student.languages?.join(", ") || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Country: </span>
                    <span className="text-sm font-medium">{student.country || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Passport: </span>
                    <span className="text-sm font-medium">{student.passport_number || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Phone: </span>
                    <span className="text-sm font-medium">{student.phone || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* All Bookings Section */}
              {student.bookings && student.bookings.length > 0 && (
                <div className="p-3 bg-background/50 rounded-md border-l-4 border-blue-500">
                  <div className="text-sm text-muted-foreground mb-2">All Bookings:</div>
                  <div className="space-y-2">
                    {student.bookings
                      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                      .map((booking) => (
                        <div key={booking.id} className="flex items-center gap-2">
                          <BookingView booking={booking} />
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
