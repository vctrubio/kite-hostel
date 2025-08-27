"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { FlagIcon } from "@/svgs/FlagIcon";
import ControllerSettings from "@/components/whiteboard-usage/ControllerSettings";
import { useRouter } from "next/navigation";
import { TeacherSchedule } from "@/backend/TeacherSchedule";
import { HeadsetIcon } from "@/svgs";
import TeacherLessonStats from "@/components/whiteboard-usage/TeacherLessonStats";
import LessonCard from "@/components/cards/LessonCard";
import TeacherLessonQueue from "@/components/whiteboard-usage/TeacherLessonQueue";
import { createTeacherQueueEvents } from "@/actions/event-actions";
import { reorganizeEventTimes } from "@/actions/kite-actions";
import { groupLessonsByTeacher } from "@/backend/WhiteboardClass";
import type { EventController, QueueControllerSettings } from "@/backend/types";

interface WhiteboardLessonsProps {
  lessons: any[];
  selectedDate: string;
  teacherSchedules: Map<string, TeacherSchedule>;
  controller: EventController;
  onControllerChange: (controller: EventController) => void;
}

// Sub-component: Teacher Group
function TeacherGroup({
  teacherGroup,
  onLessonClick,
  onRemoveFromQueue,
  onBatchEventCreation,
  teacherSchedule,
  selectedDate,
  queueSettings,
  queueUpdateTrigger,
  onQueueChange,
}: {
  teacherGroup: any;
  onLessonClick: (lesson: any) => void;
  onRemoveFromQueue: (lessonId: string) => void;
  onBatchEventCreation: (events: any[]) => void;
  teacherSchedule?: TeacherSchedule;
  selectedDate: string;
  queueSettings: QueueControllerSettings;
  queueUpdateTrigger: number;
  onQueueChange: () => void;
}) {
  const canReorganize = teacherSchedule
    ? teacherSchedule.canReorganizeSchedule()
    : false;

  // Get earliest time from teacher schedule using existing method
  const earliestTime = useMemo(() => {
    if (!teacherSchedule) return null;
    const firstEventNode = teacherSchedule
      .getNodes()
      .find((node) => node.type === "event");
    return firstEventNode ? firstEventNode.startTime : null;
  }, [teacherSchedule]);

  // Create mapping from lesson ID to event ID for database updates
  const createEventIdMap = useCallback(
    (lessons: any[]): Map<string, string> => {
      const map = new Map<string, string>();
      lessons.forEach((lesson) => {
        if (lesson?.events && Array.isArray(lesson.events)) {
          lesson.events.forEach((event: any) => {
            if (event?.id && lesson?.id) {
              map.set(lesson.id, event.id);
            }
          });
        }
      });
      return map;
    },
    [],
  );

  // Handle full schedule reorganization using existing TeacherSchedule methods
  const handleFullScheduleReorganization = useCallback(async () => {
    if (!teacherSchedule) return;

    try {
      // Create event ID mapping for database updates
      const eventIdMap = createEventIdMap(teacherGroup.lessons);

      // Use the existing performCompactReorganization method
      const success = teacherSchedule.performCompactReorganization();
      if (!success) {
        console.log(
          "No reorganization needed or failed to reorganize schedule",
        );
        return;
      }

      // Get database updates using the existing method
      const databaseUpdates =
        teacherSchedule.getDatabaseUpdatesForCompactReorganization(
          selectedDate,
          eventIdMap,
        );

      // Update database if we have changes to make
      if (databaseUpdates.length > 0) {
        const dbResult = await reorganizeEventTimes(databaseUpdates);
        if (dbResult.success) {
          console.log(
            `Full schedule reorganized successfully. Updated ${dbResult.updatedCount} events in database.`,
          );
          // Trigger queue update to refresh the UI
          onQueueChange();
        } else {
          console.error("Failed to update database:", dbResult.error);
          return;
        }
      } else {
        console.log("Schedule already optimized");
      }
    } catch (error) {
      console.error("Error reorganizing full schedule:", error);
    }
  }, [
    teacherSchedule,
    teacherGroup.lessons,
    selectedDate,
    onQueueChange,
    createEventIdMap,
  ]);

  return (
    <div className="bg-card dark:bg-gray-800 border border-border dark:border-gray-700 rounded-lg">
      <div className="flex justify-between items-center p-4 border-b border-border dark:border-gray-700">
        <div className="flex items-center gap-2">
          <HeadsetIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
          <h4 className="text-lg font-medium text-foreground dark:text-white">
            {teacherGroup.teacherName}
          </h4>
          {canReorganize && (
            <button
              onClick={handleFullScheduleReorganization}
              className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded border hover:bg-yellow-200 transition-colors"
              title="Optimize schedule by removing gaps"
            >
              Can optimize
            </button>
          )}
          {earliestTime && (
            <div className="flex items-center gap-1 ml-3">
              <FlagIcon className="w-4 h-4" />
              <span className="text-sm font-medium">{earliestTime}</span>
            </div>
          )}
        </div>
        {teacherSchedule && (
          <TeacherLessonStats
            teacherStats={teacherSchedule.calculateTeacherStats()}
          />
        )}
      </div>

      <div className="p-4 space-y-3">
        {teacherGroup.lessons.map((lesson: any) => (
          <LessonCard
            key={`${lesson.id}-${queueUpdateTrigger}`}
            lesson={lesson}
            onLessonClick={onLessonClick}
            onRemoveFromQueue={onRemoveFromQueue}
            selectedDate={selectedDate}
            teacherSchedule={teacherSchedule}
          />
        ))}

        <TeacherLessonQueue
          teacherId={teacherGroup.teacherId}
          teacherName={teacherGroup.teacherName}
          teacherSchedule={teacherSchedule}
          selectedDate={selectedDate}
          durationSettings={queueSettings.durationSettings}
          controllerTime={queueSettings.submitTime}
          location={queueSettings.location}
          onCreateEvents={onBatchEventCreation}
          queueUpdateTrigger={queueUpdateTrigger}
          onQueueChange={onQueueChange}
          onRef={(ref) => {
            if (ref) {
              (window as any)[`queue_${teacherGroup.teacherId}`] = ref;
            }
          }}
        />
      </div>
    </div>
  );
}

