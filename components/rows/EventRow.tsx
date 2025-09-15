"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Send, Trash2 } from "lucide-react";
import { DateSince } from "@/components/formatters/DateSince";
import { Duration } from "@/components/formatters/Duration";
import { format } from "date-fns";
import { getEventStatusColor, ENTITY_DATA } from "@/lib/constants";
import { deleteEvent } from "@/actions/event-actions";
import { HelmetIcon, KiteIcon, BookmarkIcon } from "@/svgs";
import { DropdownExpandableRow } from "./DropdownExpandableRow";
import { PackageDetails } from "@/getters/package-details";

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

  // Get entities for colors
  const packageEntity = ENTITY_DATA.find(entity => entity.name === "Package");
  const studentEntity = ENTITY_DATA.find(entity => entity.name === "Student");
  const kiteEntity = ENTITY_DATA.find(entity => entity.name === "Kite");

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
      <DropdownExpandableRow
        isExpanded={isExpanded}
        colSpan={8}
        sections={[
          ...(event.package ? [{
            title: "Package Details",
            icon: packageEntity?.icon,
            color: packageEntity?.color || "text-orange-500",
            children: (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Description:</span>
                  <p className="font-medium">{event.package.description || "No description"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Duration:</span>
                  <p className="font-medium"><Duration minutes={event.package.duration || 0} /></p>
                </div>
                <div>
                  <span className="text-muted-foreground">Price per Student:</span>
                  <p className="font-medium">€{event.package.price_per_student}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Price per Hour:</span>
                  <p className="font-medium">€{pricePerHour}/h</p>
                </div>
              </div>
            )
          }] : []),
          {
            title: (
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {event.students && event.students.length > 0 ? (
                    event.students.map((_, index) => (
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
                {event.students && event.students.length > 0 ? (
                  event.students.map((student) => (
                    <button
                      key={student.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/students/${student.id}`);
                      }}
                      className="px-2 py-1 text-sm font-medium border border-yellow-500 rounded hover:bg-muted transition-colors"
                    >
                      {student.name} {student.last_name || ''}
                    </button>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">No students assigned</span>
                )}
              </div>
            )
          },
          ...(event.kite ? [{
            title: "Equipment",
            icon: kiteEntity?.icon,
            color: kiteEntity?.color || "text-purple-500",
            children: (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Model:</span>
                  <p className="font-medium">{event.kite.model || "N/A"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Size:</span>
                  <p className="font-medium">{event.kite.size ? `${event.kite.size}m` : "N/A"}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Serial ID:</span>
                  <p className="font-medium">{event.kite.serial_id || "N/A"}</p>
                </div>
              </div>
            )
          }] : [])
        ]}
      />
    </>
  );
}