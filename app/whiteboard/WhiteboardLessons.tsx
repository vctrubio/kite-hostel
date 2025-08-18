"use client";

import { useState, useMemo } from "react";
import { FlagIcon } from "@/svgs/FlagIcon";
import { useRouter } from "next/navigation";
import { TeacherSchedule } from "@/backend/TeacherSchedule";
import { HeadsetIcon } from "@/svgs";
import TeacherLessonStats from "@/components/TeacherLessonStats";
import LessonCard from "@/components/cards/LessonCard";
import TeacherLessonQueue from "@/components/TeacherLessonQueue";
import { createTeacherQueueEvents } from "@/actions/event-actions";
import { reorganizeEventTimes } from "@/actions/kite-actions";
import {
  groupLessonsByTeacher,
  calculateLessonStats,
} from "@/backend/WhiteboardClass";

interface WhiteboardLessonsProps {
  lessons: any[];
  controller: any;
  selectedDate: string;
  teacherSchedules: Map<string, TeacherSchedule>;
}

// Sub-component: Teacher Group
function TeacherGroup({
  teacherGroup,
  onLessonClick,
  onRemoveFromQueue,
  onBatchEventCreation,
  teacherSchedule,
  selectedDate,
  controller,
  queueUpdateTrigger,
  onQueueChange,
}: {
  teacherGroup: any;
  onLessonClick: (lesson: any) => void;
  onRemoveFromQueue: (lessonId: string) => void;
  onBatchEventCreation: (events: any[]) => void;
  teacherSchedule?: TeacherSchedule;
  selectedDate: string;
  controller: any;
  queueUpdateTrigger: number;
  onQueueChange: () => void;
}) {
  const { availableLessons, lessonsWithEvents } = calculateLessonStats(
    teacherGroup.lessons,
  );
  const canReorganize = teacherSchedule
    ? teacherSchedule.canReorganizeSchedule()
    : false;

  // Get earliest time from teacher schedule using existing method
  const earliestTime = useMemo(() => {
    return teacherSchedule ? teacherSchedule.getEarliestTime() : null;
  }, [teacherSchedule, queueUpdateTrigger]);

  // Create mapping from lesson ID to event ID for database updates
  const createEventIdMap = (lessons: any[]): Map<string, string> => {
    const map = new Map<string, string>();
    lessons.forEach(lesson => {
      if (lesson?.events && Array.isArray(lesson.events)) {
        lesson.events.forEach((event: any) => {
          if (event?.id && lesson?.id) {
            map.set(lesson.id, event.id);
          }
        });
      }
    });
    return map;
  };

  // Handle full schedule reorganization using existing TeacherSchedule methods
  const handleFullScheduleReorganization = async () => {
    if (!teacherSchedule) return;

    try {
      // Create event ID mapping for database updates
      const eventIdMap = createEventIdMap(teacherGroup.lessons);
      
      // Use the existing performCompactReorganization method
      const success = teacherSchedule.performCompactReorganization();
      if (!success) {
        console.log('No reorganization needed or failed to reorganize schedule');
        return;
      }
      
      // Get database updates using the existing method
      const databaseUpdates = teacherSchedule.getDatabaseUpdatesForCompactReorganization(selectedDate, eventIdMap);
      
      // Update database if we have changes to make
      if (databaseUpdates.length > 0) {
        const dbResult = await reorganizeEventTimes(databaseUpdates);
        if (dbResult.success) {
          console.log(`Full schedule reorganized successfully. Updated ${dbResult.updatedCount} events in database.`);
          // Trigger queue update to refresh the UI
          onQueueChange();
        } else {
          console.error('Failed to update database:', dbResult.error);
          return;
        }
      } else {
        console.log('Schedule already optimized');
      }
    } catch (error) {
      console.error('Error reorganizing full schedule:', error);
    }
  };

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
          controller={controller}
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
  controller,
  selectedDate,
  teacherSchedules,
}: WhiteboardLessonsProps) {
  const router = useRouter();
  const [queueUpdateTrigger, setQueueUpdateTrigger] = useState(0);

  const toggleLessonQueue = (lesson: any) => {
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
  };

  const handleQueueChange = () => {
    setQueueUpdateTrigger((prev) => prev + 1);
  };

  const handleRemoveFromQueue = (lessonId: string) => {
    for (const teacherGroup of groupedLessons) {
      const lesson = teacherGroup.lessons.find((l: any) => l.id === lessonId);
      if (lesson) {
        toggleLessonQueue(lesson);
        break;
      }
    }
  };

  const handleBatchEventCreation = async (events: any[]) => {
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
  };

  const groupedLessons = groupLessonsByTeacher(lessons);

  // Calculate global stats from all teacher schedules
  const globalStats = useMemo(() => {
    let totalEvents = 0;
    let totalLessons = 0;
    let totalHours = 0;
    let totalEarnings = 0;
    let schoolRevenue = 0;

    teacherSchedules.forEach((schedule) => {
      const stats = schedule.calculateTeacherStats();
      totalEvents += stats.totalEvents;
      totalLessons += stats.totalLessons;
      totalHours += stats.totalHours;
      totalEarnings += stats.totalEarnings;
      schoolRevenue += stats.schoolRevenue;
    });

    return {
      totalEvents,
      totalLessons,
      totalHours,
      totalEarnings,
      schoolRevenue,
    };
  }, [teacherSchedules]);

  return (
    <div className="space-y-6">
      {/* Global Stats Header */}
      <div className="flex justify-center">
        <div className="border border-border rounded-lg p-4 bg-card">
          <div className="flex items-center gap-6 text-sm">
            <div className="text-center">
              <div className="font-semibold text-indigo-600 dark:text-indigo-400">
                {globalStats.totalEvents}/{globalStats.totalLessons}
              </div>
              <div className="text-xs text-muted-foreground">
                Events/Lessons
              </div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-purple-600 dark:text-purple-400">
                {Math.round(globalStats.totalHours * 10) / 10}h
              </div>
              <div className="text-xs text-muted-foreground">Hours</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-green-600 dark:text-green-400">
                €{Math.round(globalStats.totalEarnings)}
              </div>
              <div className="text-xs text-muted-foreground">Teacher</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-orange-600 dark:text-orange-400">
                €{Math.round(globalStats.schoolRevenue)}
              </div>
              <div className="text-xs text-muted-foreground">School</div>
            </div>
          </div>
        </div>
      </div>

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
                controller={controller}
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
