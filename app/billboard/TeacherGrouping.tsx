"use client";

import { forwardRef, useImperativeHandle, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { HeadsetIcon } from "@/svgs";
import { Flag, ChevronLeft, ChevronRight } from "lucide-react";
import { TeacherQueue } from "@/backend/TeacherQueue";
import { BillboardClass } from "@/backend/BillboardClass";
import { type EventController } from "@/backend/types";
import { timeToMinutes, minutesToTime } from "@/components/formatters/TimeZone";
import { toast } from "sonner";

// Types
export interface TeacherQueueGroupHandle {
  submit: () => Promise<void>;
}

interface TeacherQueueGroupProps {
  teacherQueue: TeacherQueue;
  selectedDate: string;
  draggedBooking?: BillboardClass | null;
  parentTimeAdjustmentMode?: boolean;
  parentGlobalTime?: string | null;
  isPendingParentUpdate: boolean;
  onCompleteOrOptOut?: (teacherId: string) => void;
  onOptInToParentUpdate?: (teacherId: string) => void;
  controller: EventController;
  // UI handlers
  viewMode: "event" | "queue";
  timeAdjustmentMode: boolean;
  globalTimeOffset: number;
  editableScheduleNodes: any[];
  onSubmit: () => Promise<void>;
  onSetViewMode: (mode: "event" | "queue") => void;
  onSetTimeAdjustmentMode: (mode: boolean) => void;
  onTimeAdjustment: (offset: number) => void;
  onAcceptTimeAdjustment: () => void;
  onCancelTimeAdjustment: () => void;
  onResetQueue: () => void;
  onCancelQueue: () => void;
  onSubmitAndExit: () => void;
  children?: React.ReactNode;
}

// Sub-component: Left Column with all Teacher Info
function TeacherLeftColumn({
  teacherName,
  displayTime,
  timeAdjustmentMode,
  proposedTimeOffset,
  parentTimeAdjustmentMode,
  teacherStats,
  viewMode,
  isPendingParentUpdate,
  teacherId,
  hasEvents,
  onTimeAdjustment,
  onSetTimeAdjustmentMode,
  onSetViewMode,
  onOptInToParentUpdate,
  onAcceptTimeAdjustment,
  onSubmitAndExit,
  onCancelTimeAdjustment,
  onResetQueue,
  onCancelQueue,
}: {
  teacherName: string;
  displayTime: string;
  timeAdjustmentMode: boolean;
  proposedTimeOffset: number;
  parentTimeAdjustmentMode: boolean;
  teacherStats: any;
  viewMode: "event" | "queue";
  isPendingParentUpdate: boolean;
  teacherId: string;
  hasEvents: boolean;
  onTimeAdjustment: (offset: number) => void;
  onSetTimeAdjustmentMode: (mode: boolean) => void;
  onSetViewMode: (mode: "event" | "queue") => void;
  onOptInToParentUpdate?: (teacherId: string) => void;
  onAcceptTimeAdjustment: () => void;
  onSubmitAndExit: () => void;
  onCancelTimeAdjustment: () => void;
  onResetQueue: () => void;
  onCancelQueue: () => void;
}) {
  return (
    <div className="w-72 p-4 border-r border-border flex-shrink-0 space-y-4">
      {/* Teacher Header */}
      <div className="flex items-center gap-2 pl-1">
        <HeadsetIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
        <h4 className="text-lg font-medium text-foreground dark:text-white">
          {teacherName}
        </h4>
      </div>

      {/* Time Flag */}
      <div>
        {timeAdjustmentMode ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => hasEvents && onTimeAdjustment(-30)}
              disabled={!hasEvents}
              className={`p-1 rounded transition-colors ${hasEvents
                ? "hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                : "cursor-not-allowed opacity-50"
                }`}
              title={hasEvents ? "Move back 30 minutes" : "No events to adjust"}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="min-w-[60px] text-center font-mono">
              {displayTime}
              {proposedTimeOffset !== 0 &&
                !parentTimeAdjustmentMode &&
                hasEvents && (
                  <span className="text-orange-600 dark:text-orange-400 ml-1">
                    ({proposedTimeOffset > 0 ? "+" : ""}
                    {proposedTimeOffset}m)
                  </span>
                )}
            </span>
            <button
              onClick={() => hasEvents && onTimeAdjustment(30)}
              disabled={!hasEvents}
              className={`p-1 rounded transition-colors ${hasEvents
                ? "hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                : "cursor-not-allowed opacity-50"
                }`}
              title={
                hasEvents ? "Move forward 30 minutes" : "No events to adjust"
              }
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => {
              if (hasEvents) {
                onSetTimeAdjustmentMode(true);
                onSetViewMode("queue");
              }
            }}
            className={`flex items-center gap-1 rounded px-2 py-1 transition-colors ${hasEvents
              ? "hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
              : "cursor-not-allowed opacity-50"
              }`}
            title={
              hasEvents
                ? "Click to adjust start time and switch to queue view"
                : "No events to adjust"
            }
          >
            <Flag className={`w-4 h-4 ${hasEvents ? "" : "text-gray-400"}`} />
            <span className={hasEvents ? "" : "text-gray-400"}>
              {displayTime}
            </span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-3">
        <div className="grid grid-cols-4 gap-2 text-sm">
          <div className="text-center">
            <div className="font-semibold text-indigo-600 dark:text-indigo-400">
              {teacherStats.eventCount}
            </div>
            <div className="text-xs text-muted-foreground">Events</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-purple-600 dark:text-purple-400">
              {teacherStats.totalHours}h
            </div>
            <div className="text-xs text-muted-foreground">Duration</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-green-600 dark:text-green-400">
              €{Math.round(teacherStats.earnings.teacher)}
            </div>
            <div className="text-xs text-muted-foreground">Teacher</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-orange-600 dark:text-orange-400">
              €{Math.round(teacherStats.earnings.school)}
            </div>
            <div className="text-xs text-muted-foreground">School</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2">
        {viewMode === "event" ? (
          <button
            onClick={() => {
              if (
                hasEvents &&
                parentTimeAdjustmentMode &&
                !isPendingParentUpdate
              ) {
                onOptInToParentUpdate?.(teacherId);
              } else if (hasEvents) {
                onSetViewMode("queue");
              }
            }}
            disabled={!hasEvents}
            className={`w-full px-3 py-2 text-sm rounded border transition-colors ${hasEvents
              ? "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-300 cursor-pointer"
              : "bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed"
              }`}
            title={
              hasEvents ? "Edit schedule in queue view" : "No events to edit"
            }
          >
            Edit Schedule
          </button>
        ) : (
          <>
            <button
              onClick={
                timeAdjustmentMode ? onAcceptTimeAdjustment : onSubmitAndExit
              }
              className="w-full px-3 py-2 text-sm bg-green-100 text-green-800 rounded hover:bg-green-200 border border-green-300"
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
                timeAdjustmentMode ? () => {
                  // Reset time adjustments but stay in edit mode
                  onTimeAdjustment(-globalTimeOffset);
                } : onResetQueue
              }
              className="w-full px-3 py-2 text-sm bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 border border-yellow-300"
              title={
                timeAdjustmentMode
                  ? "Reset time changes but stay in edit mode"
                  : "Reset all changes made to the queue"
              }
            >
              Reset
            </button>
            <button
              onClick={
                timeAdjustmentMode ? onCancelTimeAdjustment : onCancelQueue
              }
              className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-800 rounded hover:bg-gray-200 border border-gray-300"
              title={
                timeAdjustmentMode
                  ? "Reset time changes and exit edit mode"
                  : "Cancel editing and discard all changes"
              }
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// Sub-component: Right Content Area
function TeacherRightContent({
  children,
  isDropping,
  dragCompatibility,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onDrop,
}: {
  children: React.ReactNode;
  isDropping: boolean;
  dragCompatibility: "compatible" | "incompatible" | null;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}) {
  // Determine border color based on drag compatibility
  const getBorderColor = () => {
    if (!isDropping) return "";
    if (dragCompatibility === "compatible")
      return "border-green-400 bg-green-50/50 dark:bg-green-950/50";
    if (dragCompatibility === "incompatible")
      return "border-orange-400 bg-orange-50/50 dark:bg-orange-950/50";
    // Only show blue border if we haven't determined compatibility yet (during initial drag enter)
    return dragCompatibility === null
      ? "border-blue-400 bg-blue-50/50 dark:bg-blue-950/50"
      : "";
  };

  return (
    <div
      className={`flex-1 p-4 transition-colors ${getBorderColor()}`}
      onDragOver={onDragOver}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className="min-h-[200px] flex flex-wrap gap-4">{children}</div>
    </div>
  );
}

// Main Component
export const TeacherGrouping = forwardRef<
  TeacherQueueGroupHandle,
  TeacherQueueGroupProps
>((props, ref) => {
  const {
    teacherQueue,
    draggedBooking: externalDraggedBooking,
    parentTimeAdjustmentMode = false,
    isPendingParentUpdate,
    onOptInToParentUpdate,
    controller,
    viewMode,
    timeAdjustmentMode,
    globalTimeOffset,
    editableScheduleNodes,
    onSubmit,
    onSetViewMode,
    onSetTimeAdjustmentMode,
    onTimeAdjustment,
    onAcceptTimeAdjustment,
    onCancelTimeAdjustment,
    onResetQueue,
    onCancelQueue,
    onSubmitAndExit,
    children,
  } = props;

  // Drag and drop state
  const [isDropping, setIsDropping] = useState(false);

  const schedule = teacherQueue.getSchedule();
  const teacherId = schedule.teacherId;
  const teacherStats = teacherQueue.getTeacherStats();
  const hasEvents = teacherQueue.getAllEvents().length > 0;

  // Check if the dragged booking has a lesson assigned to this teacher
  const dragCompatibility = useMemo(() => {
    if (!externalDraggedBooking) return null;

    const hasTeacherAssigned = externalDraggedBooking.hasTeacher(teacherId);
    return hasTeacherAssigned ? "compatible" : "incompatible";
  }, [externalDraggedBooking, teacherId]);

  // Expose submit method via ref
  useImperativeHandle(ref, () => ({
    submit: onSubmit,
  }));

  // Get display time for flag
  const firstEventNode = editableScheduleNodes.find(
    (node) => node.type === "event",
  );
  const displayTime = firstEventNode
    ? firstEventNode.startTime
    : "No Lesson Plan";

  // Drag and drop handlers
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
      if (!dragData) {
        toast.error("No drag data found");
        return;
      }

      const parsedData = JSON.parse(dragData);
      const billboardClass = new BillboardClass(parsedData.booking);

      // Check if teacher has a lesson assigned to this booking
      const hasValidLesson = billboardClass.hasTeacher(teacherId);

      if (!hasValidLesson) {
        toast.error(`Assign ${schedule.teacherName} to the lesson`);
        return;
      }

      // Call the addEventAction method from TeacherQueue
      const result = await teacherQueue.addEventAction(
        billboardClass,
        controller,
      );

      if (!result.success) {
        console.error("Failed to create event:", result.error);
        toast.error(`Failed to create event: ${result.error}`);
      }
    } catch (error) {
      console.error("Error handling drop:", error);
      toast.error("Error handling drop");
    }
  };

  return (
    <div className="bg-card dark:bg-gray-800 border border-border dark:border-gray-700 rounded-lg">
      <div className="flex min-h-[200px]">
        {/* Left Column - Teacher Info, Stats & Actions */}
        <TeacherLeftColumn
          teacherName={schedule.teacherName}
          displayTime={displayTime}
          timeAdjustmentMode={timeAdjustmentMode}
          proposedTimeOffset={globalTimeOffset}
          parentTimeAdjustmentMode={parentTimeAdjustmentMode}
          teacherStats={teacherStats}
          viewMode={viewMode}
          isPendingParentUpdate={isPendingParentUpdate}
          teacherId={teacherId}
          hasEvents={hasEvents}
          onTimeAdjustment={onTimeAdjustment}
          onSetTimeAdjustmentMode={onSetTimeAdjustmentMode}
          onSetViewMode={onSetViewMode}
          onOptInToParentUpdate={onOptInToParentUpdate}
          onAcceptTimeAdjustment={onAcceptTimeAdjustment}
          onSubmitAndExit={onSubmitAndExit}
          onCancelTimeAdjustment={onCancelTimeAdjustment}
          onResetQueue={onResetQueue}
          onCancelQueue={onCancelQueue}
        />

        {/* Right Column - Content Area */}
        <TeacherRightContent
          isDropping={isDropping}
          dragCompatibility={dragCompatibility}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Content will be passed as children from parent */}
          {children}
        </TeacherRightContent>
      </div>
    </div>
  );
});

TeacherGrouping.displayName = "TeacherGrouping";
