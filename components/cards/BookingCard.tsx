"use client";

import React, { useState, useMemo } from "react";
import {
  BookingIcon,
  HelmetIcon,
  HeadsetIcon,
  BookmarkIcon,
  FlagIcon,
} from "@/svgs";
import { Plus } from "lucide-react";
import { FormatedDateExp } from "@/components/label/FormatedDateExp";
import { LessonStatusLabel } from "@/components/label/LessonStatusLabel";
import { Duration } from "@/components/formatters/Duration";
import { BookingToLessonModal } from "@/components/modals/BookingToLessonModal";
import {
  WhiteboardClass,
  type BookingData,
  extractStudents,
} from "@/backend/WhiteboardClass";
import { useRouter } from "next/navigation";
import EventToTeacherModal from "@/components/modals/EventToTeacherModal";
import { TeacherSchedule } from "@/backend/TeacherSchedule";
import { type EventController } from "@/backend/types";
import BookingCardFooterDropdown from "@/components/whiteboard-usage/BookingCardFooterDropdown";
import { BookingProgressBar } from "@/components/formatters/BookingProgressBar";

interface BookingCardProps {
  booking: BookingData;
  bookingClass?: WhiteboardClass;
  teacherSchedules?: Map<string, TeacherSchedule>;
  selectedDate: string;
  controller?: EventController;
}

