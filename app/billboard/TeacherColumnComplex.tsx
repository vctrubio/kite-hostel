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
import { HeadsetIcon, FlagIcon } from "@/svgs";
import FlagCard from "@/components/cards/FlagCard";
import TeacherQueueEditor from "@/app/billboard/TeacherQueueEditor";
import {
  TeacherGrouping,
  type TeacherQueueGroupHandle,
} from "@/app/billboard/TeacherGrouping";
import {
  ChevronLeft,
  ChevronRight,
  Flag,
  FlagOff,
  ChevronDown,
} from "lucide-react";
import { TeacherQueue } from "@/backend/TeacherQueue";
import { BillboardClass } from "@/backend/BillboardClass";
import { type EventController } from "@/backend/types";
import { toast } from "sonner";
import { timeToMinutes, minutesToTime } from "@/components/formatters/TimeZone";
import { updateEvent } from "@/actions/event-actions";

interface TeacherColumnComplexProps {
  teachers: any[];
  teacherQueues: TeacherQueue[];
  controller: EventController;
  selectedDate: string;
}

interface TeacherQueueGroupProps {
  teacherQueue: TeacherQueue;
  selectedDate: string;
  parentTimeAdjustmentMode?: boolean;
  parentGlobalTime?: string | null;
  isPendingParentUpdate: boolean;
  onCompleteOrOptOut?: (teacherId: string) => void;
  onOptInToParentUpdate?: (teacherId: string) => void;
  controller: EventController;
}

const TeacherQueueGroup = forwardRef<
  TeacherQueueGroupHandle,
  TeacherQueueGroupProps
