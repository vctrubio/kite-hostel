"use client";

import { useState, useMemo } from "react";
import StudentsBookingCard from "@/components/cards/StudentsBookingCard";
import { BillboardClass } from "@/backend/BillboardClass";

interface StudentBookingColumnProps {
  billboardClasses: BillboardClass[];
  selectedDate: string;
  onBookingDragStart?: (bookingId: string) => void;
  onBookingDragEnd?: (bookingId: string, wasDropped: boolean) => void;
}

type BookingFilter = "all" | "available" | "completed";

export default function StudentBookingColumn({
  billboardClasses,
  selectedDate,
  onBookingDragStart,
  onBookingDragEnd,
}: StudentBookingColumnProps) {
  const [filter, setFilter] = useState<BookingFilter>("available");

  const filteredBillboardClasses = useMemo(() => {
    const baseFiltered = billboardClasses.filter((billboardClass) => {
      if (filter === "completed") {
        return billboardClass.booking.status === "completed";
      }
      return billboardClass.booking.status !== "completed";
    });

    if (filter === "all" || filter === "completed") {
      return baseFiltered;
    }

    // Available = bookings that DO NOT have an event today
    return baseFiltered.filter((billboardClass) => {
      const lessons = billboardClass.lessons || [];

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
  }, [billboardClasses, selectedDate, filter]);

  return (
    <div className="col-span-1">
      <div className="flex items-center justify-between mb-4 p-3 border rounded-lg">
        <h2 className="text-xl font-semibold">
          Bookings ({filteredBillboardClasses.length})
        </h2>

        {/* All/Available Toggle */}
        <div className="flex items-center gap-1 bg-muted rounded-md p-1">
          <button
            onClick={() => setFilter("available")}
            className={`px-3 py-1 text-sm rounded transition-colors ${filter === "available"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            Available
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1 text-sm rounded transition-colors ${filter === "all"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={`px-3 py-1 text-sm rounded transition-colors ${filter === "completed"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            Completed
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {filteredBillboardClasses.length === 0 ? (
          <p className="text-muted-foreground">
            {filter === "available"
              ? "No available bookings for this date"
              : filter === "completed"
                ? "No bookings with status = completed for this date"
                : "No bookings for this date"}
          </p>
        ) : (
          filteredBillboardClasses.map((billboardClass) => {
            // Check if booking has lessons with teacher assignments
            const existingLessons = billboardClass.lessons || [];
            const hasValidLesson = existingLessons.some(
              (lesson) => lesson.teacher?.id,
            );

            return (
              <StudentsBookingCard
                key={billboardClass.booking.id}
                billboardClass={billboardClass}
                selectedDate={selectedDate}
                isDraggable={hasValidLesson && filter === "available"}
                onDragStart={onBookingDragStart}
                onDragEnd={onBookingDragEnd}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
