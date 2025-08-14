'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Play, MapPin, Trash2, Send } from 'lucide-react';
import { TeacherSchedule, type QueuedLesson as TeacherQueuedLesson } from '@/backend/TeacherSchedule';
import { HelmetIcon, FlagIcon } from '@/svgs';
import { extractStudents, WhiteboardClass } from '@/backend/WhiteboardClass';
import { LOCATION_ENUM_VALUES } from '@/lib/constants';
import { type EventController } from '@/backend/types';
import TeacherLessonQueueCard from '@/components/cards/TeacherLessonQueueCard';



interface TeacherLessonQueueProps {
  teacherId: string;
  teacherName: string;
  teacherSchedule?: TeacherSchedule;
  selectedDate: string;
  controller: EventController;
  onCreateEvents: (events: any[]) => void;
  onRef?: (ref: any) => void;
  queueUpdateTrigger?: number; // For forcing re-renders when queue changes
  onQueueChange?: () => void; // Callback when queue changes internally
}

// Helper to format duration in hours (2.5h format)
const formatDurationHours = (minutes: number): string => {
  const hours = minutes / 60;
  return hours % 1 === 0 ? `${hours}h` : `${hours.toFixed(1)}h`;
};

export default function TeacherLessonQueue({ 
  teacherId, 
  teacherName, 
  teacherSchedule, 
  selectedDate, 
  controller,
  onCreateEvents,
  onRef,
  queueUpdateTrigger,
  onQueueChange
}: TeacherLessonQueueProps) {
  const [queueLocation, setQueueLocation] = useState<string>(controller.location);

  // Sync queue location with controller location
  useEffect(() => {
    setQueueLocation(controller.location);
  }, [controller.location]);
  const [queue, setQueue] = useState<TeacherQueuedLesson[]>([]);

  // Sync queue with TeacherSchedule
  useEffect(() => {
    if (teacherSchedule) {
      setQueue(teacherSchedule.getLessonQueue());
    }
  }, [teacherSchedule, queueUpdateTrigger]); // Add queueUpdateTrigger as dependency

  // Add lesson to queue using TeacherSchedule
  const addToQueue = useCallback((lesson: any) => {
    if (!teacherSchedule) return;

    const bookingClass = new WhiteboardClass(lesson.booking);
    const students = extractStudents(lesson.booking);
    const remainingMinutes = bookingClass.getRemainingMinutes();
    
    // Calculate duration based on student count using controller logic
    const studentCount = students.length;
    let defaultDuration = controller.durationCapOne;
    
    if (studentCount >= 4) {
      defaultDuration = controller.durationCapThree;
    } else if (studentCount >= 2) {
      defaultDuration = controller.durationCapTwo;
    }

    // Set the preferred start time from controller before adding to queue
    teacherSchedule.setQueueStartTime(controller.submitTime);

    teacherSchedule.addLessonToQueue(
      lesson.id,
      Math.min(defaultDuration, remainingMinutes),
      students.map(s => s.name),
      remainingMinutes
    );

    // Update local state
    setQueue(teacherSchedule.getLessonQueue());
  }, [teacherSchedule, controller]);

  // Remove lesson from queue
  const removeFromQueue = (lessonId: string) => {
    if (!teacherSchedule) return;
    
    teacherSchedule.removeLessonFromQueue(lessonId);
    setQueue(teacherSchedule.getLessonQueue());
    // Notify parent component about queue change
    onQueueChange?.();
  };

  // Adjust duration by 30 minutes
  const adjustDuration = (lessonId: string, increment: boolean) => {
    if (!teacherSchedule) return;
    
    const lesson = queue.find(q => q.lessonId === lessonId);
    if (!lesson) return;

    const newDuration = increment ? 
      Math.min(lesson.duration + 30, lesson.remainingMinutes) : 
      Math.max(lesson.duration - 30, 30);

    teacherSchedule.updateQueueLessonDuration(lessonId, newDuration);
    setQueue(teacherSchedule.getLessonQueue());
  };

  // Adjust time by 30 minutes
  const adjustTime = (lessonId: string, increment: boolean) => {
    if (!teacherSchedule) return;
    
    const adjustmentMinutes = increment ? 30 : -30;
    teacherSchedule.updateQueueLessonStartTime(lessonId, adjustmentMinutes);
    setQueue(teacherSchedule.getLessonQueue());
  };

  // Move lesson up in queue
  const moveUp = (lessonId: string) => {
    if (!teacherSchedule) return;
    
    teacherSchedule.moveQueueLessonUp(lessonId);
    setQueue(teacherSchedule.getLessonQueue());
  };

  // Move lesson down in queue
  const moveDown = (lessonId: string) => {
    if (!teacherSchedule) return;
    
    teacherSchedule.moveQueueLessonDown(lessonId);
    setQueue(teacherSchedule.getLessonQueue());
  };

  // Clear entire queue
  const clearQueue = () => {
    if (!teacherSchedule) return;
    
    teacherSchedule.clearQueue();
    setQueue([]);
    // Notify parent component about queue change
    onQueueChange?.();
  };

  // Create events from queue
  const createEventsFromQueue = async () => {
    if (!teacherSchedule) return;

    const events = teacherSchedule.createEventsFromQueue(queueLocation, selectedDate);
    
    if (events.length > 0) {
      onCreateEvents(events);
      teacherSchedule.clearQueue();
      setQueue([]);
      // Notify parent component about queue change
      onQueueChange?.();
    }
  };

  // Expose addToQueue method to parent
  useEffect(() => {
    if (onRef) {
      onRef({ addToQueue });
    }
  }, [onRef, addToQueue]);

  // Get analysis from TeacherSchedule
  const canSchedule = teacherSchedule ? teacherSchedule.canScheduleQueue() : false;
  const totalDuration = teacherSchedule ? teacherSchedule.getQueueTotalDuration() : 0;

  if (queue.length === 0) {
    return (
      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 text-sm">
          <FlagIcon className="w-4 h-4" />
          <span>Click lesson cards to add to {teacherName}&apos;s queue</span>
          <span className="text-xs text-blue-600 dark:text-blue-400">
            • Start: {controller.submitTime} • Location: {controller.location}
          </span>
        </div>
      </div>
    );
  }

  // Get earliest queue time for the flag icon
  const earliestTime = queue.length > 0 ? queue[0].scheduledStartTime || controller.submitTime : controller.submitTime;

  return (
    <div className="mt-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
      {/* Simplified Queue Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20">
        <div className="flex items-center gap-3">
          {/* Flag icon with earliest time */}
          <div className="flex items-center gap-2">
            <FlagIcon className="w-4 h-4" />
            <span className="font-medium text-blue-800 dark:text-blue-200 text-sm">
              {earliestTime}
            </span>
          </div>
          
          {/* Location Control with MapPin icon */}
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <select
              value={queueLocation}
              onChange={(e) => setQueueLocation(e.target.value)}
              className="text-sm border border-gray-300 dark:border-gray-500 rounded px-2 py-1 dark:bg-gray-700 dark:text-white"
            >
              {LOCATION_ENUM_VALUES.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Clear All Button - Trash Icon */}
          <button
            onClick={clearQueue}
            className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded border border-red-200 dark:border-red-800"
            title="Clear All"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          
          {/* Submit Button - Airplane Icon */}
          {canSchedule ? (
            <button
              onClick={createEventsFromQueue}
              className="p-2 bg-green-600 hover:bg-green-700 text-white rounded"
              title="Submit Queue"
            >
              <Send className="w-4 h-4" />
            </button>
          ) : (
            <span className="text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-2 py-1 rounded">
              ⚠ Cannot schedule
            </span>
          )}
        </div>
      </div>

      {/* Queue Cards - Wider with more spacing */}
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {queue.map((queuedLesson, index) => (
            <TeacherLessonQueueCard
              key={queuedLesson.lessonId}
              queuedLesson={queuedLesson}
              location={queueLocation}
              isFirst={index === 0}
              isLast={index === queue.length - 1}
              canMoveEarlier={teacherSchedule?.canMoveQueueLessonEarlier(queuedLesson.lessonId) ?? false}
              onRemove={removeFromQueue}
              onAdjustDuration={adjustDuration}
              onAdjustTime={adjustTime}
              onMoveUp={moveUp}
              onMoveDown={moveDown}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