>((props, ref) => {
  const {
    teacherQueue,
    selectedDate,
    parentTimeAdjustmentMode = false,
    parentGlobalTime = null,
    isPendingParentUpdate,
    onCompleteOrOptOut,
    onOptInToParentUpdate,
    controller,
  } = props;

  const [isDropping, setIsDropping] = useState(false);
  const [timeAdjustmentMode, setTimeAdjustmentMode] = useState(false);
  const [globalTimeOffset, setGlobalTimeOffset] = useState(0);
  const [viewMode, setViewMode] = useState<"event" | "queue">("event");

  const scheduleNodes = useMemo(() => teacherQueue.getNodes(), [teacherQueue]);
  const [editableScheduleNodes, setEditableScheduleNodes] =
    useState(scheduleNodes);
  const schedule = teacherQueue.getSchedule();
  const router = useRouter();
  const teacherId = schedule.teacherId;
  const teacherStats = teacherQueue.getTeacherStats();
  const queueEvents = teacherQueue.getAllEvents();

  // Store original queue state for reset functionality
  const originalQueueState = useRef<any[]>([]);

  useEffect(() => {
    // Store original state when entering edit mode
    if (viewMode === "queue" && originalQueueState.current.length === 0) {
      originalQueueState.current = queueEvents.map((event) => ({
        ...event,
        eventData: { ...event.eventData },
      }));
    }
    // Clear original state when exiting edit mode
    if (viewMode === "event") {
      originalQueueState.current = [];
    }
  }, [viewMode, queueEvents]);

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
      await handleSubmitQueueChanges(true); // Pass true to suppress individual success messages
    },
  }));

  useEffect(() => {
    if (parentTimeAdjustmentMode && parentGlobalTime) {
      const offsetMinutes =
        timeToMinutes(parentGlobalTime) -
        timeToMinutes(scheduleNodes[0]?.startTime || "00:00");

      // Update UI nodes
      const updatedNodes = scheduleNodes.map((node) => ({
        ...node,
        startTime: minutesToTime(timeToMinutes(node.startTime) + offsetMinutes),
      }));
      setEditableScheduleNodes(updatedNodes);
      setGlobalTimeOffset(offsetMinutes);

      // Apply the actual displayed times to the TeacherQueue events
      const currentEvents = teacherQueue.getAllEvents();
      updatedNodes.forEach((node, index) => {
        if (
          currentEvents[index] &&
          node.eventData?.lessonId === currentEvents[index].lessonId
        ) {
          // Use the exact time from the node that's being displayed
          const localDateTimeString = `${selectedDate}T${node.startTime}:00`;
          currentEvents[index].eventData.date = localDateTimeString;
        }
      });
    } else if (!parentTimeAdjustmentMode) {
      // Reset TeacherQueue events back to original times when exiting parent mode
      const currentEvents = teacherQueue.getAllEvents();
      scheduleNodes.forEach((node, index) => {
        if (
          currentEvents[index] &&
          node.eventData?.lessonId === currentEvents[index].lessonId
        ) {
          // Restore original time from scheduleNodes
          const localDateTimeString = `${selectedDate}T${node.startTime}:00`;
          currentEvents[index].eventData.date = localDateTimeString;
        }
      });

      setEditableScheduleNodes(scheduleNodes);
      setGlobalTimeOffset(0);
      setTimeAdjustmentMode(false);
    }
  }, [
    parentTimeAdjustmentMode,
    parentGlobalTime,
    scheduleNodes,
    teacherQueue,
    selectedDate,
  ]);

  // Only update editable nodes when NOT in edit mode to avoid resetting user changes
  useEffect(() => {
    if (viewMode === "event") {
      setEditableScheduleNodes(scheduleNodes);
    }
  }, [scheduleNodes, viewMode]);

  const exitAndOptOut = useCallback(() => {
    onCompleteOrOptOut?.(teacherId);
  }, [onCompleteOrOptOut, teacherId]);

  const handleAdjustDuration = useCallback(
    (lessonId: string, increment: boolean) => {
      teacherQueue.adjustLessonDuration(lessonId, increment);
      const newNodes = teacherQueue.getNodes();
      setEditableScheduleNodes(newNodes);
    },
    [teacherQueue],
  );

  const handleAdjustTime = useCallback(
    (lessonId: string, increment: boolean) => {
      teacherQueue.adjustLessonTime(lessonId, increment);
      const newNodes = teacherQueue.getNodes();
      setEditableScheduleNodes(newNodes);
    },
    [teacherQueue],
  );

  const handleRemoveFromQueue = useCallback(
    (lessonId: string) => {
      teacherQueue.removeFromQueue(lessonId);
      const newNodes = teacherQueue.getNodes();
      setEditableScheduleNodes(newNodes);
    },
    [teacherQueue],
  );

  const handleMoveInQueue = useCallback(
    (lessonId: string, direction: "up" | "down") => {
      teacherQueue.moveLessonInQueue(lessonId, direction);
      setEditableScheduleNodes(teacherQueue.getNodes());
    },
    [teacherQueue],
  );

  const handleSubmitQueueChanges = useCallback(
    async (suppressSuccessMessage = false) => {
      try {
        // Get all the modified events from the teacher queue
        const currentEvents = teacherQueue.getAllEvents();

        // Update each event in the database
        const updatePromises = currentEvents.map(async (event) => {
          if (event.eventData.id) {
            return updateEvent(event.eventData.id, {
              date: event.eventData.date,
              duration: event.eventData.duration,
              location: event.eventData.location,
            });
          }
        });

        // Wait for all updates to complete
        const results = await Promise.all(updatePromises.filter(Boolean));

        // Check if all updates were successful
        const failedUpdates = results.filter((result) => !result?.success);

        if (failedUpdates.length > 0) {
          console.error("Some event updates failed:", failedUpdates);
          toast.error(`Failed to update ${failedUpdates.length} events`);
        } else if (!suppressSuccessMessage) {
          toast.success("All events updated successfully!");
          console.log("✅ All events updated successfully");
        }

        if (parentTimeAdjustmentMode) {
          onCompleteOrOptOut?.(teacherId);
        }

        router.refresh();
      } catch (error) {
        console.error("Error submitting queue changes:", error);
        toast.error("Failed to submit changes");
      }
    },
    [
      teacherId,
      teacherQueue,
      parentTimeAdjustmentMode,
      onCompleteOrOptOut,
      router,
    ],
  );

  const handleResetQueue = useCallback(() => {
    // Restore original TeacherQueue state
    if (originalQueueState.current.length > 0) {
      teacherQueue.restoreState(originalQueueState.current);
    }
    // Update schedule nodes to reflect the restored state
    const newNodes = teacherQueue.getNodes();
    setEditableScheduleNodes(newNodes);
  }, [teacherQueue]);

  const handleCancelQueue = useCallback(() => {
    if (parentTimeAdjustmentMode) {
      exitAndOptOut();
    } else {
      // Reset to original state and exit edit mode
      handleResetQueue();
      setViewMode("event");
    }
  }, [parentTimeAdjustmentMode, exitAndOptOut, handleResetQueue]);

  const handleSubmitAndExit = useCallback(async () => {
    await handleSubmitQueueChanges(false); // Keep success messages for individual submissions
    setViewMode("event");
  }, [handleSubmitQueueChanges]);

  const handleTimeAdjustment = useCallback(
    (minutesOffset: number) => {
      const newOffset = globalTimeOffset + minutesOffset;
      setGlobalTimeOffset(newOffset);

      if (newOffset === 0) {
        setEditableScheduleNodes(scheduleNodes);
        return;
      }

      const updatedNodes = scheduleNodes.map((node) => ({
        ...node,
        startTime: minutesToTime(timeToMinutes(node.startTime) + newOffset),
      }));
      setEditableScheduleNodes(updatedNodes);
    },
    [globalTimeOffset, scheduleNodes],
  );

  const handleAcceptTimeAdjustment = useCallback(async () => {
    console.log("Accepting time adjustment for teacher:", teacherId);

    if (parentTimeAdjustmentMode) {
      onCompleteOrOptOut?.(teacherId);
    } else {
      setTimeAdjustmentMode(false);
      setGlobalTimeOffset(0);
      setViewMode("event");
    }
    router.refresh();
  }, [teacherId, parentTimeAdjustmentMode, onCompleteOrOptOut, router]);

  const handleCancelTimeAdjustment = useCallback(() => {
    if (parentTimeAdjustmentMode) {
      // Reset TeacherQueue events back to original times before exiting
      const currentEvents = teacherQueue.getAllEvents();
      scheduleNodes.forEach((node, index) => {
        if (
          currentEvents[index] &&
          node.eventData?.lessonId === currentEvents[index].lessonId
        ) {
          // Restore original time from scheduleNodes
          const localDateTimeString = `${selectedDate}T${node.startTime}:00`;
          currentEvents[index].eventData.date = localDateTimeString;
        }
      });

      // Reset UI state
      setEditableScheduleNodes(scheduleNodes);
      setGlobalTimeOffset(0);
      setTimeAdjustmentMode(false);

      // Then exit parent mode
      exitAndOptOut();
    } else {
      setTimeAdjustmentMode(false);
      setGlobalTimeOffset(0);
      setEditableScheduleNodes(scheduleNodes);
      setViewMode("event");
    }
  }, [
    parentTimeAdjustmentMode,
    exitAndOptOut,
    scheduleNodes,
    teacherQueue,
    selectedDate,
  ]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDropping(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDropping(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDropping(false);

    try {
      const dragData = e.dataTransfer.getData("application/json");
      if (!dragData) return;

      const parsedData = JSON.parse(dragData);
      const billboardClass = new BillboardClass(parsedData.booking);

      const hasValidLesson = billboardClass.hasTeacher(teacherId);

      if (!hasValidLesson) {
        toast.error("Assign Teacher To Lesson First");
        return;
      }

      const result = await teacherQueue.addEventAction(
        billboardClass,
        controller,
      );

      if (!result.success) {
        console.error("Failed to create event:", result.error);
        toast.error(`Failed to create event: ${result.error}`);
      } else {
        toast.success("Event created successfully!");
      }
    } catch (error) {
      console.error("Error handling drop:", error);
      toast.error("Error handling drop");
    }
  };

  const renderEventCards = () => {
    return queueEvents.map((eventNode, index) => (
      <div key={`event-${eventNode.id}-${index}`} className="flex-shrink-0">
        <FlagCard
          startTime={eventNode.eventData.date}
          duration={eventNode.eventData.duration}
          students={eventNode.billboardClass.getStudentNames()}
          status={eventNode.eventData.status}
          eventId={eventNode.eventData.id}
          onStatusChange={() => { }}
        />
      </div>
    ));
  };

  return (
    <TeacherGrouping
      ref={ref}
      teacherQueue={teacherQueue}
      selectedDate={selectedDate}
      parentTimeAdjustmentMode={parentTimeAdjustmentMode}
      parentGlobalTime={parentGlobalTime}
      isPendingParentUpdate={isPendingParentUpdate}
      onCompleteOrOptOut={onCompleteOrOptOut}
      onOptInToParentUpdate={onOptInToParentUpdate}
      controller={controller}
      viewMode={viewMode}
      timeAdjustmentMode={timeAdjustmentMode}
      globalTimeOffset={globalTimeOffset}
      editableScheduleNodes={editableScheduleNodes}
      onSubmit={handleSubmitQueueChanges}
      onSetViewMode={setViewMode}
      onSetTimeAdjustmentMode={setTimeAdjustmentMode}
      onTimeAdjustment={handleTimeAdjustment}
      onAcceptTimeAdjustment={handleAcceptTimeAdjustment}
      onCancelTimeAdjustment={handleCancelTimeAdjustment}
      onResetQueue={handleResetQueue}
      onCancelQueue={handleCancelQueue}
      onSubmitAndExit={handleSubmitAndExit}
    >
      {viewMode === "event" && renderEventCards()}
      {viewMode === "queue" && (
        <TeacherQueueEditor
          scheduleNodes={editableScheduleNodes}
          originalScheduleNodes={scheduleNodes}
          events={queueEvents.map((event) => ({
            id: event.eventData.id,
            lesson: {
              id: event.lessonId,
            },
            booking: {
              students: event.billboardClass.getStudents(),
            },
            location: event.eventData.location,
            duration: event.eventData.duration,
            status: event.eventData.status,
          }))}
          teacherQueue={teacherQueue}
          selectedDate={selectedDate}
          onRemove={handleRemoveFromQueue}
          onAdjustDuration={handleAdjustDuration}
          onAdjustTime={handleAdjustTime}
          onMove={handleMoveInQueue}
          onRefresh={() => {
            const newNodes = teacherQueue.getNodes();
            setEditableScheduleNodes(newNodes);
          }}
        />
      )}
    </TeacherGrouping>
  );
});
TeacherQueueGroup.displayName = "TeacherQueueGroup";

