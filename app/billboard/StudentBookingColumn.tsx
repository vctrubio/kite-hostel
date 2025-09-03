"use client";

import { useState, useMemo } from "react";
import StudentsBookingCard from "@/components/cards/StudentsBookingCard";
import { WhiteboardClass } from "@/backend/WhiteboardClass";

interface StudentBookingColumnProps {
  bookings: any[];
  teachers: any[];
  selectedDate: string;
  onDragStart: (booking: any) => void;
  bookingClasses: Map<string, WhiteboardClass>;
}

type BookingFilter = "all" | "available";

export default function StudentBookingColumn({
  bookings,
  teachers,
  selectedDate,
  onDragStart,
  bookingClasses,
}: StudentBookingColumnProps) {
  const [filter, setFilter] = useState<BookingFilter>("available");

  const filteredBookings = useMemo(() => {
    if (filter === "all") {
      return bookings;
    }

    // Available = bookings that DO NOT have an event today
    return bookings.filter((booking) => {
      const bookingClass = bookingClasses.get(booking.id);
      if (!bookingClass) return false;
      const lessons = bookingClass.getLessons() || [];
      
      // Check if any lesson has events for the selected date
      const hasEventToday = lessons.some((lesson) => {
        const events = lesson.events || [];
        return events.some((event: any) => {
          if (!event.date) return false;
          const eventDate = new Date(event.date);
          const filterDate = new Date(selectedDate);
          eventDate.setHours(0, 0, 0, 0);
          filterDate.setHours(0, 0, 0, 0);
          return eventDate.getTime() === filterDate.getTime();
        });
      });
      
      return !hasEventToday; // Available = no events today
    });
  }, [bookings, selectedDate, filter, bookingClasses]);

  return (
    <div className="col-span-1">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">
          Bookings ({filteredBookings.length})
        </h2>
        
        {/* All/Available Toggle */}
        <div className="flex items-center gap-1 bg-muted rounded-md p-1">
          <button
            onClick={() => setFilter("available")}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              filter === "available"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Available
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              filter === "all"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All
          </button>
        </div>
      </div>
      
      <div className="space-y-3">
        {filteredBookings.length === 0 ? (
          <p className="text-muted-foreground">
            {filter === "available" 
              ? "No available bookings for this date" 
              : "No bookings for this date"
            }
          </p>
        ) : (
          filteredBookings.map((booking) => {
            // Check if booking has lessons with teacher assignments
            const bookingClass = bookingClasses.get(booking.id);
            if (!bookingClass) return null;
            const existingLessons = bookingClass.getLessons() || [];
            const hasValidLesson = existingLessons.some(lesson => lesson.teacher?.id);
            
            const teachersWithLessons = new Set(
              existingLessons
                .map((lesson) => lesson.teacher?.id)
                .filter(Boolean),
            );

            const availableTeachers = teachers.filter(
              (teacher) => !teachersWithLessons.has(teacher.id),
            );

            return (
              <StudentsBookingCard
                key={booking.id}
                booking={booking}
                onDragStart={onDragStart}
                selectedDate={selectedDate}
                teachers={availableTeachers}
                isDraggable={hasValidLesson}
              />
            );
          })
        )}
      </div>
    </div>
  );
}