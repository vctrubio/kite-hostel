"use client";

import React, { useState } from "react";
import {
  BookingIcon,
  HelmetIcon,
  HeadsetIcon,
  PackageIcon,
  FlagIcon,
} from "@/svgs";
import { Plus } from "lucide-react";
import { FormatDateRange } from "@/components/formatters/DateRange";
import { BookingStatusLabel } from "@/components/label/BookingStatusLabel";
import { LessonStatusLabel } from "@/components/label/LessonStatusLabel";
import { Duration } from "@/components/formatters/Duration";
import { DateSince } from "@/components/formatters/DateSince";
import { BookingToLessonModal } from "@/components/modals/BookingToLessonModal";
import { WhiteboardClass, type BookingData } from "@/backend/WhiteboardClass";
import { useRouter } from "next/navigation";

interface BookingCardProps {
  booking: BookingData;
}

// Sub-component: Booking Header
interface BookingHeaderProps {
  booking: BookingData;
}

function BookingHeader({ booking }: BookingHeaderProps) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <BookingIcon className="w-6 h-5 text-primary" />
      <FormatDateRange
        startDate={booking.date_start}
        endDate={booking.date_end}
      />
      <div className="ml-auto">
        <BookingStatusLabel
          bookingId={booking.id}
          currentStatus={booking.status}
        />
      </div>
    </div>
  );
}

// Sub-component: Students Section
interface StudentsProps {
  booking: BookingData;
  onStudentClick: (studentId: string) => void;
}

function StudentsSection({ booking, onStudentClick }: StudentsProps) {
  return (
    <div className="flex items-center gap-2">
      {booking.students && booking.students.length > 0 ? (
        <>
          <div className="flex items-center gap-1">
            {Array.from({ length: booking.students.length }, (_, index) => (
              <HelmetIcon key={index} className="w-6 h-6 text-amber-500" />
            ))}
          </div>
          <div className="flex flex-wrap gap-1">
            {booking.students.map((studentRelation: any, index: number) => (
              <span
                key={studentRelation.student.id}
                className="inline-flex items-center"
              >
                <button
                  onClick={() => onStudentClick(studentRelation.student.id)}
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                >
                  {studentRelation.student.name}
                </button>
                {index < booking.students.length - 1 && (
                  <span className="text-sm text-muted-foreground ml-1">,</span>
                )}
              </span>
            ))}
          </div>
        </>
      ) : (
        <>
          <HelmetIcon className="w-6 h-6 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            No students assigned
          </span>
        </>
      )}
    </div>
  );
}

// Sub-component: Package Info
interface PackageInfoProps {
  booking: BookingData;
}

function PackageInfo({ booking }: PackageInfoProps) {
  if (!booking.package) return null;

  const pricePerHour =
    Math.round(
      (booking.package.price_per_student / (booking.package.duration / 60)) *
      100,
    ) / 100;
  const durationHours = booking.package.duration / 60;

  return (
    <div className="flex items-center gap-2">
      <PackageIcon className="w-6 h-6 text-amber-500" />
      <span className="text-sm font-medium">{durationHours}h</span>
      <span className="text-sm font-medium">€{pricePerHour}/h</span>
    </div>
  );
}

// Sub-component: Completion Notification
interface CompletionNotificationProps {
  booking: BookingData;
  isCompleting: boolean;
  onComplete: () => void;
}

