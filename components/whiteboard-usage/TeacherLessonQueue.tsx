'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { MapPin, Trash2, Send } from 'lucide-react';
import { TeacherSchedule, type QueuedLesson as TeacherQueuedLesson } from '@/backend/TeacherSchedule';
import { FlagIcon } from '@/svgs';
import { extractStudents } from '@/backend/WhiteboardClass';
import { timeToMinutes, createUTCDateTime } from '@/components/formatters/TimeZone';
import { LOCATION_ENUM_VALUES } from '@/lib/constants';
import TeacherLessonQueueCard from '@/components/cards/LessonQueueCard';


interface DurationSettings {
  durationCapOne: number;
  durationCapTwo: number;
  durationCapThree: number;
}

interface TeacherLessonQueueProps {
  teacherSchedule?: TeacherSchedule;
  selectedDate: string;
  durationSettings: DurationSettings;
  controllerTime: string; // Time from the FlagPicker controller
  location: string;
  onCreateEvents: (events: any[]) => void;
  onRef?: (ref: any) => void;
  queueUpdateTrigger?: number;
  onQueueChange?: () => void;
  editMode?: boolean;
}

export default function TeacherLessonQueue({ 
  teacherId: _teacherId, 
  teacherName: _teacherName, 
  teacherSchedule, 
  selectedDate,
  durationSettings,
  controllerTime,
  location,
  onCreateEvents,
  onRef,
  queueUpdateTrigger,
  onQueueChange,
  editMode = false
}: TeacherLessonQueueProps) {
  const [queueLocation, setQueueLocation] = useState<string>(location);
  const [queue, setQueue] = useState<TeacherQueuedLesson[]>([]);

  // Sync queue with TeacherSchedule
  useEffect(() => {
    if (teacherSchedule) {
      setQueue(teacherSchedule.getLessonQueue());
    }
  }, [teacherSchedule, queueUpdateTrigger]);

  const addToQueue = useCallback((lesson: any) => {
    if (!teacherSchedule) return;

    const students = extractStudents(lesson.booking);
    
    // Get the booking class for this specific lesson
    const bookingClass = teacherSchedule.getBookingClassForLesson(lesson);
    const remainingMinutes = bookingClass ? bookingClass.getRemainingMinutes() : 0;
    
    const studentCount = students.length;
    let defaultDuration = durationSettings.durationCapOne;
    
    if (studentCount >= 4) {
      defaultDuration = durationSettings.durationCapThree;
    } else if (studentCount >= 2) {
      defaultDuration = durationSettings.durationCapTwo;
    }

    teacherSchedule.setQueueStartTime(controllerTime);

    teacherSchedule.addLessonToQueue(
      lesson.id,
      Math.min(defaultDuration, remainingMinutes),
      students.map(s => s.name),
      remainingMinutes
    );

    setQueue(teacherSchedule.getLessonQueue());
  }, [teacherSchedule, durationSettings, controllerTime]);

  const removeFromQueue = (lessonId: string) => {
    if (!teacherSchedule) return;
    
    teacherSchedule.removeLessonFromQueue(lessonId);
    setQueue(teacherSchedule.getLessonQueue());
    onQueueChange?.();
  };

  const adjustDuration = (lessonId: string, increment: boolean) => {
    if (!teacherSchedule) return;
    
    const lesson = queue.find(q => q.lessonId === lessonId);
    if (!lesson) return;

    const newDuration = increment ? 
      Math.min(lesson.duration + 30, lesson.remainingMinutes) : 
      Math.max(lesson.duration - 30, 30);

    teacherSchedule.updateQueueLessonDuration(lessonId, newDuration);
    setQueue(teacherSchedule.getLessonQueue());
    onQueueChange?.();
  };

  const adjustTime = (lessonId: string, increment: boolean) => {
    if (!teacherSchedule) return;
    
    const lesson = queue.find(q => q.lessonId === lessonId);
    if (!lesson) return;
    
    const currentTimeMinutes = timeToMinutes(lesson.scheduledStartTime || '09:00');
    const adjustmentMinutes = increment ? 30 : -30;
    const newTimeMinutes = currentTimeMinutes + adjustmentMinutes;
    
    if (newTimeMinutes < 360 || newTimeMinutes > 1380) return;
    
    teacherSchedule.updateQueueLessonStartTime(lessonId, adjustmentMinutes);
    setQueue(teacherSchedule.getLessonQueue());
    onQueueChange?.();
  };

  const moveUp = (lessonId: string) => {
    if (!teacherSchedule) return;
    
    teacherSchedule.moveQueueLessonUp(lessonId);
    setQueue(teacherSchedule.getLessonQueue());
    onQueueChange?.();
  };

  const moveDown = (lessonId: string) => {
    if (!teacherSchedule) return;
    
    teacherSchedule.moveQueueLessonDown(lessonId);
    setQueue(teacherSchedule.getLessonQueue());
    onQueueChange?.();
  };

  const removeGap = (lessonId: string) => {
    if (!teacherSchedule) return;
    
    teacherSchedule.removeGapForLesson(lessonId);
    setQueue(teacherSchedule.getLessonQueue());
    onQueueChange?.();
  };

  const clearQueue = () => {
    if (!teacherSchedule) return;
    
    teacherSchedule.clearQueue();
    setQueue([]);
    onQueueChange?.();
  };

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

  useEffect(() => {
    if (onRef) {
      onRef({ addToQueue });
    }
  }, [onRef, addToQueue]);

  const canSchedule = teacherSchedule ? teacherSchedule.canScheduleQueue() : false;

  const earliestTime = useMemo(() => {
    return queue.length > 0 ? queue[0].scheduledStartTime || controllerTime : controllerTime;
  }, [queue, controllerTime]);

  if (queue.length === 0 && !editMode) {
    return null;
  }

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
        <div className="flex flex-wrap gap-3">
          {queue.map((queuedLesson, index) => {
            // Check time bounds for this lesson
            const currentTimeMinutes = timeToMinutes(queuedLesson.scheduledStartTime || '09:00');
            const canMoveEarlier = currentTimeMinutes > 360 && (teacherSchedule?.canMoveQueueLessonEarlier(queuedLesson.lessonId) ?? false);
            const canMoveLater = currentTimeMinutes < 1380;
            
            const scheduledDateTime = queuedLesson.scheduledStartTime && currentTimeMinutes >= 360 && currentTimeMinutes <= 1380
              ? createUTCDateTime(selectedDate, queuedLesson.scheduledStartTime).toISOString()
              : createUTCDateTime(selectedDate, '09:00').toISOString();
            
            return (
              <TeacherLessonQueueCard
                key={queuedLesson.lessonId}
                queuedLesson={{ ...queuedLesson, scheduledDateTime }}
                location={queueLocation}
                isFirst={index === 0}
                isLast={index === queue.length - 1}
                canMoveEarlier={canMoveEarlier}
                canMoveLater={canMoveLater}
                onRemove={removeFromQueue}
                onAdjustDuration={adjustDuration}
                onAdjustTime={adjustTime}
                onMoveUp={moveUp}
                onMoveDown={moveDown}
                onRemoveGap={removeGap}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