function ParentControlFlag({
  selectedDate,
  earliestTime,
  parentTimeAdjustmentMode,
  parentGlobalTime,
  onParentTimeAdjustment,
  onParentAcceptTimeAdjustment,
  onParentCancelTimeAdjustment,
  onParentFlagClick,
}: {
  selectedDate: string;
  earliestTime: string | null;
  parentTimeAdjustmentMode: boolean;
  parentGlobalTime: string | null;
  onParentTimeAdjustment: (minutesOffset: number) => void;
  onParentAcceptTimeAdjustment: () => void;
  onParentCancelTimeAdjustment: () => void;
  onParentFlagClick: () => void;
}) {
  const dayOfWeek = useMemo(
    () =>
      new Date(selectedDate).toLocaleDateString("en-US", { weekday: "long" }),
    [selectedDate],
  );

  return (
    <div className="border border-border dark:border-gray-700 rounded-lg p-4">
      <div className="flex justify-between items-center pl-2 ">
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
      </div>
    </div>
  );
}

export default function TeacherColumnComplex({
  teachers,
  teacherQueues,
  controller,
  selectedDate,
}: TeacherColumnComplexProps) {
  const [parentTimeAdjustmentMode, setParentTimeAdjustmentMode] =
    useState(false);
  const [parentGlobalTime, setParentGlobalTime] = useState<string | null>(null);
  const [pendingParentUpdateTeachers, setPendingParentUpdateTeachers] =
    useState<Set<string>>(new Set());
  const router = useRouter();
  const teacherGroupRefs = useRef<Map<string, TeacherQueueGroupHandle | null>>(
    new Map(),
  );

  const teacherQueueGroups = useMemo(() => {
    return teacherQueues
      .map((teacherQueue) => ({
        teacherId: teacherQueue.teacher.id,
        teacherQueue,
      }))
      .filter((group) => group.teacherQueue);
  }, [teacherQueues]);

  const earliestTime = useMemo(() => {
    const times: string[] = [];
    teacherQueues.forEach((queue) => {
      const flagTime = queue.getFlagTime();
      if (flagTime) {
        times.push(flagTime);
      }
    });

    if (times.length === 0) {
      return "No lessons today";
    }

    return times.sort((a, b) => a.localeCompare(b))[0];
  }, [teacherQueues]);

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
      if (baseTime && baseTime !== "No lessons today") {
        const newTime = minutesToTime(timeToMinutes(baseTime) + minutesOffset);
        setParentGlobalTime(newTime);
      }
    },
    [parentGlobalTime, earliestTime],
  );

  const handleParentAcceptTimeAdjustment = useCallback(async () => {
    const submitPromises: Promise<void>[] = [];
    let totalEventsUpdated = 0;

    // Get count of events that will be updated before submitting
    pendingParentUpdateTeachers.forEach((teacherId) => {
      const teacherQueue = teacherQueues.find(
        (q) => q.teacher.id === teacherId,
      );
      if (teacherQueue) {
        totalEventsUpdated += teacherQueue.getAllEvents().length;
      }
    });

    pendingParentUpdateTeachers.forEach((teacherId) => {
      const teacherGroup = teacherGroupRefs.current.get(teacherId);
      if (teacherGroup) {
        submitPromises.push(teacherGroup.submit());
      }
    });

    try {
      await Promise.all(submitPromises);
      toast.success(`${totalEventsUpdated} Events Successfully Updated`);
    } catch (error) {
      console.error("Error submitting one or more teacher schedules:", error);
      toast.error("Failed to submit some teacher schedules");
    }

    handleParentCancelTimeAdjustment();
    router.refresh();
  }, [
    pendingParentUpdateTeachers,
    teacherQueues,
    handleParentCancelTimeAdjustment,
    router,
  ]);

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
      setParentGlobalTime(
        earliestTime !== "No lessons today" ? earliestTime : null,
      );
      // Only include teachers that have events
      const teachersWithEvents = teacherQueueGroups
        .filter((group) => group.teacherQueue.getAllEvents().length > 0)
        .map((group) => group.teacherId);
      setPendingParentUpdateTeachers(new Set(teachersWithEvents));
    } else {
      handleParentCancelTimeAdjustment();
    }
  }, [
    parentTimeAdjustmentMode,
    earliestTime,
    teacherQueueGroups,
    handleParentCancelTimeAdjustment,
  ]);

  return (
    <div className="col-span-3">
      <ParentControlFlag
        selectedDate={selectedDate}
        earliestTime={earliestTime}
        parentTimeAdjustmentMode={parentTimeAdjustmentMode}
        parentGlobalTime={parentGlobalTime}
        onParentTimeAdjustment={handleParentTimeAdjustment}
        onParentAcceptTimeAdjustment={handleParentAcceptTimeAdjustment}
        onParentCancelTimeAdjustment={handleParentCancelTimeAdjustment}
        onParentFlagClick={handleParentFlagClick}
      />

      {teacherQueueGroups.length > 0 && (
        <div className="space-y-4 mt-4">
          {teacherQueueGroups.map((group) => (
            <TeacherQueueGroup
              key={group.teacherId}
              ref={(el: TeacherQueueGroupHandle | null) =>
                teacherGroupRefs.current.set(group.teacherId, el)
              }
              teacherQueue={group.teacherQueue}
              selectedDate={selectedDate}
              parentTimeAdjustmentMode={parentTimeAdjustmentMode}
              parentGlobalTime={parentGlobalTime}
              isPendingParentUpdate={pendingParentUpdateTeachers.has(
                group.teacherId,
              )}
              onCompleteOrOptOut={handleTeacherUpdateCompletion}
              onOptInToParentUpdate={handleTeacherOptIn}
              controller={controller}
            />
          ))}
        </div>
      )}
    </div>
  );
}