function CompletionNotification({
  booking,
  isCompleting,
  onComplete,
}: CompletionNotificationProps) {
  return (
    <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200 dark:border-green-800 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <h4 className="text-sm font-semibold text-green-800 dark:text-green-200">
              Booking Complete
            </h4>
          </div>
          <p className="text-xs text-green-700 dark:text-green-300 mb-3">
            All package hours have been completed. Please change status to
            completed.
          </p>

          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-green-600 dark:text-green-400 font-medium">
              Students:
            </span>
            <div className="flex items-center gap-1">
              {booking.students?.map((studentRelation: any, index: number) => (
                <span
                  key={studentRelation.student.id}
                  className="inline-flex items-center"
                >
                  <span className="text-xs text-green-700 dark:text-green-300 font-medium">
                    {studentRelation.student.name}
                  </span>
                  {index < booking.students.length - 1 && (
                    <span className="text-xs text-green-600 dark:text-green-400 mx-1">
                      •
                    </span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={onComplete}
          disabled={isCompleting}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 dark:bg-green-700 dark:hover:bg-green-600 dark:disabled:bg-green-800 text-white text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-background"
        >
          {isCompleting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Completing...</span>
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>Mark Complete</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// Sub-component: Lessons Section
interface LessonsSectionProps {
  displayLessons: any[];
}

function LessonsSection({
  displayLessons,
}: LessonsSectionProps) {
  const getHeadsetColor = (status: string) => {
    switch (status) {
      case "planned":
        return "text-green-600";
      case "delegated":
        return "text-orange-800";
      case "cancelled":
        return "text-red-600";
      case "rest":
        return "text-blue-600";
      case "completed":
        return "text-gray-400";
      default:
        return "text-gray-500";
    }
  };

  const getLessonColorFromEvent = (status: string) => {
    // TODO: Implement color logic for FlagIcon based on event status
    // completed: should be default color (no class)
    // tbc: should be purple
    // planned: should be grey
    return "";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day}-${month}`;
  };

  return (
    <div className="space-y-4">
      {displayLessons.map((lesson) => (
        <div key={lesson.id} className="space-y-2">
          <div className="flex items-center gap-2">
            <HeadsetIcon className={`w-6 h-6 ${getHeadsetColor(lesson.status)}`} />
            <span className="text-sm font-medium">
              {lesson.teacher?.name || "Unassigned"}
            </span>
            <LessonStatusLabel lessonId={lesson.id} currentStatus={lesson.status} />
          </div>
          <div className="pl-8 space-y-1">
            {lesson.events?.map((event: any) => (
              <div key={event.id} className="flex items-center gap-2 text-xs">
                <FlagIcon className={`w-4 h-4 ${getLessonColorFromEvent(event.status)}`} />
                <Duration minutes={event.duration || 0} />
                <span>{formatDate(event.date)}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Sub-component: Debug Section (includes completed events)
interface DebugSectionProps {
  booking: BookingData;
  allEvents: any[];
  completedEvents: any[];
}

function DebugSection({
  booking,
  allEvents,
  completedEvents,
}: DebugSectionProps) {
  const [showCompletedEvents, setShowCompletedEvents] = useState(false);

  return (
    <div className="pt-3 border-t border-border space-y-2">
      {/* Package and Booking IDs */}
      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <div>
          <span className="font-medium">Package ID:</span>
          <div className="truncate">
            {booking.package?.id?.slice(-8) || "N/A"}
          </div>
        </div>
        <div>
          <span className="font-medium">Booking ID:</span>
          <div className="truncate">{booking.id.slice(-8)}</div>
        </div>
      </div>

      {/* Lesson IDs */}
      {booking.lessons && booking.lessons.length > 0 && (
        <div className="text-xs text-muted-foreground">
          <span className="font-medium">Lesson IDs:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {booking.lessons.map((lesson: any, index: number) => (
              <span key={lesson.id} className="inline-flex items-center">
                <span className="bg-muted px-2 py-1 rounded text-xs">
                  {lesson.id.slice(-8)}
                </span>
                {index < booking.lessons.length - 1 && (
                  <span className="mx-1">,</span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Event IDs */}
      {allEvents.length > 0 && (
        <div className="text-xs text-muted-foreground">
          <span className="font-medium">Event IDs:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {allEvents.map((event: any, index: number) => (
              <span key={event.id} className="inline-flex items-center">
                <span className="bg-muted px-2 py-1 rounded text-xs">
                  {event.id.slice(-8)}
                </span>
                {index < allEvents.length - 1 && (
                  <span className="mx-1">,</span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Completed Events (Debug Dropdown) */}
      {completedEvents.length > 0 && (
        <div className="text-xs text-muted-foreground">
          <button
            onClick={() => setShowCompletedEvents(!showCompletedEvents)}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            <span className="font-medium">
              Completed Events ({completedEvents.length}):
            </span>
            <span className="text-xs">{showCompletedEvents ? "▼" : "▶"}</span>
          </button>
          {showCompletedEvents && (
            <div className="mt-1 space-y-1 max-h-24 overflow-y-auto">
              {completedEvents.map((event: any) => (
                <div
                  key={event.id}
                  className="flex items-center gap-2 text-xs px-2 py-1 border border-border rounded bg-muted/30"
                >
                  <FlagIcon className="w-3 h-3" />
                  <DateSince dateString={event.date} />
                  <Duration minutes={event.duration || 0} />
                  <span className="text-muted-foreground truncate">
                    {event.kites && event.kites.length > 0
                      ? event.kites
                        .map((kiteEvent: any) => kiteEvent.kite?.model)
                        .join(", ")
                      : "No kites"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function BookingCard({ booking }: BookingCardProps) {
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const router = useRouter();

  // Create WhiteboardClass instance from raw data
  const bookingClass = new WhiteboardClass(booking);

  // Use class methods instead of manual calculations
  const completedEvents = bookingClass.getCompletedEvents();
  const allEvents = bookingClass.getAllEvents();
  const lessonsCount = bookingClass.getLessons().length;

  // Get lessons to display (active + completed)
  const displayLessons = bookingClass
    .getLessons()
    .filter(
      (lesson) =>
        lesson.status === "planned" ||
        lesson.status === "rest" ||
        lesson.status === "completed",
    );

  // Check if there are any non-delegated active lessons
  const hasNonDelegatedActiveLessons = bookingClass
    .getLessons()
    .some((lesson) => lesson.status === "planned" || lesson.status === "rest");

  const isReadyForCompletion = bookingClass.isReadyForCompletion();

  const handleStudentClick = (studentId: string) => {
    router.push(`/students/${studentId}`);
  };

  const handleCompleteBooking = async () => {
    const validation = bookingClass.canCompleteBooking();
    if (!validation.isValid) {
      alert(validation.message);
      return;
    }

    setIsCompleting(true);
    try {
      await bookingClass.completeBookingAndLessons();
    } catch (error) {
      console.error("Error completing booking:", error);
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="p-4 bg-card border border-border rounded-lg hover:shadow-md transition-shadow">
      <BookingHeader booking={booking} />

      <div className="border flex flex-col bg-muted-foreground/20 dark:bg-muted/10 rounded-lg py-2 gap-2">
        <StudentsSection
          booking={booking}
          onStudentClick={handleStudentClick}
        />
        <PackageInfo booking={booking} />
        <LessonsSection
          displayLessons={displayLessons}
        />
      </div>

      {lessonsCount === 0 ? (
        <button
          onClick={() => setShowLessonModal(true)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors p-2 border border-dashed border-muted-foreground rounded hover:border-primary dark:hover:bg-primary/10"
        >
          <Plus className="w-5 h-5" />
          <span>No lessons - Click to add lesson</span>
        </button>
      ) : !hasNonDelegatedActiveLessons && (
        <button
          onClick={() => setShowLessonModal(true)}
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors p-2 border border-dashed border-blue-300 dark:border-blue-600 rounded-md hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-400 dark:hover:border-blue-500"
        >
          <Plus className="w-4 h-4" />
          <span>Assign New Lesson</span>
        </button>
      )}

      <DebugSection
        booking={booking}
        allEvents={allEvents}
        completedEvents={completedEvents}
      />

      {isReadyForCompletion && (
        <CompletionNotification
          booking={booking}
          isCompleting={isCompleting}
          onComplete={handleCompleteBooking}
        />
      )}
      {showLessonModal && (
        <BookingToLessonModal
          bookingId={booking.id}
          bookingReference={booking.reference}
          onClose={() => setShowLessonModal(false)}
        />
      )}
    </div>
  );
}
