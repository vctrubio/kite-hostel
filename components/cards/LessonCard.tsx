'use client';

import { TeacherSchedule } from '@/backend/TeacherSchedule';
import { HelmetIcon } from '@/svgs';
import { LessonStatusLabel } from '@/components/label/LessonStatusLabel';
import { Duration } from '@/components/formatters/Duration';
import { FileText } from 'lucide-react';
import { 
  extractStudents,
  WhiteboardClass
} from '@/backend/WhiteboardClass';

interface LessonCardProps {
  lesson: any;
  onLessonClick: (lesson: any) => void;
  onOpenModal?: (lesson: any) => void; // Add new prop for opening modal directly
  onRemoveFromQueue?: (lessonId: string) => void; // Add prop for removing from queue
  teacherSchedule?: TeacherSchedule;
  selectedDate: string;
}

export default function LessonCard({ 
  lesson, 
  onLessonClick, 
  onOpenModal,
  onRemoveFromQueue,
  teacherSchedule,
  selectedDate
}: LessonCardProps) {
  // Create WhiteboardClass instance for booking calculations
  const bookingClass = new WhiteboardClass(lesson.booking);
  const students = extractStudents(lesson.booking);
  const totalMinutes = bookingClass.getTotalMinutes();
  const usedMinutes = bookingClass.getUsedMinutes();
  
  // Check for events on the selected date using TeacherSchedule
  let eventForSelectedDate = null;
  let lessonHasEvent = false;
  
  if (teacherSchedule) {
    const scheduleNodes = teacherSchedule.getNodes();
    eventForSelectedDate = scheduleNodes.find(node => 
      node.type === 'event' && 
      node.eventData?.lessonId === lesson.id
    );
    lessonHasEvent = !!eventForSelectedDate;
  }
  
  // Fallback to checking lesson events directly if no schedule
  if (!lessonHasEvent && lesson.events) {
    lessonHasEvent = lesson.events.some((event: any) => {
      if (!event?.date) return false;
      const eventDate = new Date(event.date);
      const filterDate = new Date(selectedDate);
      eventDate.setHours(0, 0, 0, 0);
      filterDate.setHours(0, 0, 0, 0);
      return eventDate.getTime() === filterDate.getTime();
    });
  }
  
  // Calculate minutes for selected date's events
  const selectedDateEventMinutes = lesson.events?.reduce((total: number, event: any) => {
    return total + (event.duration || 0);
  }, 0) || 0;

  // Calculate remaining minutes using business logic
  const remainingMinutes = bookingClass.getRemainingMinutes() - selectedDateEventMinutes;

  // Get teacher availability if schedule is provided
  const teacherAvailability = teacherSchedule ? 
    teacherSchedule.getAvailableSlots(remainingMinutes) : [];

  // Check if booking needs attention
  const bookingIssues = bookingClass.needsAttention();

  // Check if lesson is in the queue
  const isInQueue = teacherSchedule ? 
    teacherSchedule.getLessonQueue().some(q => q.lessonId === lesson.id) : false;

  // Get border color based on event status
  const getBorderColor = (): string => {
    // If lesson is in queue, show grey border (highest priority)
    if (isInQueue) {
      return 'border-l-4 border-gray-500 dark:border-gray-400';
    }

    if (bookingIssues.hasIssues) {
      return 'border-l-4 border-orange-500';
    }
    
    if (!lessonHasEvent) {
      return ''; // No border for lessons without events
    }
    
    // Find the actual event to get its status
    let eventStatus = null;
    if (lesson.events) {
      const todayEvent = lesson.events.find((event: any) => {
        if (!event?.date) return false;
        const eventDate = new Date(event.date);
        const filterDate = new Date(selectedDate);
        eventDate.setHours(0, 0, 0, 0);
        filterDate.setHours(0, 0, 0, 0);
        return eventDate.getTime() === filterDate.getTime();
      });
      eventStatus = todayEvent?.status;
    }
    
    // Return color based on event status
    switch (eventStatus) {
      case 'planned':
        return 'border-l-4 border-blue-500 dark:border-blue-400';
      case 'tbc':
        return 'border-l-4 border-purple-500 dark:border-purple-400';
      case 'completed':
        return 'border-l-4 border-green-500 dark:border-green-400';
      case 'cancelled':
        return 'border-l-4 border-red-500 dark:border-red-400';
      default:
        return 'border-l-4 border-gray-500 dark:border-gray-400';
    }
  };

  return (
    <div 
      className={`flex items-center justify-between p-3 bg-muted dark:bg-gray-700 rounded-lg transition-all duration-200 ${getBorderColor()} ${
        lesson.status === 'planned' && !lessonHasEvent 
          ? `cursor-pointer ${isInQueue 
              ? 'hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-600' 
              : 'hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-300 dark:hover:border-green-600'}`
          : ''
      } ${isInQueue ? 'bg-gray-100 dark:bg-gray-600' : ''}`}
      onClick={() => {
        // Only allow queue interaction if lesson is planned and has no event for selected date
        if (lesson.status === 'planned' && !lessonHasEvent) {
          if (isInQueue) {
            // Remove from queue
            onRemoveFromQueue?.(lesson.id);
          } else {
            // Add to queue
            onLessonClick(lesson);
          }
        }
      }}
      title={
        lesson.status === 'planned' && !lessonHasEvent
          ? isInQueue 
            ? 'Click to remove from queue'
            : 'Click to add to queue'
          : undefined
      }
    >
      {/* Left side: Students */}
      <div className="flex items-center gap-3">
        {/* Helmet icons for students */}
        <div className="flex gap-1">
          {students.map((_, index) => (
            <HelmetIcon 
              key={index} 
              className="w-5 h-5 text-yellow-500"
            />
          ))}
        </div>
        
        {/* Student names and booking progress */}
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap gap-1">
            {students.map((student, index) => (
              <span key={student.id} className="text-sm text-foreground dark:text-white">
                {student.name}
                {index < students.length - 1 && ','}
              </span>
            ))}
          </div>
          
          {/* Progress indicator */}
          <div className="text-xs text-muted-foreground">
            {bookingClass.getCompletionPercentage().toFixed(0)}% complete
            {bookingIssues.hasIssues && (
              <span className="ml-2 text-orange-600">⚠️ Needs attention</span>
            )}
          </div>
        </div>
      </div>

      {/* Right side: Status, Duration, Availability, and Actions */}
      <div className="flex items-center gap-3">
        {/* Status and Duration Info */}
        <div className="text-right">
          {isInQueue ? (
            <div className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded-full border border-gray-300 dark:border-gray-500">
              IN QUEUE
            </div>
          ) : (
            <div onClick={(e) => e.stopPropagation()}>
              <LessonStatusLabel 
                lessonId={lesson.id} 
                currentStatus={lesson.status}
                lessonEvents={lesson.events || []}
                hasEventToday={lessonHasEvent}
              />
            </div>
          )}
          <div className="text-sm text-muted-foreground dark:text-gray-400">
            <Duration minutes={remainingMinutes} /> remaining
            {selectedDateEventMinutes > 0 && eventForSelectedDate && (
              <span className="ml-1 text-xs text-blue-500 dark:text-blue-400">
                | {eventForSelectedDate.startTime} + <Duration minutes={eventForSelectedDate.duration} />
              </span>
            )}
          </div>
          
          {/* Teacher availability indicator */}
          {teacherSchedule && teacherAvailability.length > 0 && (
            <div className="text-xs text-green-600 dark:text-green-400">
              {teacherAvailability.length} slot{teacherAvailability.length > 1 ? 's' : ''} available
            </div>
          )}
        </div>

        {/* Form icon for individual event creation - only show if lesson is planned and has no event */}
        {lesson.status === 'planned' && !lessonHasEvent && onOpenModal && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenModal(lesson);
            }}
            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
            title="Create single event"
          >
            <FileText className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
