"use client";

import {
  useMemo,
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
import EventCard, { GapCard } from "@/components/cards/EventCard";
import TeacherEventQueue from "@/components/whiteboard-usage/TeacherEventQueue";
import {
  HeadsetIcon,
  Zap,
  ChevronLeft,
  ChevronRight,
  Wind,
  ChevronDown,
  Flag,
  FlagOff,
} from "lucide-react";
import { TeacherSchedule, ScheduleNode } from "@/backend/TeacherSchedule";
import {
  TeacherEventsUtils,
  type TeacherEventGroupData,
} from "@/backend/TeacherEventsUtils";
import { deleteEvent } from "@/actions/event-actions";
import { timeToMinutes, minutesToTime } from "@/components/formatters/TimeZone";
import { extractStudentNames } from "@/backend/WhiteboardClass";

interface WhiteboardEventsProps {
  events: any[];
  selectedDate: string;
  teacherSchedules: Map<string, TeacherSchedule>;
}

// Sub-component: Time Adjustment Flag
interface TimeAdjustmentFlagProps {
  proposedTimeOffset: number;
  timeAdjustmentMode: boolean;
  editableScheduleNodes: ScheduleNode[];
  parentTimeAdjustmentMode?: boolean;
  onTimeAdjustment: (minutesOffset: number) => void;
  onSetTimeAdjustmentMode: (mode: boolean) => void;
  onSetViewMode: (mode: "event" | "queue") => void;
}

function TimeAdjustmentFlag({
  proposedTimeOffset,
  timeAdjustmentMode,
  editableScheduleNodes,
  parentTimeAdjustmentMode = false,
  onTimeAdjustment,
  onSetTimeAdjustmentMode,
  onSetViewMode,
}: TimeAdjustmentFlagProps) {
  const firstEventNode = editableScheduleNodes.find(
    (node) => node.type === "event",
  );
  const displayTime = firstEventNode ? firstEventNode.startTime : "No events";

  if (timeAdjustmentMode) {
    return (
      <div className="flex items-center gap-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onTimeAdjustment(-30)}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Move back 30 minutes"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="min-w-[60px] text-center font-mono">
            {displayTime}
            {proposedTimeOffset !== 0 && !parentTimeAdjustmentMode && (
              <span className="text-orange-600 dark:text-orange-400 ml-1">
                ({proposedTimeOffset > 0 ? "+" : ""}
                {proposedTimeOffset}m)
              </span>
            )}
          </span>
          <button
            onClick={() => onTimeAdjustment(30)}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Move forward 30 minutes"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => {
        onSetTimeAdjustmentMode(true);
        onSetViewMode("queue");
      }}
      className="flex items-center gap-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-2 py-1 cursor-pointer transition-colors"
      title="Click to adjust start time and switch to queue view"
    >
      <Flag className="w-4 h-4" />
      <span>{displayTime}</span>
    </div>
  );
}

interface TeacherEventsGroupProps {
  teacherSchedule: TeacherSchedule;
  events: any[];
  selectedDate: string;
  parentTimeAdjustmentMode?: boolean;
  parentGlobalTime?: string | null;
  isPendingParentUpdate: boolean;
  onCompleteOrOptOut?: (teacherId: string) => void;
  onOptInToParentUpdate?: (teacherId: string) => void;
}

export interface TeacherEventsGroupHandle {
  submit: () => Promise<void>;
}

const TeacherEventsGroup = forwardRef<
  TeacherEventsGroupHandle,
  TeacherEventsGroupProps
