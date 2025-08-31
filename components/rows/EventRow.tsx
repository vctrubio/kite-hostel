"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Send, Trash2 } from "lucide-react";
import { DateSince } from "@/components/formatters/DateSince";
import { Duration } from "@/components/formatters/Duration";
import { format } from "date-fns";
import { getEventStatusColor } from "@/lib/constants";
import { deleteEvent } from "@/actions/event-actions";
import { HelmetIcon } from "@/svgs/HelmetIcon";

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
      size: number | null;
      serial_id: string | null;
    } | null;
    students: Array<{
      id: string;
      name: string;
      last_name: string | null;
    }> | null;
    student_count: number | null;
  };
  expandedRow: string | null;
  setExpandedRow: (id: string | null) => void;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
}

export function EventRow({ data: event, expandedRow, setExpandedRow }: EventRowProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const isExpanded = expandedRow === event.id;
  const router = useRouter();

  const toggleExpand = () => {
    if (isExpanded) {
      setExpandedRow(null);
    } else {
      setExpandedRow(event.id);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleting(true);
    try {
      await deleteEvent(event.id);
      router.refresh();
    } catch (error) {
      console.error("Failed to delete event:", error);
      // Optionally, show an error message to the user
    } finally {
      setIsDeleting(false);
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
          {event.students && event.students.length > 0 ? (
            event.students.map((student, index) => (
              <span key={student.id}>
                {student.name} {student.last_name || ''}
                {index < event.students.length - 1 && ", "}
              </span>
            ))
          ) : (
            "N/A"
          )}
        </td>
        <td className="py-2 px-4 text-left">{event.location}</td>
        <td className="py-2 px-4 text-left">
          <Duration minutes={event.duration} />
        </td>
        <td className="py-2 px-4 text-left">€{total}</td>
        <td className="py-2 px-4 text-left">
          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getEventStatusColor(event.status as any)}`}>
            {event.status}
          </span>
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
                router.push(`/events/${event.id}`);
              }}
              className="h-8 w-8"
            >
              <Send className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleDelete}
              disabled={isDeleting}
              className="h-8 w-8"
            >
              <Trash2 className={`h-4 w-4 ${isDeleting ? "animate-spin" : ""}`} />
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
                    <span className="text-sm text-muted-foreground">Package: </span>
                    <span className="text-sm font-medium">{event.package?.description || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Package Duration: </span>
                    <span className="text-sm font-medium">
                      <Duration minutes={event.package?.duration || 0} />
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Kite: </span>
                    <span className="text-sm font-medium">
                      {event.kite?.model && event.kite?.serial_id 
                        ? `${event.kite.model} ${event.kite.size}m (${event.kite.serial_id})`
                        : "N/A"
                      }
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Kite Capacity: </span>
                    <span className="text-sm font-medium">{event.package?.capacity_kites || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Price per Hour per Student: </span>
                    <span className="text-sm font-medium">€{pricePerHour}/h</span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Commission per Hour: </span>
                    <span className="text-sm font-medium">€{event.commission_per_hour || 0}/h</span>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-sm text-muted-foreground">Students: </span>
                    <span className="text-sm font-medium">
                      {event.students && event.students.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mt-1">
                          {event.students.map((student) => (
                            <button
                              key={student.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/students/${student.id}`);
                              }}
                              className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs hover:bg-yellow-200 transition-colors flex items-center gap-1"
                            >
                              <HelmetIcon className="w-3 h-3" />
                              {student.name} {student.last_name || ''}
                            </button>
                          ))}
                        </div>
                      ) : (
                        "No students"
                      )}
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