// Sub-component: Empty State
function EmptyState() {
  return (
    <div className="p-8 bg-muted dark:bg-gray-800 rounded-lg text-center">
      <p className="text-muted-foreground dark:text-gray-400">
        No lessons found for this date
      </p>
    </div>
  );
}

export default function WhiteboardLessons({
  lessons,
  selectedDate,
  teacherSchedules,
  controller,
  onControllerChange,
}: WhiteboardLessonsProps) {
  const router = useRouter();
  const [queueUpdateTrigger, setQueueUpdateTrigger] = useState(0);

  const toggleLessonQueue = useCallback(
    (lesson: any) => {
      const teacherSchedule = teacherSchedules.get(lesson.teacher?.id);
      if (!teacherSchedule) return;

      const isInQueue = teacherSchedule
        .getLessonQueue()
        .some((q) => q.lessonId === lesson.id);

      if (isInQueue) {
        teacherSchedule.removeLessonFromQueue(lesson.id);
      } else {
        const queueRef = (window as any)[`queue_${lesson.teacher?.id}`];
        if (queueRef && queueRef.addToQueue) {
          queueRef.addToQueue(lesson);
        }
      }
      setQueueUpdateTrigger((prev) => prev + 1);
    },
    [teacherSchedules],
  );

  const handleQueueChange = useCallback(() => {
    setQueueUpdateTrigger((prev) => prev + 1);
  }, []);

  const groupedLessons = groupLessonsByTeacher(lessons);

  const handleRemoveFromQueue = useCallback(
    (lessonId: string) => {
      for (const teacherGroup of groupedLessons) {
        const lesson = teacherGroup.lessons.find((l: any) => l.id === lessonId);
        if (lesson) {
          toggleLessonQueue(lesson);
          break;
        }
      }
    },
    [groupedLessons, toggleLessonQueue],
  );

  const handleBatchEventCreation = useCallback(
    async (events: any[]) => {
      console.log("🚀 Creating teacher queue events:", events.length);
      try {
        const result = await createTeacherQueueEvents(events);
        if (result.success) {
          console.log("✅ All queue events created successfully");
        } else {
          console.error("❌ Some events failed to create:", result);
          if (result.summary) {
            console.log(
              `📊 Summary: ${result.summary.successCount}/${result.summary.total} events created`,
            );
          }
        }
        router.refresh();
      } catch (error) {
        console.error("🔥 Error creating queue events:", error);
      }
    },
    [router],
  );

  return (
    <div className="space-y-6">
      {/* Controller Settings */}
      <ControllerSettings
        controller={controller}
        onControllerChange={onControllerChange}
        teacherSchedules={teacherSchedules}
      />

      {groupedLessons.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-4">
          {groupedLessons.map((teacherGroup) => {
            return (
              <TeacherGroup
                key={teacherGroup.teacherId}
                teacherGroup={teacherGroup}
                onLessonClick={toggleLessonQueue}
                onRemoveFromQueue={handleRemoveFromQueue}
                onBatchEventCreation={handleBatchEventCreation}
                selectedDate={selectedDate}
                queueSettings={{
                  location: controller.location,
                  submitTime: controller.submitTime,
                  durationSettings: {
                    durationCapOne: controller.durationCapOne,
                    durationCapTwo: controller.durationCapTwo,
                    durationCapThree: controller.durationCapThree,
                  }
                }}
                teacherSchedule={teacherSchedules.get(teacherGroup.teacherId)}
                queueUpdateTrigger={queueUpdateTrigger}
                onQueueChange={handleQueueChange}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
