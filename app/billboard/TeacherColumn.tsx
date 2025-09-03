"use client";

import { useState, useMemo, useCallback } from "react";
import { TeacherSchedule } from "@/backend/TeacherSchedule";
import { WhiteboardClass } from "@/backend/WhiteboardClass";
import { type EventController } from "@/backend/types";
import { HeadsetIcon, FlagIcon } from "@/svgs";
import { ChevronLeft, ChevronRight, Flag } from "lucide-react";
import { createTeacherQueueEvents } from "@/actions/event-actions";
import { timeToMinutes, minutesToTime } from "@/components/formatters/TimeZone";
import TeacherRow from "./TeacherRow";

// Sub-component: Time Adjustment Flag (following WhiteboardEvents.tsx pattern)
interface TimeAdjustmentFlagProps {
  timeAdjustmentMode: boolean;
  globalTimeOffset: number;
  earliestTime: string;
  onTimeAdjustment: (minutesOffset: number) => void;
  onFlagClick: () => void;
}

function TimeAdjustmentFlag({
  timeAdjustmentMode,
  globalTimeOffset,
  earliestTime,
  onTimeAdjustment,
  onFlagClick,
}: TimeAdjustmentFlagProps) {
  if (timeAdjustmentMode) {
    return (
      <div className="flex items-center gap-2">
        <FlagIcon className="w-4 h-4" />
        <button
          onClick={() => onTimeAdjustment(-30)}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          title="Move all schedules back 30 minutes"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="min-w-[60px] text-center font-mono">
          {earliestTime}
          {globalTimeOffset !== 0 && (
            <span className="text-orange-600 dark:text-orange-400 ml-1">
              ({globalTimeOffset > 0 ? "+" : ""}{globalTimeOffset}m)
            </span>
          )}
        </span>
        <button
          onClick={() => onTimeAdjustment(30)}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          title="Move all schedules forward 30 minutes"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={onFlagClick}
      title="Toggle Time Adjustment Mode"
      className="flex items-center gap-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-2 py-1 cursor-pointer transition-colors"
    >
      <FlagIcon className="w-4 h-4" />
      <span className="text-sm">
        {earliestTime}
      </span>
    </button>
  );
}

interface TeacherColumnProps {
  teachers: any[];
  teacherSchedules: Map<string, TeacherSchedule>;
  teacherEvents: Map<string, any[]>; // Map of teacherId to their events
  selectedDate: string;
  controller: EventController;
  onDrop: (teacherId: string, e: React.DragEvent) => void;
  onTeacherSchedulesChange: (schedules: Map<string, TeacherSchedule>) => void;
  onRevalidate: () => void;
  data: any; // BillboardData
  bookingClasses: Map<string, WhiteboardClass>;
}

export default function TeacherColumn({
  teachers,
  teacherSchedules,
  teacherEvents,
  selectedDate,
  controller,
  onDrop,
  onTeacherSchedulesChange,
  onRevalidate,
  data,
  bookingClasses,
}: TeacherColumnProps) {
  // Global view/edit mode (not per teacher)
  const [globalViewMode, setGlobalViewMode] = useState<"view" | "edit">("view");
  const [timeAdjustmentMode, setTimeAdjustmentMode] = useState(false);
  const [globalTimeOffset, setGlobalTimeOffset] = useState(0);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Store original schedules for reset functionality
  const [originalSchedules, setOriginalSchedules] = useState<Map<string, TeacherSchedule>>(new Map());

  const earliestTime = useMemo(() => {
    const schedules = Array.from(teacherSchedules.values());
    const times = schedules
      .map(schedule => {
        const queue = schedule.getLessonQueue();
        return queue.length > 0 ? queue[0].scheduledStartTime : null;
      })
      .filter(Boolean);
    
    if (times.length === 0) return "No lessons scheduled";
    
    const earliest = times.sort((a, b) => a.localeCompare(b))[0];
    return earliest || controller.submitTime;
  }, [teacherSchedules, controller.submitTime]);

  const handleGlobalModeChange = (mode: "view" | "edit") => {
    if (mode === "edit" && globalViewMode === "view") {
      // Store original schedules when entering edit mode
      setOriginalSchedules(new Map(teacherSchedules));
    }
    setGlobalViewMode(mode);
  };

  const handleHasChanges = (changed: boolean) => {
    setHasChanges(changed);
  };

  const handleDrop = (teacherId: string, e: React.DragEvent) => {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData("text/plain"));
      const booking = data.booking;
      
      // Validate that booking has lessons with teacher assignments
      const bookingClass = new WhiteboardClass(booking);
      const lessons = bookingClass.getLessons() || [];
      const hasValidLesson = lessons.some(lesson => lesson.teacher?.id);
      
      if (!hasValidLesson) {
        alert("Please Assign Teacher to Booking\n\nThis booking needs a lesson with a teacher assignment before it can be scheduled.");
        return;
      }
      
      // Additional validation: check if this specific teacher is assigned to a lesson in this booking
      const hasLessonForThisTeacher = lessons.some(lesson => lesson.teacher?.id === teacherId);
      
      if (!hasLessonForThisTeacher) {
        alert("This booking is assigned to a different teacher\n\nYou can only schedule bookings that have lessons assigned to this specific teacher.");
        return;
      }
      
      // Automatically switch to edit mode when dropping
      handleGlobalModeChange("edit");
      onDrop(teacherId, e);
      handleHasChanges(true);
    } catch (error) {
      console.error("Failed to handle drop:", error);
      alert("Error processing booking drop");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleRemoveFromQueue = (teacherId: string, lessonId: string) => {
    const teacherSchedule = teacherSchedules.get(teacherId);
    if (!teacherSchedule) return;

    teacherSchedule.removeLessonFromQueue(lessonId);
    onTeacherSchedulesChange(new Map(teacherSchedules));
    handleHasChanges(true);
  };

  const handleAdjustDuration = (
    teacherId: string,
    lessonId: string,
    increment: boolean,
  ) => {
    const teacherSchedule = teacherSchedules.get(teacherId);
    if (!teacherSchedule) return;

    const lesson = teacherSchedule
      .getLessonQueue()
      .find((q) => q.lessonId === lessonId);
    if (!lesson) return;

    const adjustment = increment ? 30 : -30;
    const newDuration = Math.max(
      30,
      Math.min(lesson.remainingMinutes, lesson.duration + adjustment),
    );

    teacherSchedule.updateQueueLessonDuration(lessonId, newDuration);
    onTeacherSchedulesChange(new Map(teacherSchedules));
    handleHasChanges(true);
  };

  const handleAdjustTime = (
    teacherId: string,
    lessonId: string,
    increment: boolean,
  ) => {
    const teacherSchedule = teacherSchedules.get(teacherId);
    if (!teacherSchedule) return;

    const adjustment = increment ? 30 : -30;
    teacherSchedule.updateQueueLessonStartTime(lessonId, adjustment);
    onTeacherSchedulesChange(new Map(teacherSchedules));
    handleHasChanges(true);
  };

  const handleMoveUp = (teacherId: string, lessonId: string) => {
    const teacherSchedule = teacherSchedules.get(teacherId);
    if (!teacherSchedule) return;

    teacherSchedule.moveQueueLessonUp(lessonId);
    onTeacherSchedulesChange(new Map(teacherSchedules));
    handleHasChanges(true);
  };

  const handleMoveDown = (teacherId: string, lessonId: string) => {
    const teacherSchedule = teacherSchedules.get(teacherId);
    if (!teacherSchedule) return;

    teacherSchedule.moveQueueLessonDown(lessonId);
    onTeacherSchedulesChange(new Map(teacherSchedules));
    handleHasChanges(true);
  };

  const handleRemoveGap = (teacherId: string, lessonId: string) => {
    const teacherSchedule = teacherSchedules.get(teacherId);
    if (!teacherSchedule) return;

    teacherSchedule.removeGapForLesson(lessonId);
    onTeacherSchedulesChange(new Map(teacherSchedules));
    handleHasChanges(true);
  };

  // Time adjustment handlers
  const handleTimeAdjustment = (minutesOffset: number) => {
    const newOffset = globalTimeOffset + minutesOffset;
    setGlobalTimeOffset(newOffset);
    
    // Apply time offset to all teacher schedules
    if (newOffset !== 0) {
      const updatedSchedules = new Map(teacherSchedules);
      updatedSchedules.forEach((schedule) => {
        const queue = schedule.getLessonQueue();
        queue.forEach((lesson) => {
          const currentTime = lesson.scheduledStartTime || controller.submitTime;
          const currentMinutes = timeToMinutes(currentTime);
          const newTime = minutesToTime(currentMinutes + newOffset);
          schedule.updateQueueLessonStartTime(lesson.lessonId, newOffset);
        });
      });
      onTeacherSchedulesChange(updatedSchedules);
    }
    handleHasChanges(true);
  };

  const handleFlagClick = () => {
    if (!timeAdjustmentMode) {
      setTimeAdjustmentMode(true);
      handleGlobalModeChange("edit");
    }
  };

  const handleSubmit = async () => {
    try {
      // Process ALL queue items - both new and existing
      const queueUpdates: any[] = [];
      
      teacherSchedules.forEach((schedule) => {
        const queue = schedule.getLessonQueue();
        queue.forEach((queuedLesson) => {
          if (queuedLesson.lessonId.startsWith("lesson_")) {
            // NEW booking - create event
            const bookingId = queuedLesson.lessonId.replace("lesson_", "");
            const booking = data.bookings.find(b => b.id === bookingId);
            if (booking) {
              const bookingClass = bookingClasses?.get(bookingId);
              if (bookingClass) {
                const lessons = bookingClass.getLessons() || [];
                const assignedLesson = lessons.find(lesson => lesson.teacher?.id === schedule.getSchedule().teacherId);
                
                if (assignedLesson) {
                  queueUpdates.push({
                    type: 'create',
                    lessonId: assignedLesson.id,
                    date: selectedDate,
                    startTime: queuedLesson.scheduledStartTime || controller.submitTime,
                    duration: queuedLesson.duration,
                    location: controller.location,
                  });
                }
              }
            }
          } else {
            // EXISTING lesson - update event if time/duration changed
            const teacherId = schedule.getSchedule().teacherId;
            const events = teacherEvents.get(teacherId) || [];
            const existingEvent = events.find(event => event.lesson?.id === queuedLesson.lessonId);
            
            if (existingEvent) {
              const currentStartTime = new Date(existingEvent.date).toLocaleTimeString('en-GB', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
              });
              const newStartTime = queuedLesson.scheduledStartTime || controller.submitTime;
              const currentDuration = existingEvent.duration;
              const newDuration = queuedLesson.duration;
              
              // Check if time or duration changed
              if (currentStartTime !== newStartTime || currentDuration !== newDuration) {
                queueUpdates.push({
                  type: 'update',
                  eventId: existingEvent.id,
                  date: `${selectedDate}T${newStartTime}:00.000Z`,
                  duration: newDuration,
                });
              }
            }
          }
        });
      });

      // Execute updates
      let hasErrors = false;
      for (const update of queueUpdates) {
        try {
          if (update.type === 'create') {
            const result = await createTeacherQueueEvents([{
              lessonId: update.lessonId,
              date: update.date,
              startTime: update.startTime,
              duration: update.duration,
              location: update.location,
            }]);
            if (!result.success) hasErrors = true;
          } else if (update.type === 'update') {
            const { updateEvent } = await import('@/actions/event-actions');
            const result = await updateEvent(update.eventId, {
              date: update.date,
              duration: update.duration,
            });
            if (!result.success) hasErrors = true;
          }
        } catch (error) {
          console.error('Error processing update:', error);
          hasErrors = true;
        }
      }

      if (hasErrors) {
        alert('Some updates failed. Check console for details.');
      } else {
        console.log(`✅ Successfully processed ${queueUpdates.length} updates`);
      }

      // Always refresh to get latest data
      onRevalidate();

      // Reset to view mode
      setGlobalViewMode("view");
      setTimeAdjustmentMode(false);
      setGlobalTimeOffset(0);
      setHasChanges(false);
    } catch (error) {
      console.error('🔥 Error submitting changes:', error);
      alert('Error submitting changes. Please check console for details.');
    }
  };

  const handleReset = () => {
    // Restore original schedules to remove newly added bookings
    if (originalSchedules.size > 0) {
      const restoredSchedules = new Map<string, TeacherSchedule>();
      originalSchedules.forEach((originalSchedule, teacherId) => {
        // Create a fresh copy of the original schedule
        const freshSchedule = new TeacherSchedule(
          originalSchedule.getSchedule().teacherId,
          originalSchedule.getSchedule().teacherName,
          originalSchedule.getSchedule().selectedDate
        );
        freshSchedule.setQueueStartTime(originalSchedule.getSchedule().queueStartTime);
        
        // Only restore real lessons (not pseudo lessons from drag and drop)
        const originalQueue = originalSchedule.getLessonQueue();
        originalQueue.forEach((lesson) => {
          if (!lesson.lessonId.startsWith("lesson_")) {
            // This is a real lesson, restore it
            freshSchedule.addLessonToQueue(
              lesson.lessonId,
              lesson.duration,
              lesson.students,
              lesson.remainingMinutes,
              lesson.status || "planned"
            );
          }
        });
        
        restoredSchedules.set(teacherId, freshSchedule);
      });
      
      onTeacherSchedulesChange(restoredSchedules);
    }
    setGlobalTimeOffset(0);
    setHasChanges(false);
  };

  const handleCancel = () => {
    // Restore original schedules and exit edit mode
    if (originalSchedules.size > 0) {
      onTeacherSchedulesChange(new Map(originalSchedules));
    }
    setGlobalViewMode("view");
    setTimeAdjustmentMode(false);
    setGlobalTimeOffset(0);
    setHasChanges(false);
  };

  return (
    <div className="col-span-3">
      <div className="border border-border rounded-lg p-4 mb-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">
              {useMemo(() => {
                const date = new Date(selectedDate);
                return date.toLocaleDateString("en-US", { weekday: "long" });
              }, [selectedDate])}
            </h2>
            
            <TimeAdjustmentFlag
              timeAdjustmentMode={timeAdjustmentMode}
              globalTimeOffset={globalTimeOffset}
              earliestTime={earliestTime}
              onTimeAdjustment={handleTimeAdjustment}
              onFlagClick={handleFlagClick}
            />
          </div>
          
          <div className="flex items-center gap-2">
            {globalViewMode === "edit" ? (
              <>
                <button
                  onClick={handleSubmit}
                  className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 border border-green-300"
                  title="Submit all changes and create events"
                >
                  Submit
                </button>
                <button
                  onClick={handleReset}
                  className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 border border-yellow-300"
                  title="Reset all changes"
                >
                  Reset
                </button>
                <button
                  onClick={handleCancel}
                  className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded hover:bg-gray-200 border border-gray-300"
                  title="Cancel and discard all changes"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => handleGlobalModeChange("edit")}
                className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 border border-blue-300"
                title="Enter edit mode"
              >
                Edit
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        {teachers.map((teacher) => {
          const teacherSchedule = teacherSchedules.get(teacher.id);
          const queuedLessons = teacherSchedule?.getLessonQueue() || [];
          const events = teacherEvents.get(teacher.id) || [];

          return (
            <TeacherRow
              key={teacher.id}
              teacher={teacher}
              teacherSchedule={teacherSchedule}
              queuedLessons={queuedLessons}
              teacherEvents={events}
              selectedDate={selectedDate}
              controller={controller}
              viewMode={globalViewMode}
              hasChanges={hasChanges}
              onDrop={(e) => handleDrop(teacher.id, e)}
              onDragOver={handleDragOver}
              onRemoveFromQueue={(lessonId) => handleRemoveFromQueue(teacher.id, lessonId)}
              onAdjustDuration={(lessonId, increment) => handleAdjustDuration(teacher.id, lessonId, increment)}
              onAdjustTime={(lessonId, increment) => handleAdjustTime(teacher.id, lessonId, increment)}
              onMoveUp={(lessonId) => handleMoveUp(teacher.id, lessonId)}
              onMoveDown={(lessonId) => handleMoveDown(teacher.id, lessonId)}
              onRemoveGap={(lessonId) => handleRemoveGap(teacher.id, lessonId)}
            />
          );
        })}
      </div>
    </div>
  );
}