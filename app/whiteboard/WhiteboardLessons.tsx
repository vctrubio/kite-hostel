"use client";

import { useState, useMemo } from "react";
import { FlagIcon } from "@/svgs/FlagIcon";
import { useRouter } from "next/navigation";
import { TeacherSchedule } from "@/backend/TeacherSchedule";
import { HeadsetIcon } from "@/svgs";
import {
  LESSON_STATUS_FILTERS,
  type LessonStatusFilter,
} from "@/lib/constants";
import TeacherLessonStats from "@/components/TeacherLessonStats";
import LessonCard from "@/components/cards/LessonCard";
import TeacherLessonQueue from "@/components/TeacherLessonQueue";
import { createTeacherQueueEvents } from "@/actions/event-actions";
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

// Sub-component: Filter Buttons
function LessonStatusFilters({
  activeFilter,
  onFilterChange,
  statusCounts,
}: {
  activeFilter: LessonStatusFilter;
  onFilterChange: (filter: LessonStatusFilter) => void;
  statusCounts: Record<LessonStatusFilter, number>;
}) {
  return (
    <div className="flex gap-2 flex-wrap">
      {LESSON_STATUS_FILTERS.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onFilterChange(filter.value)}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            activeFilter === filter.value
              ? filter.color
                  .replace("hover:", "")
                  .replace("100", "200")
                  .replace("900/30", "900/50")
              : filter.color
          }`}
        >
          {filter.label} ({statusCounts[filter.value]})
        </button>
      ))}
    </div>
  );
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
  editMode,
  onToggleEditMode,
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
  editMode: boolean;
  onToggleEditMode: () => void;
}) {
  const { availableLessons, lessonsWithEvents } = calculateLessonStats(
    teacherGroup.lessons,
  );
  const canReorganize = teacherSchedule
    ? teacherSchedule.canReorganizeSchedule()
    : false;

  return (
    <div className="bg-card dark:bg-gray-800 border border-border dark:border-gray-700 rounded-lg">
      <div className="flex justify-between items-center p-4 border-b border-border dark:border-gray-700">
        <div className="flex items-center gap-2">
          <HeadsetIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
          <h4 className="text-lg font-medium text-foreground dark:text-white">
            {teacherGroup.teacherName}
          </h4>
          {canReorganize && (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded border">
              Can optimize
            </span>
          )}
          <button
            onClick={onToggleEditMode}
            className={`ml-2 p-1 rounded ${editMode ? "bg-blue-200 dark:bg-blue-800" : "hover:bg-gray-100 dark:hover:bg-gray-700"}`}
            title={editMode ? "Exit edit mode" : "Edit event queue"}
          >
            <FlagIcon className="w-5 h-5" />
          </button>
        </div>
        {teacherSchedule && (
          <TeacherLessonStats teacherSchedule={teacherSchedule} />
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
          editMode={editMode}
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
function EmptyState({ activeFilter }: { activeFilter: LessonStatusFilter }) {
  return (
    <div className="p-8 bg-muted dark:bg-gray-800 rounded-lg text-center">
      <p className="text-muted-foreground dark:text-gray-400">
        {activeFilter === "all"
          ? "No lessons found for this date"
          : `No ${activeFilter} lessons found for this date`}
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
  const [editModes, setEditModes] = useState<{ [teacherId: string]: boolean }>(
    {},
  );
  const [globalEditMode, setGlobalEditMode] = useState(false);
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<LessonStatusFilter>("all");
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

  const filteredLessons =
    activeFilter === "all"
      ? lessons
      : lessons.filter((lesson) => lesson.status === activeFilter);

  const statusCounts = {
    all: lessons.length,
    planned: lessons.filter((l) => l.status === "planned").length,
    rest: lessons.filter((l) => l.status === "rest").length,
    delegated: lessons.filter((l) => l.status === "delegated").length,
    completed: lessons.filter((l) => l.status === "completed").length,
    cancelled: lessons.filter((l) => l.status === "cancelled").length,
  };

  const groupedLessons = groupLessonsByTeacher(filteredLessons);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-medium dark:text-white">
            Lessons by Teacher ({filteredLessons.length} total)
          </h3>
          <button
            onClick={() => {
              setGlobalEditMode((prev) => {
                const newVal = !prev;
                setEditModes((old) => {
                  const updated: { [teacherId: string]: boolean } = {};
                  groupedLessons.forEach((g) => {
                    updated[g.teacherId] = newVal;
                  });
                  return updated;
                });
                return newVal;
              });
            }}
            className={`ml-2 p-1 rounded ${globalEditMode ? "bg-blue-200 dark:bg-blue-800" : "hover:bg-gray-100 dark:hover:bg-gray-700"}`}
            title={
              globalEditMode
                ? "Exit edit mode for all"
                : "Edit all teacher queues"
            }
          >
            <FlagIcon className="w-6 h-6" />
          </button>
        </div>
        <LessonStatusFilters
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          statusCounts={statusCounts}
        />
      </div>

      {groupedLessons.length === 0 ? (
        <EmptyState activeFilter={activeFilter} />
      ) : (
        <div className="space-y-4">
          {groupedLessons.map((teacherGroup) => {
            const editMode =
              globalEditMode || !!editModes[teacherGroup.teacherId];
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
                editMode={editMode}
                onToggleEditMode={() =>
                  setEditModes((prev) => ({
                    ...prev,
                    [teacherGroup.teacherId]: !editMode,
                  }))
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
