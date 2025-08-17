'use client';

import React, { useState, useMemo } from "react";
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
import {
  WhiteboardClass,
  type BookingData,
  extractStudents,
} from "@/backend/WhiteboardClass";
import { useRouter } from "next/navigation";
import EventToTeacherModal from "@/components/modals/EventToTeacherModal";
import { TeacherSchedule } from "@/backend/TeacherSchedule";
import { type EventController } from "@/backend/types";

interface BookingCardProps {
  booking: BookingData;
  teacherSchedules?: Map<string, TeacherSchedule>;
  selectedDate?: string;
  controller?: EventController;
}

// Sub-component: Booking Header (no changes)
function BookingHeader({ booking }: { booking: BookingData }) {
  return (
    <div className="flex items-center gap-2 mb-3 p-4">
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

// Sub-component: Students Section (no changes)
function StudentsSection({ booking, onStudentClick }: { booking: BookingData, onStudentClick: (id: string) => void }) {
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

// Sub-component: Package Info (no changes)
function PackageInfo({ booking }: { booking: BookingData }) {
  if (!booking.package) return null;
  const pricePerHour = Math.round((booking.package.price_per_student / (booking.package.duration / 60)) * 100) / 100;
  const durationHours = booking.package.duration / 60;
  return (
    <div className="flex items-center gap-2">
      <PackageIcon className="w-6 h-6 text-amber-500" />
      <span className="text-sm font-medium">{durationHours}h</span>
      <span className="text-sm font-medium">€{pricePerHour}/h</span>
    </div>
  );
}

// Sub-component: Lessons Section (UPDATED)
interface LessonsSectionProps {
  displayLessons: any[];
  onAddEventClick: (lesson: any) => void;
}

function LessonsSection({ displayLessons, onAddEventClick }: LessonsSectionProps) {
  const getHeadsetColor = (status: string) => {
    switch (status) {
      case "planned": return "text-green-600";
      case "delegated": return "text-orange-800";
      case "cancelled": return "text-red-600";
      case "rest": return "text-blue-600";
      case "completed": return "text-gray-400";
      default: return "text-gray-500";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
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
            <button
              onClick={() => onAddEventClick(lesson)}
              className={`ml-auto p-1 rounded-full transition-colors ${
                lesson.canCreateEvent
                  ? 'text-green-600 hover:bg-green-500/10'
                  : 'text-gray-400'
              }`}
              title={lesson.canCreateEvent ? "Add event for this lesson" : lesson.disabledReason}
              disabled={!lesson.canCreateEvent}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="pl-8 space-y-1">
            {lesson.events?.map((event: any) => (
              <div key={event.id} className="flex items-center gap-2 text-xs">
                <FlagIcon className="w-4 h-4" />
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

export default function BookingCard({
  booking,
  teacherSchedules,
  selectedDate,
  controller,
}: BookingCardProps) {
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedLessonForEvent, setSelectedLessonForEvent] = useState<any>(null);
  const router = useRouter();

  const bookingClass = useMemo(() => new WhiteboardClass(booking), [booking]);

  const displayLessons = useMemo(() => {
    return bookingClass
      .getLessons()
      .map(lesson => {
        const hasEventOnDate = selectedDate
          ? lesson.events?.some(event => event.date && event.date.startsWith(selectedDate))
          : false;

        let canCreateEvent = true;
        let disabledReason = "";

        if (booking.status !== 'active') {
          canCreateEvent = false;
          disabledReason = "Booking is not active";
        } else if (lesson.status !== 'planned') {
          canCreateEvent = false;
          disabledReason = `Lesson is ${lesson.status}, not planned`;
        } else if (hasEventOnDate) {
          canCreateEvent = false;
          disabledReason = "Lesson already has an event on this date";
        }

        return { ...lesson, canCreateEvent, disabledReason };
      });
  }, [bookingClass, selectedDate, booking.status]);

  const hasNonDelegatedActiveLessons = useMemo(() => 
    bookingClass
      .getLessons()
      .some((lesson) => lesson.status === "planned" || lesson.status === "rest"), 
    [bookingClass]
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
      remainingMinutes: bookingClass.getRemainingMinutes(),
    });
    setIsEventModalOpen(true);
  };

  const handleConfirmEvent = (eventData: any) => {
    console.log("Creating event:", eventData);
    setIsEventModalOpen(false);
    setSelectedLessonForEvent(null);
    router.refresh();
  };

  const teacherScheduleForModal = selectedLessonForEvent && teacherSchedules
    ? teacherSchedules.get(selectedLessonForEvent.teacher?.id || '')
    : null;

  return (
    <div className="bg-card border border-border rounded-lg hover:shadow-md transition-shadow">
      <BookingHeader booking={booking} />

      <div className="border flex flex-col bg-muted-foreground/20 dark:bg-muted/10 rounded-lg py-2 gap-2 p-4">
        <StudentsSection
          booking={booking}
          onStudentClick={handleStudentClick}
        />
        <PackageInfo booking={booking} />
        <LessonsSection
          displayLessons={displayLessons}
          onAddEventClick={handleOpenEventModal}
        />
      </div>

      <div className="p-4">
        {!hasNonDelegatedActiveLessons && (
          <button
            onClick={() => setShowLessonModal(true)}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors p-2 border border-dashed border-blue-300 dark:border-blue-600 rounded-md hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-400 dark:hover:border-blue-500 w-full justify-center"
          >
            <Plus className="w-4 h-4" />
            <span>Assign New Lesson</span>
          </button>
        )}
      </div>

      {showLessonModal && (
        <BookingToLessonModal
          bookingId={booking.id}
          bookingReference={booking.reference}
          onClose={() => setShowLessonModal(false)}
        />
      )}
      
      {selectedLessonForEvent && teacherScheduleForModal && selectedDate && controller && (
        <EventToTeacherModal
          isOpen={isEventModalOpen}
          onClose={() => {
            setIsEventModalOpen(false);
            setSelectedLessonForEvent(null);
          }}
          lesson={selectedLessonForEvent}
          teacherSchedule={teacherScheduleForModal}
          controller={controller}
          selectedDate={selectedDate}
          onConfirm={handleConfirmEvent}
          remainingMinutes={selectedLessonForEvent.remainingMinutes}
        />
      )}
    </div>
  );
}