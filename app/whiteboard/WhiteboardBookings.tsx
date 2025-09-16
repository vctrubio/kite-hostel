"use client";

import BookingCard from "@/components/cards/BookingCard";
import {
  WhiteboardClass,
} from "@/backend/WhiteboardClass";
import { CheckCircle } from "lucide-react";
import { TeacherSchedule } from "@/backend/TeacherSchedule";
import { type EventController } from "@/backend/types";

interface WhiteboardBookingsProps {
  bookings: any[];
  bookingClasses: WhiteboardClass[];
  teacherSchedules: Map<string, TeacherSchedule>;
  selectedDate: string;
  controller?: EventController;
  teachers: any[];
}

export default function WhiteboardBookings({
  bookings,
  bookingClasses,
  teacherSchedules,
  selectedDate,
  controller,
  teachers,
}: WhiteboardBookingsProps) {

  // Get bookings ready for completion using business logic
  const completableBookings = bookingClasses.filter((bc) =>
    bc.isReadyForCompletion(),
  );

  return (
    <div>
      {/* Enhanced Status Alerts */}
      {completableBookings.length > 0 && (
        <div className="mb-4 p-3 bg-accent/20 border border-accent/30 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-accent-foreground/80" />
            <span className="text-sm font-medium text-accent-foreground">
              {completableBookings.length} booking
              {completableBookings.length > 1 ? "s" : ""} ready for completion
            </span>
          </div>
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="p-8 bg-muted rounded-lg text-center">
          <p className="text-muted-foreground">
            No bookings found for this date
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {bookings.map((booking) => {
            // Find the corresponding booking class for progress data
            const bookingClass = bookingClasses.find(bc => bc.getId() === booking.id);
            return (
              <BookingCard
                key={booking.id}
                booking={booking}
                bookingClass={bookingClass}
                teacherSchedules={teacherSchedules}
                selectedDate={selectedDate}
                controller={controller}
                teachers={teachers}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
