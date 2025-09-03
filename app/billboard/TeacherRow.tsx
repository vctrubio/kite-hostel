"use client";

import { TeacherSchedule } from "@/backend/TeacherSchedule";
import { type EventController } from "@/backend/types";
import { HeadsetIcon } from "@/svgs";
import { Edit, Eye } from "lucide-react";
import { extractStudents } from "@/backend/WhiteboardClass";
import { updateEvent } from "@/actions/event-actions";
import TeacherLessonQueueCard from "@/components/cards/LessonQueueCard";
import FlagCard from "@/components/cards/FlagCard";

interface TeacherRowProps {
  teacher: any;
  teacherSchedule: TeacherSchedule | undefined;
  queuedLessons: any[];
  teacherEvents: any[];
  selectedDate: string;
  controller: EventController;
  viewMode: "view" | "edit";
  hasChanges: boolean;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onRemoveFromQueue: (lessonId: string) => void;
  onAdjustDuration: (lessonId: string, increment: boolean) => void;
  onAdjustTime: (lessonId: string, increment: boolean) => void;
  onMoveUp: (lessonId: string) => void;
  onMoveDown: (lessonId: string) => void;
  onRemoveGap: (lessonId: string) => void;
}

export default function TeacherRow({
  teacher,
  teacherSchedule,
  queuedLessons,
  teacherEvents,
  selectedDate,
  controller,
  viewMode,
  hasChanges,
  onDrop,
  onDragOver,
  onRemoveFromQueue,
  onAdjustDuration,
  onAdjustTime,
  onMoveUp,
  onMoveDown,
  onRemoveGap,
}: TeacherRowProps) {

  // Debug logging
  console.log(`Teacher: ${teacher.name}`, {
    teacherSchedule,
    queuedLessons,
    teacherEvents,
    hasSchedule: !!teacherSchedule,
    queueLength: queuedLessons.length,
    eventsLength: teacherEvents.length,
    viewMode
  });

  const handleStatusChange = async (eventId: string, newStatus: "planned" | "completed" | "tbc" | "cancelled") => {
    try {
      await updateEvent(eventId, { status: newStatus });
      // Status changes are handled immediately, no need to track
    } catch (error) {
      console.error('Failed to update event status:', error);
    }
  };

  const renderContent = () => {
    if (viewMode === "view" && teacherEvents.length > 0) {
      return (
        <div className="flex flex-wrap gap-2">
          {teacherEvents.map((event) => {
            const students = extractStudents(event.booking).map(s => s.name);
            const startTime = new Date(event.date).toISOString();
            return (
              <FlagCard
                key={event.id}
                startTime={startTime}
                duration={event.duration || controller.durationCapOne}
                students={students}
                status={event.status || "planned"}
                onStatusChange={(newStatus) => handleStatusChange(event.id, newStatus)}
              />
            );
          })}
        </div>
      );
    } else if (viewMode === "edit" && queuedLessons.length > 0) {
      return (
        <div className="flex flex-wrap gap-2">
          {queuedLessons.map((queuedLesson, queueIndex) => (
            <TeacherLessonQueueCard
              key={queuedLesson.lessonId}
              queuedLesson={{
                ...queuedLesson,
                scheduledDateTime: `${selectedDate}T${queuedLesson.scheduledStartTime || controller.submitTime}:00.000Z`,
              }}
              location={controller.location}
              isFirst={queueIndex === 0}
              isLast={queueIndex === queuedLessons.length - 1}
              canMoveEarlier={
                teacherSchedule?.canMoveQueueLessonEarlier(
                  queuedLesson.lessonId,
                ) || false
              }
              canMoveLater={true}
              onRemove={() => onRemoveFromQueue(queuedLesson.lessonId)}
              onAdjustDuration={(_, increment) => onAdjustDuration(queuedLesson.lessonId, increment)}
              onAdjustTime={(_, increment) => onAdjustTime(queuedLesson.lessonId, increment)}
              onMoveUp={() => onMoveUp(queuedLesson.lessonId)}
              onMoveDown={() => onMoveDown(queuedLesson.lessonId)}
              onRemoveGap={() => onRemoveGap(queuedLesson.lessonId)}
            />
          ))}
        </div>
      );
    } else {
      return (
        <div className="flex items-center justify-center h-full text-xs text-muted-foreground opacity-50">
          {viewMode === "view" ? "No events for this date" : "Drop student booking here"}
        </div>
      );
    }
  };

  return (
    <div
      className="w-full border border-border rounded-lg bg-card transition-all"
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragEnter={(e) => e.preventDefault()}
    >
      <div className="grid grid-cols-4 gap-4 h-full">
        {/* Teacher Name Column */}
        <div className="col-span-1 p-4 border-r border-border bg-muted/30">
          <div className="flex items-center gap-2">
            <HeadsetIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h3 className="font-medium text-foreground">
              {teacher.name}
            </h3>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm text-muted-foreground">
              ({viewMode === "view" ? teacherEvents.length : queuedLessons.length} {viewMode === "view" ? "events" : "queued"})
            </span>
          </div>
        </div>
        
        {/* Content Area */}
        <div className="col-span-3 p-4 min-h-[100px]">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}