>((props, ref) => {
  const {
    teacherSchedule,
    events,
    selectedDate,
    parentTimeAdjustmentMode = false,
    parentGlobalTime = null,
    isPendingParentUpdate,
    onCompleteOrOptOut,
    onOptInToParentUpdate,
  } = props;

  const [timeAdjustmentMode, setTimeAdjustmentMode] = useState(false);
  const [globalTimeOffset, setGlobalTimeOffset] = useState(0);
  const [viewMode, setViewMode] = useState<"event" | "queue">("event");

  const scheduleNodes = useMemo(
    () => teacherSchedule.getNodes(),
    [teacherSchedule],
  );
  const [editableScheduleNodes, setEditableScheduleNodes] =
    useState(scheduleNodes);
  const schedule = teacherSchedule.getSchedule();
  const canReorganize = teacherSchedule.canReorganizeSchedule();
  const router = useRouter();
  const teacherId = schedule.teacherId;

  const wasPendingParentUpdate = useRef(isPendingParentUpdate);

  useEffect(() => {
    if (isPendingParentUpdate && !wasPendingParentUpdate.current) {
      setViewMode("queue");
      setTimeAdjustmentMode(true);
    }
    if (!isPendingParentUpdate && wasPendingParentUpdate.current) {
      setViewMode("event");
      setTimeAdjustmentMode(false);
      setGlobalTimeOffset(0);
      setEditableScheduleNodes(scheduleNodes);
    }
    wasPendingParentUpdate.current = isPendingParentUpdate;
  }, [isPendingParentUpdate, scheduleNodes]);

  useImperativeHandle(ref, () => ({
    submit: async () => {
      const result = await TeacherEventsUtils.acceptTimeAdjustment(
        teacherSchedule,
        globalTimeOffset,
        events,
        selectedDate,
      );
      if (!result.success) {
        throw new Error(`Failed to submit for teacher ${teacherId}`);
      }
    },
  }));

  useEffect(() => {
    if (parentTimeAdjustmentMode && parentGlobalTime) {
      const updatedNodes = TeacherEventsUtils.applyParentTimeToSchedule(
        scheduleNodes,
        parentGlobalTime,
      );
      const timeOffset = TeacherEventsUtils.calculateTimeOffset(
        teacherSchedule,
        parentGlobalTime,
      );
      setEditableScheduleNodes(updatedNodes);
      setGlobalTimeOffset(timeOffset);
    } else if (!parentTimeAdjustmentMode) {
      setEditableScheduleNodes(scheduleNodes);
      setGlobalTimeOffset(0);
      setTimeAdjustmentMode(false);
    }
  }, [
    parentTimeAdjustmentMode,
    parentGlobalTime,
    scheduleNodes,
    teacherSchedule,
  ]);

  useEffect(() => {
    setEditableScheduleNodes(scheduleNodes);
  }, [scheduleNodes]);

  const exitAndOptOut = useCallback(() => {
    onCompleteOrOptOut?.(teacherId);
  }, [onCompleteOrOptOut, teacherId]);

  const handleAdjustDuration = useCallback(
    (lessonId: string, increment: boolean) => {
      setEditableScheduleNodes((currentNodes) =>
        TeacherEventsUtils.adjustLessonDuration(
          currentNodes,
          lessonId,
          increment,
        ),
      );
    },
    [],
  );

  const handleAdjustTime = useCallback(
    (lessonId: string, increment: boolean) => {
      setEditableScheduleNodes((currentNodes) => {
        const { nodes, globalOffsetDelta } =
          TeacherEventsUtils.adjustLessonTime(
            currentNodes,
            lessonId,
            increment,
          );
        setGlobalTimeOffset((prev) => prev + globalOffsetDelta);
        return nodes;
      });
    },
    [],
  );

  const handleRemoveFromQueue = useCallback(
    (lessonId: string) => {
      setEditableScheduleNodes((currentNodes) => {
        const { nodes, newGlobalOffset } =
          TeacherEventsUtils.removeLessonFromQueue(
            currentNodes,
            scheduleNodes,
            lessonId,
          );
        setGlobalTimeOffset(newGlobalOffset);
        return nodes;
      });
    },
    [scheduleNodes],
  );

  const handleMoveInQueue = useCallback(
    (lessonId: string, direction: "up" | "down") => {
      setEditableScheduleNodes((currentNodes) =>
        TeacherEventsUtils.moveLessonInQueue(currentNodes, lessonId, direction),
      );
    },
    [],
  );

  const handleSubmitQueueChanges = useCallback(async () => {
    await TeacherEventsUtils.submitQueueChanges(
      scheduleNodes,
      editableScheduleNodes,
      events,
      selectedDate,
    );
    if (parentTimeAdjustmentMode) {
      onCompleteOrOptOut?.(teacherId);
    }
  }, [
    scheduleNodes,
    editableScheduleNodes,
    events,
    selectedDate,
    parentTimeAdjustmentMode,
    onCompleteOrOptOut,
    teacherId,
  ]);

  const handleResetQueue = useCallback(() => {
    setEditableScheduleNodes(scheduleNodes);
  }, [scheduleNodes]);

  const handleCancelQueue = useCallback(() => {
    if (parentTimeAdjustmentMode) {
      exitAndOptOut();
    } else {
      setViewMode("event");
      setEditableScheduleNodes(scheduleNodes);
    }
  }, [parentTimeAdjustmentMode, exitAndOptOut, scheduleNodes]);

  const handleSubmitAndExit = useCallback(async () => {
    await handleSubmitQueueChanges();
    setViewMode("event");
  }, [handleSubmitQueueChanges]);

  const handleFullScheduleReorganization = useCallback(async () => {
    const success = await TeacherEventsUtils.performFullScheduleReorganization(
      teacherSchedule,
      events,
      selectedDate,
    );
    if (success) {
      router.refresh();
    }
  }, [teacherSchedule, events, selectedDate, router]);

  const handleTimeAdjustment = useCallback(
    (minutesOffset: number) => {
      const newOffset = globalTimeOffset + minutesOffset;
      setGlobalTimeOffset(newOffset);

      if (newOffset === 0) {
        setEditableScheduleNodes(scheduleNodes);
        return;
      }

      const updatedNodes = TeacherEventsUtils.applyGlobalTimeOffset(
        scheduleNodes,
        newOffset,
      );
      setEditableScheduleNodes(updatedNodes);
    },
    [globalTimeOffset, scheduleNodes],
  );

  const handleAcceptTimeAdjustment = useCallback(async () => {
    const result = await TeacherEventsUtils.acceptTimeAdjustment(
      teacherSchedule,
      globalTimeOffset,
      events,
      selectedDate,
    );

    if (result.success) {
      if (parentTimeAdjustmentMode) {
        onCompleteOrOptOut?.(teacherId);
      } else {
        if (result.updatedNodes) {
          setEditableScheduleNodes(result.updatedNodes);
        }
        setTimeAdjustmentMode(false);
        setGlobalTimeOffset(0);
        setViewMode("event");
      }
    } else {
      setEditableScheduleNodes(scheduleNodes);
    }
  }, [
    teacherSchedule,
    globalTimeOffset,
    events,
    selectedDate,
    parentTimeAdjustmentMode,
    scheduleNodes,
    onCompleteOrOptOut,
    teacherId,
  ]);

  const handleStatusChange = useCallback(
    async (
      eventId: string,
      newStatus: "planned" | "completed" | "tbc" | "cancelled",
    ) => {
      await TeacherEventsUtils.changeEventStatus(eventId, newStatus);
    },
    [],
  );

  const handleCancelTimeAdjustment = useCallback(() => {
    if (parentTimeAdjustmentMode) {
      exitAndOptOut();
    } else {
      setTimeAdjustmentMode(false);
      setGlobalTimeOffset(0);
      setEditableScheduleNodes(scheduleNodes);
      setViewMode("event");
    }
  }, [parentTimeAdjustmentMode, exitAndOptOut, scheduleNodes]);

  const renderEventCards = () => {
    return scheduleNodes.map((node, currentIndex) => {
      if (node.type === "gap") {
        return (
          <div key={`gap-${node.id}`}>
            <GapCard
              duration={node.duration}
              startTime={node.startTime}
              selectedDate={selectedDate}
            />
          </div>
        );
      }

      const eventData = events.find(
        (e) => e.lesson?.id === node.eventData?.lessonId,
      );
      if (!eventData) return null;

      const studentNames = eventData.booking
        ? extractStudentNames(eventData.booking)
        : "No students";

      let nextEventProp = undefined;
      const nextEventNode = scheduleNodes
        .slice(currentIndex + 1)
        .find((n) => n.type === "event");
      if (nextEventNode) {
        const nextEventData = events.find(
          (e) => e.lesson?.id === nextEventNode.eventData?.lessonId,
        );
        if (
          nextEventData &&
          nextEventData.id &&
          typeof nextEventData.duration === "number"
        ) {
          nextEventProp = {
            id: nextEventData.id,
            startTime: nextEventNode.startTime,
            duration: nextEventData.duration,
            lessonId: nextEventData.lesson?.id,
          };
        }
      }

      return (
        <div key={`event-${node.id}-${eventData.id}`}>
          <EventCard
            students={studentNames}
            location={eventData?.location || "No location"}
            duration={eventData?.duration || node.duration}
            date={new Date(`${selectedDate}T${node.startTime}`).toISOString()}
            status={eventData?.status || "No status"}
            eventId={eventData.id}
            lessonId={eventData.lesson?.id}
            selectedDate={selectedDate}
            teacherSchedule={teacherSchedule}
            nextEvent={nextEventProp}
            reorganizationOptions={undefined}
            onDelete={() =>
              console.log(
                "🗑️ EventCard onDelete called for event:",
                eventData.id,
              )
            }
            onReorganize={() => {}}
            onDismissReorganization={() => {}}
            onCancelReorganization={() => {}}
            onStatusChange={(newStatus) =>
              handleStatusChange(eventData.id, newStatus)
            }
          />
        </div>
      );
    });
  };

  return (
    <div className="bg-card dark:bg-gray-800 border border-border dark:border-gray-700 rounded-lg">
      <div className="flex justify-between items-center p-4 border-b border-border dark:border-gray-700">
        <div className="flex items-center gap-2">
          <HeadsetIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
          <h4 className="text-lg font-medium text-foreground dark:text-white">
            {schedule.teacherName}
          </h4>
          <TimeAdjustmentFlag
            proposedTimeOffset={globalTimeOffset}
            timeAdjustmentMode={timeAdjustmentMode}
            editableScheduleNodes={editableScheduleNodes}
            parentTimeAdjustmentMode={parentTimeAdjustmentMode}
            onTimeAdjustment={handleTimeAdjustment}
            onSetTimeAdjustmentMode={setTimeAdjustmentMode}
            onSetViewMode={setViewMode}
          />
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground dark:text-gray-400">
          {viewMode === "event" ? (
            <>
              {canReorganize && (
                <button
                  onClick={handleFullScheduleReorganization}
                  className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 border border-yellow-300"
                  title="Optimize schedule by removing gaps"
                >
                  <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    <span>Reorganize</span>
                  </div>
                </button>
              )}
              <button
                onClick={() => {
                  if (parentTimeAdjustmentMode && !isPendingParentUpdate) {
                    onOptInToParentUpdate?.(teacherId);
                  } else {
                    setViewMode("queue");
                  }
                }}
                className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 border border-blue-300"
                title="Edit schedule in queue view"
              >
                Edit Schedule
              </button>
            </>
          ) : (
            <>
              <button
                onClick={
                  timeAdjustmentMode
                    ? handleAcceptTimeAdjustment
                    : handleSubmitAndExit
                }
                className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 border border-green-300"
                title={
                  timeAdjustmentMode
                    ? "Accept time changes"
                    : "Submit queue changes"
                }
              >
                Submit
              </button>
              <button
                onClick={
                  timeAdjustmentMode
                    ? handleCancelTimeAdjustment
                    : handleResetQueue
                }
                className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 border border-yellow-300"
                title={
                  timeAdjustmentMode
                    ? "Cancel time changes"
                    : "Reset all changes made to the queue"
                }
              >
                Reset
              </button>
              <button
                onClick={
                  timeAdjustmentMode
                    ? handleCancelTimeAdjustment
                    : handleCancelQueue
                }
                className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded hover:bg-gray-200 border border-gray-300"
                title={
                  timeAdjustmentMode
                    ? "Cancel time changes"
                    : "Cancel editing and discard all changes"
                }
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      <div className="p-4">
        <div className="flex flex-wrap gap-4">
          {viewMode === "event" && renderEventCards()}
          {viewMode === "queue" && (
            <TeacherEventQueue
              scheduleNodes={editableScheduleNodes}
              originalScheduleNodes={scheduleNodes}
              events={events}
              teacherSchedule={teacherSchedule}
              selectedDate={selectedDate}
              onRemove={handleRemoveFromQueue}
              onAdjustDuration={handleAdjustDuration}
              onAdjustTime={handleAdjustTime}
              onMove={handleMoveInQueue}
            />
          )}
        </div>
      </div>
    </div>
  );
});
TeacherEventsGroup.displayName = "TeacherEventsGroup";

function NoWindButton({
  events,
  onAllEventsDeleted,
}: {
  events: any[];
  onAllEventsDeleted: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleNoWind = async () => {
    if (events.length === 0) return;

    try {
      for (const event of events) {
        await deleteEvent(event.id);
      }
      onAllEventsDeleted();
    } catch (error) {
      console.error("❌ Error deleting events:", error);
    }
  };

  if (events.length === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200 border border-red-300 flex items-center gap-1"
        title="Cancel all events due to unsafe wind conditions"
      >
        <Wind className="w-3 h-3" />
        <span>NO WIND</span>
        <ChevronDown className="w-3 h-3" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-red-300 rounded shadow-lg p-3 z-10 w-64">
          <div className="text-sm text-red-800 font-medium mb-2">
            Delete all {events.length} events?
          </div>
          <div className="text-xs text-red-600 mb-3">
            This will cancel all events for today. This action cannot be undone.
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleNoWind}
              className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded"
            >
              Delete All
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ParentControlFlag({
  events,
  selectedDate,
  earliestTime,
  parentTimeAdjustmentMode,
  parentGlobalTime,
  onParentTimeAdjustment,
  onParentAcceptTimeAdjustment,
  onParentCancelTimeAdjustment,
  onParentFlagClick,
  onAllEventsDeleted,
}: {
  events: any[];
  selectedDate: string;
  earliestTime: string | null;
  parentTimeAdjustmentMode: boolean;
  parentGlobalTime: string | null;
  onParentTimeAdjustment: (minutesOffset: number) => void;
  onParentAcceptTimeAdjustment: () => void;
  onParentCancelTimeAdjustment: () => void;
  onParentFlagClick: () => void;
  onAllEventsDeleted: () => void;
}) {
  const dayOfWeek = useMemo(
    () =>
      new Date(selectedDate).toLocaleDateString("en-US", { weekday: "long" }),
    [selectedDate],
  );

  return (
    <div className="bg-card dark:bg-gray-800 border border-border dark:border-gray-700 rounded-lg p-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-medium text-foreground dark:text-white">
            {dayOfWeek}
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={onParentFlagClick}
              title="Toggle Global Time Adjustment"
            >
              {parentTimeAdjustmentMode ? (
                <FlagOff className="w-5 h-5 text-blue-500" />
              ) : (
                <Flag className="w-5 h-5 text-muted-foreground" />
              )}
            </button>

            {parentTimeAdjustmentMode ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onParentTimeAdjustment(-30)}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="Move all schedules back 30 minutes"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="min-w-[60px] text-center font-mono">
                  {parentGlobalTime || "No Lessons Set"}
                </span>
                <button
                  onClick={() => onParentTimeAdjustment(30)}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="Move all schedules forward 30 minutes"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={onParentAcceptTimeAdjustment}
                  className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 border border-green-300"
                  title="Apply global time adjustment to all teachers"
                >
                  Submit All
                </button>
                <button
                  onClick={onParentCancelTimeAdjustment}
                  className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded hover:bg-gray-200 border border-gray-300"
                  title="Cancel global time adjustment"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-muted-foreground">
                <span>{earliestTime || "No Lessons Set"}</span>
              </div>
            )}
          </div>
        </div>
        <NoWindButton events={events} onAllEventsDeleted={onAllEventsDeleted} />
      </div>
    </div>
  );
}

export default function WhiteboardEvents({
  events,
  selectedDate,
  teacherSchedules,
}: WhiteboardEventsProps) {
  const [parentTimeAdjustmentMode, setParentTimeAdjustmentMode] =
    useState(false);
  const [parentGlobalTime, setParentGlobalTime] = useState<string | null>(null);
  const [pendingParentUpdateTeachers, setPendingParentUpdateTeachers] =
    useState<Set<string>>(new Set());
  const router = useRouter();
  const teacherGroupRefs = useRef<Map<string, TeacherEventsGroupHandle | null>>(
    new Map(),
  );

  const teacherEventGroups: TeacherEventGroupData[] = useMemo(() => {
    const groups = new Map<string, any[]>();
    events
      .filter((eventData) => eventData?.id != null)
      .forEach((eventData) => {
        const teacherId = eventData.lesson?.teacher?.id || "unassigned";
        if (!groups.has(teacherId)) {
          groups.set(teacherId, []);
        }
        groups.get(teacherId)!.push(eventData);
      });

    return Array.from(groups.entries())
      .map(([teacherId, eventDataList]) => ({
        teacherId,
        teacherSchedule: teacherSchedules.get(teacherId),
        events: eventDataList,
      }))
      .filter((group) => group.teacherSchedule) as TeacherEventGroupData[];
  }, [events, teacherSchedules]);

  const earliestTime = useMemo(
    () => TeacherEventsUtils.findEarliestTime(teacherEventGroups),
    [teacherEventGroups],
  );

  const handleParentCancelTimeAdjustment = useCallback(() => {
    setParentTimeAdjustmentMode(false);
    setParentGlobalTime(null);
    setPendingParentUpdateTeachers(new Set());
  }, []);

  useEffect(() => {
    if (parentTimeAdjustmentMode && pendingParentUpdateTeachers.size === 0) {
      handleParentCancelTimeAdjustment();
    }
  }, [
    parentTimeAdjustmentMode,
    pendingParentUpdateTeachers,
    handleParentCancelTimeAdjustment,
  ]);

  const handleParentTimeAdjustment = useCallback(
    (minutesOffset: number) => {
      const baseTime = parentGlobalTime || earliestTime;
      if (baseTime) {
        const newTime = minutesToTime(timeToMinutes(baseTime) + minutesOffset);
        setParentGlobalTime(newTime);
      }
    },
    [parentGlobalTime, earliestTime],
  );

  const handleParentAcceptTimeAdjustment = useCallback(async () => {
    const submitPromises: Promise<void>[] = [];
    pendingParentUpdateTeachers.forEach((teacherId) => {
      const teacherGroup = teacherGroupRefs.current.get(teacherId);
      if (teacherGroup) {
        submitPromises.push(teacherGroup.submit());
      }
    });

    try {
      await Promise.all(submitPromises);
    } catch (error) {
      console.error("Error submitting one or more teacher schedules:", error);
    }

    handleParentCancelTimeAdjustment();
    router.refresh();
  }, [pendingParentUpdateTeachers, handleParentCancelTimeAdjustment, router]);

  const handleTeacherUpdateCompletion = useCallback((teacherId: string) => {
    setPendingParentUpdateTeachers((prev) => {
      const newSet = new Set(prev);
      newSet.delete(teacherId);
      return newSet;
    });
  }, []);

  const handleTeacherOptIn = useCallback((teacherId: string) => {
    setPendingParentUpdateTeachers((prev) => {
      const newSet = new Set(prev);
      newSet.add(teacherId);
      return newSet;
    });
  }, []);

  const handleParentFlagClick = useCallback(() => {
    const newMode = !parentTimeAdjustmentMode;
    setParentTimeAdjustmentMode(newMode);
    if (newMode) {
      setParentGlobalTime(earliestTime);
      const allTeacherIds = teacherEventGroups.map((group) => group.teacherId);
      setPendingParentUpdateTeachers(new Set(allTeacherIds));
    } else {
      handleParentCancelTimeAdjustment();
    }
  }, [
    parentTimeAdjustmentMode,
    earliestTime,
    teacherEventGroups,
    handleParentCancelTimeAdjustment,
  ]);

  const handleAllEventsDeleted = useCallback(() => {
    router.refresh();
  }, [router]);

  return (
    <div className="space-y-6">
      <ParentControlFlag
        events={events}
        selectedDate={selectedDate}
        earliestTime={earliestTime}
        parentTimeAdjustmentMode={parentTimeAdjustmentMode}
        parentGlobalTime={parentGlobalTime}
        onParentTimeAdjustment={handleParentTimeAdjustment}
        onParentAcceptTimeAdjustment={handleParentAcceptTimeAdjustment}
        onParentCancelTimeAdjustment={handleParentCancelTimeAdjustment}
        onParentFlagClick={handleParentFlagClick}
        onAllEventsDeleted={handleAllEventsDeleted}
      />

      {teacherEventGroups.length > 0 && (
        <div className="space-y-4">
          {teacherEventGroups.map((group) => (
            <TeacherEventsGroup
              key={group.teacherId}
              ref={(el: TeacherEventsGroupHandle | null) =>
                teacherGroupRefs.current.set(group.teacherId, el)
              }
              teacherSchedule={group.teacherSchedule}
              events={group.events}
              selectedDate={selectedDate}
              parentTimeAdjustmentMode={parentTimeAdjustmentMode}
              parentGlobalTime={parentGlobalTime}
              isPendingParentUpdate={pendingParentUpdateTeachers.has(
                group.teacherId,
              )}
              onCompleteOrOptOut={handleTeacherUpdateCompletion}
              onOptInToParentUpdate={handleTeacherOptIn}
            />
          ))}
        </div>
      )}
    </div>
  );
}
