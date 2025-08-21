"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Send } from "lucide-react";
import { DateSince } from "@/components/formatters/DateSince";
import { Duration } from "@/components/formatters/Duration";
import { format } from "date-fns";
import { getEventStatusColor } from "@/lib/constants";

interface EventRowProps {
  data: {
    id: string;
    date: string;
    duration: number;
    location: string;
    status: string;
    created_at: string;
    teacher: { id: string; name: string } | null;
    commission_per_hour: number | null;
    package: {
      description: string | null;
      price_per_student: number | null;
      duration: number | null;
    } | null;
    kite: {
      model: string | null;
      serial_id: string | null;
    } | null;
    students: string[] | null;
    student_count: number | null;
  };
  expandedRow: string | null;
  setExpandedRow: (id: string | null) => void;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
}

export function EventRow({ data: event, expandedRow, setExpandedRow }: EventRowProps) {
  const isExpanded = expandedRow === event.id;
  const router = useRouter();

  const toggleExpand = () => {
    if (isExpanded) {
      setExpandedRow(null);
    } else {
      setExpandedRow(event.id);
    }
  };

  // Calculate total revenue for this event
  const calculateTotal = () => {
    if (event.package?.price_per_student && event.student_count && event.duration && event.package?.duration) {
      const hours = event.duration / 60;
      const packageHours = event.package.duration / 60;
      const pricePerHour = event.package.price_per_student / packageHours;
      return Math.round(pricePerHour * hours * event.student_count);
    }
    return 0;
  };

  const total = calculateTotal();
  const pricePerHour = event.package?.price_per_student && event.package?.duration 
    ? Math.round(event.package.price_per_student / (event.package.duration / 60))
    : 0;

  return (
    <>
      <tr className="border-b border-border">
        <td className="py-2 px-4 text-left">
          {format(new Date(event.date), "dd-MM-yy | HH:mm")}
        </td>
        <td className="py-2 px-4 text-left">{event.teacher?.name || "N/A"}</td>
        <td className="py-2 px-4 text-left">
          {event.students?.join(", ") || "N/A"}
        </td>
        <td className="py-2 px-4 text-left">{event.location}</td>
        <td className="py-2 px-4 text-left">
          <Duration minutes={event.duration} />
        </td>
        <td className="py-2 px-4 text-left">
          {event.kite?.model && event.kite?.serial_id 
            ? `${event.kite.model} (${event.kite.serial_id})`
            : "N/A"
          }
        </td>
        <td className="py-2 px-4 text-left">€{total}</td>
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
                router.push(`/events/${event.id}`);
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
              <div className="flex items-center gap-4 w-full p-3 bg-background/50 rounded-md border-l-4 border-teal-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                  <div>
                    <span className="text-sm text-muted-foreground">Status: </span>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getEventStatusColor(event.status as any)}`}>
                      {event.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Package: </span>
                    <span className="text-sm font-medium">{event.package?.description || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Price per Hour: </span>
                    <span className="text-sm font-medium">€{pricePerHour}/h</span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Commission per Hour: </span>
                    <span className="text-sm font-medium">€{event.commission_per_hour || 0}/h</span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Student Count: </span>
                    <span className="text-sm font-medium">{event.student_count || 0}</span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Created: </span>
                    <span className="text-sm font-medium">
                      <DateSince dateString={event.created_at} />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}