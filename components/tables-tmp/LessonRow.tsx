"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { InferSelectModel } from "drizzle-orm";
import { Lesson, Teacher, Event } from "@/drizzle/migrations/schema";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Send } from "lucide-react";
import { Duration } from "@/components/formatters/Duration";
import { getStatusColors } from "@/lib/constants";

interface LessonRowProps {
  data: InferSelectModel<typeof Lesson> & {
    teacher: InferSelectModel<typeof Teacher>;
    events: InferSelectModel<typeof Event>[];
    totalEventHours: number;
    packageCapacity: number | null;
    packageDuration: number | null;
    booking?: {
      id: string;
      package?: {
        description: string | null;
        price_per_student: number | null;
        duration: number | null;
        capacity_students: number | null;
        capacity_kites: number | null;
      } | null;
      students?: Array<{
        student: {
          id: string;
          name: string;
        };
      }> | null;
    } | null;
  };
  expandedRow: string | null;
  setExpandedRow: (id: string | null) => void;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
}

export function LessonRow({ data: lesson, expandedRow, setExpandedRow }: LessonRowProps) {
  const isExpanded = expandedRow === lesson.id;
  const router = useRouter();

  const toggleExpand = () => {
    if (isExpanded) {
      setExpandedRow(null);
    } else {
      setExpandedRow(lesson.id);
    }
  };

  // Calculate total event duration
  const totalEventMinutes = lesson.events.reduce((sum, event) => sum + event.duration, 0);
  const eventCount = lesson.events.length;
  
  // Get students from booking
  const students = lesson.booking?.students?.map(bs => bs.student.name) || [];

  return (
    <>
      <tr className="border-b border-border">
        <td className="py-2 px-4 text-left">{lesson.teacher.name}</td>
        <td className="py-2 px-4 text-left">
          {students.length > 0 ? students.join(", ") : "No students"}
        </td>
        <td className="py-2 px-4 text-left">
          {eventCount > 0 ? (
            <span>
              {eventCount} event{eventCount !== 1 ? 's' : ''} • <Duration minutes={totalEventMinutes} />
            </span>
          ) : (
            "No events"
          )}
        </td>
        <td className="py-2 px-4 text-left">
          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColors(lesson.status as any)}`}>
            {lesson.status}
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
                router.push(`/lessons/${lesson.id}`);
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
          <td colSpan={5} className="py-4 px-4 bg-background/30">
            <div className="w-full space-y-3">
              <div className="flex items-center gap-4 w-full p-3 bg-background/50 rounded-md border-l-4 border-cyan-500">
                <div className="w-full space-y-4">
                  {/* Booking and Package Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-muted-foreground">Booking ID: </span>
                      <span className="text-sm font-medium">{lesson.booking?.id || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Package: </span>
                      <span className="text-sm font-medium">{lesson.booking?.package?.description || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Package Duration: </span>
                      <span className="text-sm font-medium">
                        {lesson.booking?.package?.duration ? <Duration minutes={lesson.booking.package.duration} /> : "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Price per Student: </span>
                      <span className="text-sm font-medium">
                        €{lesson.booking?.package?.price_per_student || 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Student Capacity: </span>
                      <span className="text-sm font-medium">{lesson.booking?.package?.capacity_students || 0}</span>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Kite Capacity: </span>
                      <span className="text-sm font-medium">{lesson.booking?.package?.capacity_kites || 0}</span>
                    </div>
                  </div>

                  {/* Events Details */}
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Events:</h4>
                    {lesson.events.length > 0 ? (
                      <div className="space-y-2">
                        {lesson.events.map((event) => (
                          <div key={event.id} className="p-2 bg-background/30 rounded border">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">
                                {format(new Date(event.date), "PPP")}
                              </span>
                              <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColors(event.status as any)}`}>
                                {event.status}
                              </span>
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {event.location} • <Duration minutes={event.duration} />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No events scheduled</p>
                    )}
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