// Sub-component: Booking Header
function BookingHeader({
  booking,
  selectedDate,
  bookingClass,
}: {
  booking: BookingData;
  selectedDate: string;
  bookingClass?: WhiteboardClass;
}) {
  return (
    <div className="grid grid-cols-12 gap-3 p-4 border-b border-border/50">
      {/* Icon - 2 columns */}
      <div className="col-span-2 flex items-center justify-center">
        <BookingIcon className="w-8 h-8 text-blue-600" />
      </div>

      {/* Date and Progress - 10 columns */}
      <div className="col-span-10 space-y-2">
        {/* Top row: Date */}
        <div>
          <FormatedDateExp
            startDate={booking.date_start}
            endDate={booking.date_end}
            selectedDate={selectedDate}
            status={booking.status}
          />
        </div>

        {/* Bottom row: Progress */}
        {bookingClass && (
          <div>
            <BookingProgressBar
              eventMinutes={bookingClass.calculateBookingLessonEventMinutes()}
              totalMinutes={bookingClass.getTotalMinutes()}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Sub-component: Students Section
function StudentsSection({
  booking,
  onStudentClick,
}: {
  booking: BookingData;
  onStudentClick: (id: string) => void;
}) {
  return (
    <div className="bg-background/50 rounded-md p-3">
      <div className="flex items-center gap-3">
        {booking.students && booking.students.length > 0 ? (
          <>
            <div className="flex items-center">
              <div className="grid gap-0.5 w-fit">
                {booking.students.length === 1 && (
                  <div className="flex justify-center">
                    <HelmetIcon className="w-5 h-5 text-amber-500" />
                  </div>
                )}
                {booking.students.length === 2 && (
                  <div className="flex gap-1">
                    <HelmetIcon className="w-5 h-5 text-amber-500" />
                    <HelmetIcon className="w-5 h-5 text-amber-500" />
                  </div>
                )}
                {booking.students.length === 3 && (
                  <>
                    <div className="flex gap-1 justify-center">
                      <HelmetIcon className="w-5 h-5 text-amber-500" />
                      <HelmetIcon className="w-5 h-5 text-amber-500" />
                    </div>
                    <div className="flex justify-center">
                      <HelmetIcon className="w-5 h-5 text-amber-500" />
                    </div>
                  </>
                )}
                {booking.students.length === 4 && (
                  <>
                    <div className="flex gap-1">
                      <HelmetIcon className="w-5 h-5 text-amber-500" />
                      <HelmetIcon className="w-5 h-5 text-amber-500" />
                    </div>
                    <div className="flex gap-1">
                      <HelmetIcon className="w-5 h-5 text-amber-500" />
                      <HelmetIcon className="w-5 h-5 text-amber-500" />
                    </div>
                  </>
                )}
                {booking.students.length > 4 && (
                  <div className="flex items-center gap-1">
                    {Array.from(
                      { length: booking.students.length },
                      (_, index) => (
                        <HelmetIcon
                          key={index}
                          className="w-5 h-5 text-amber-500"
                        />
                      ),
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              {booking.students.map((studentRelation: any, index: number) => (
                <span
                  key={studentRelation.student.id}
                  className="inline-flex items-center"
                >
                  <button
                    onClick={() => onStudentClick(studentRelation.student.id)}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                  >
                    {studentRelation.student.name}
                  </button>
                  {index < booking.students.length - 1 && (
                    <span className="text-sm text-muted-foreground ml-1">
                      ,
                    </span>
                  )}
                </span>
              ))}
            </div>
          </>
        ) : (
          <>
            <HelmetIcon className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground font-medium">
              No students assigned
            </span>
          </>
        )}
      </div>
    </div>
  );
}

// Sub-component: Package Info
function PackageInfo({ booking }: { booking: BookingData }) {
  if (!booking.package) return null;
  const pricePerHour =
    Math.round(
      (booking.package.price_per_student / (booking.package.duration / 60)) *
      100,
    ) / 100;
  const durationHours = booking.package.duration / 60;
  return (
    <div className="flex items-center gap-3">
      <BookmarkIcon className="w-5 h-5 text-amber-500" />
      <div className="flex items-center gap-2 text-sm font-medium">
        <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded">
          {durationHours}h
        </span>
        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded">
          €{pricePerHour}/h
        </span>
      </div>
    </div>
  );
}

// Sub-component: Lessons Section
interface LessonsSectionProps {
  displayLessons: any[];
  onAddEventClick: (lesson: any) => void;
}

function LessonsSection({
  displayLessons,
  onAddEventClick,
}: LessonsSectionProps) {
  const getHeadsetColor = (status: string) => {
    switch (status) {
      case "planned":
        return "text-green-600";
      case "delegated":
        return "text-orange-600";
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    return `${day}-${month}`;
  };

  if (displayLessons.length === 0) return null;

  return (
    <div className="space-y-3">
      {displayLessons.map((lesson) => (
        <div
          key={lesson.id}
          className="bg-background/50 rounded-md p-3 space-y-2"
        >
          <div className="flex items-center gap-3">
            <HeadsetIcon
              className={`w-5 h-5 ${getHeadsetColor(lesson.status)}`}
            />
            <span className="text-sm font-medium flex-1">
              {lesson.teacher?.name || "Unassigned"}
            </span>
            <LessonStatusLabel
              lessonId={lesson.id}
              currentStatus={lesson.status}
            />
            <button
              onClick={() => onAddEventClick(lesson)}
              className={`p-1.5 rounded-md transition-colors ${lesson.canCreateEvent
                ? "text-green-600 hover:bg-green-500/10 hover:text-green-700"
                : "text-gray-400 cursor-not-allowed"
                }`}
              title={
                lesson.canCreateEvent
                  ? "Add event for this lesson"
                  : lesson.disabledReason
              }
              disabled={!lesson.canCreateEvent}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {lesson.events && lesson.events.length > 0 && (
            <div className="ml-8 space-y-1">
              {lesson.events.map((event: any) => (
                <div
                  key={event.id}
                  className="flex items-center gap-2 text-xs text-muted-foreground"
                >
                  <FlagIcon className="w-3 h-3" />
                  <Duration minutes={event.duration || 0} />
                  <span>{formatDate(event.date)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function BookingCard({
  booking,
  bookingClass,
  teacherSchedules,
  selectedDate,
  controller,
}: BookingCardProps) {
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedLessonForEvent, setSelectedLessonForEvent] =
    useState<any>(null);
  const router = useRouter();

  const localBookingClass = useMemo(
    () => new WhiteboardClass(booking),
    [booking],
  );

  const displayLessons = useMemo(() => {
    return localBookingClass.getLessons().map((lesson) => {
      const hasEventOnDate = selectedDate
        ? lesson.events?.some(
          (event) => event.date && event.date.startsWith(selectedDate),
        )
        : false;

      let canCreateEvent = true;
      let disabledReason = "";

      if (booking.status !== "active") {
        canCreateEvent = false;
        disabledReason = "Booking is not active";
      } else if (lesson.status !== "planned") {
        canCreateEvent = false;
        disabledReason = `Lesson is ${lesson.status}, not planned`;
      } else if (hasEventOnDate) {
        canCreateEvent = false;
        disabledReason = "Lesson already has an event on this date";
      }

      return { ...lesson, canCreateEvent, disabledReason };
    });
  }, [localBookingClass, selectedDate, booking.status]);

  const hasNonDelegatedActiveLessons = useMemo(
    () =>
      localBookingClass
        .getLessons()
        .some(
          (lesson) => lesson.status === "planned" || lesson.status === "rest",
        ),
    [localBookingClass],
  );

  const handleStudentClick = (studentId: string) => {
    router.push(`/students/${studentId}`);
  };

  const handleOpenEventModal = (lesson: any) => {
    const students = extractStudents(booking);
    setSelectedLessonForEvent({
      ...lesson,
      booking: booking, // Pass the full booking object to the modal
      students,
      studentCount: students.length,
      remainingMinutes: localBookingClass.getRemainingMinutes(),
    });
    setIsEventModalOpen(true);
  };

  const handleConfirmEvent = (eventData: any) => {
    console.log("Creating event:", eventData);
    setIsEventModalOpen(false);
    setSelectedLessonForEvent(null);
    router.refresh();
  };

  const teacherScheduleForModal =
    selectedLessonForEvent && teacherSchedules
      ? teacherSchedules.get(selectedLessonForEvent.teacher?.id || "")
      : null;

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
      <BookingHeader
        booking={booking}
        selectedDate={selectedDate}
        bookingClass={bookingClass}
      />

      <div className="p-4">
        <div className="space-y-3">
          <StudentsSection
            booking={booking}
            onStudentClick={handleStudentClick}
          />

          <LessonsSection
            displayLessons={displayLessons}
            onAddEventClick={handleOpenEventModal}
          />
        </div>
      </div>

      {!hasNonDelegatedActiveLessons && booking.status === "active" && (
        <div className="p-4 border-t border-border/50">
          <button
            onClick={() => setShowLessonModal(true)}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors p-3 border border-dashed border-blue-300 dark:border-blue-600 rounded-md hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-400 dark:hover:border-blue-500 w-full justify-center font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>Assign New Lesson</span>
          </button>
        </div>
      )}

      {showLessonModal && (
        <BookingToLessonModal
          bookingId={booking.id}
          bookingReference={booking.reference}
          onClose={() => setShowLessonModal(false)}
        />
      )}

      {selectedLessonForEvent &&
        teacherScheduleForModal &&
        selectedDate &&
        controller && (
          <EventToTeacherModal
            isOpen={isEventModalOpen}
            onClose={() => {
              setIsEventModalOpen(false);
              setSelectedLessonForEvent(null);
            }}
            lesson={selectedLessonForEvent}
            teacherSchedule={teacherScheduleForModal}
            controller={controller}
            date={selectedDate}
            onConfirm={handleConfirmEvent}
            remainingMinutes={selectedLessonForEvent.remainingMinutes}
            allowDateEdit={false}
          />
        )}

      <BookingCardFooterDropdown booking={booking} />
    </div>
  );
}
