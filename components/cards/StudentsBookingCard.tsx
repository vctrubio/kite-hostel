"use client";

import { BookingProgressBar } from "@/components/formatters/BookingProgressBar";
import { WhiteboardClass, extractStudents } from "@/backend/WhiteboardClass";
import { HelmetIcon, BookingIcon, HeadsetIcon, FlagIcon } from "@/svgs";
import { FormatedDateExp } from "@/components/label/FormatedDateExp";
import { BookingToLessonModal } from "@/components/modals/BookingToLessonModal";
import { Duration } from "@/components/formatters/Duration";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

interface StudentsBookingCardProps {
  booking: any;
  onDragStart?: (booking: any) => void;
  selectedDate?: string;
  onCreateEvents?: (lessonIds: string[]) => void;
  teachers?: any[]; // Teachers available for lesson assignment (already filtered to exclude those with lessons)
  isDraggable?: boolean; // Whether this booking can be dragged (has lesson with teacher_id)
}

// Lesson Section Component
function LessonsSection({ lessons }: { lessons: any[] }) {
  if (lessons.length === 0) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    return `${day}-${month}`;
  };

  return (
    <div className="space-y-2 mt-3">
      {lessons.map((lesson) => (
        <div
          key={lesson.id}
          className="bg-background/50 rounded p-2 space-y-2"
        >
          {/* Lesson info */}
          <div className="flex items-center gap-2 text-xs">
            <HeadsetIcon className="w-4 h-4 text-green-600" />
            <span className="font-medium flex-1">{lesson.teacher?.name || "Unknown Teacher"}</span>
            {lesson.commission && (
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                €{lesson.commission.price_per_hour}/h
              </span>
            )}
          </div>
          
          {/* Events for this lesson */}
          {lesson.events && lesson.events.length > 0 && (
            <div className="ml-6 space-y-1">
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

export default function StudentsBookingCard({ booking, onDragStart, selectedDate, onCreateEvents, teachers, isDraggable = false }: StudentsBookingCardProps) {
  const router = useRouter();
  const [showLessonModal, setShowLessonModal] = useState(false);
  const modalId = `lesson-modal-${booking.id}`;
  
  // Use useMemo for bookingClass initialization
  const bookingClass = useMemo(() => new WhiteboardClass(booking), [booking]);
  const students = useMemo(() => extractStudents(booking), [booking]);
  
  // Get existing lessons from the booking
  const existingLessons = useMemo(() => {
    return bookingClass.getLessons() || [];
  }, [bookingClass]);
  
  // Check which teachers are already assigned
  const assignedTeacherIds = useMemo(() => {
    return new Set(existingLessons.map(lesson => lesson.teacher?.id).filter(Boolean));
  }, [existingLessons]);

  // Check if there are any active non-delegated lessons
  const hasNonDelegatedActiveLessons = useMemo(
    () => existingLessons.some(
      (lesson) => lesson.status === "planned" || lesson.status === "rest"
    ),
    [existingLessons]
  );

  const handleDragStart = (e: React.DragEvent) => {
    // Include lesson IDs for event creation
    const lessonIds = existingLessons.map(lesson => lesson.id);
    
    e.dataTransfer.setData("text/plain", JSON.stringify({
      bookingId: booking.id,
      booking: booking,
      assignedTeacherIds: Array.from(assignedTeacherIds),
      lessonIds: lessonIds // Pass lesson IDs for event creation
    }));
    onDragStart?.(booking);
  };

  return (
    <div 
      draggable={isDraggable}
      onDragStart={handleDragStart}
      className={`p-4 bg-card rounded-lg border border-border transition-shadow ${
        isDraggable 
          ? "cursor-grab hover:shadow-md active:cursor-grabbing border-green-200 dark:border-green-800" 
          : "opacity-75"
      }`}
      style={{ position: 'relative' }}
    >
      <div className="flex flex-col gap-3">
        {/* Date information with progress bar */}
        {selectedDate && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex items-center gap-2 text-xs">
              <BookingIcon className="w-4 h-4 text-blue-500" />
              <FormatedDateExp
                startDate={booking.date_start}
                endDate={booking.date_end}
                selectedDate={selectedDate}
                status={booking.status}
              />
            </div>
            <div className="flex-grow sm:ml-2">
              <BookingProgressBar
                eventMinutes={bookingClass.calculateBookingLessonEventMinutes()}
                totalMinutes={bookingClass.getTotalMinutes()}
              />
            </div>
          </div>
        )}
        
        {/* Student names with helmet icons */}
        <div className="flex items-center gap-2">
          {/* Helmet icons */}
          <div className="flex gap-1 flex-shrink-0">
            {students.map((_, index) => (
              <HelmetIcon key={index} className="w-4 h-4 text-yellow-500" />
            ))}
          </div>
          
          {/* Student names */}
          <div className="flex flex-wrap gap-1">
            {students.map((student, index) => (
              <span
                key={student.id}
                className="text-sm font-medium text-foreground"
              >
                {student.name}
                {index < students.length - 1 && ","}
              </span>
            ))}
          </div>
        </div>
        
        {/* Existing lessons */}
        <LessonsSection lessons={existingLessons} />
        
        {/* Bottom section for the Assign New Lesson button - only shown when no active lessons */}
        {booking.status === "active" && teachers && (
          <div className="border-t border-border/50 pt-3 -mx-4 -mb-3 px-4 pb-3">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowLessonModal(true);
              }}
              className="flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors p-3 border border-dashed border-blue-300 dark:border-blue-600 rounded-md hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-400 dark:hover:border-blue-500 w-full font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>Assign Teacher</span>
            </button>
          </div>
        )}
      </div>
      
      {/* Lesson Assignment Modal */}
      {showLessonModal && teachers && (
        <BookingToLessonModal
          key={modalId}
          bookingId={booking.id}
          bookingReference={booking.reference}
          onClose={() => {
            setShowLessonModal(false);
          }}
          teachers={teachers}
          onCommissionCreated={() => {
            // Refresh the page to update data after lesson is created
            setShowLessonModal(false);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}