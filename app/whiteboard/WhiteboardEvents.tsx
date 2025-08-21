'use client';

import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import EventCard, { GapCard } from "@/components/cards/EventCard";
import TeacherEventQueue from "@/components/whiteboard-usage/TeacherEventQueue";
import { HeadsetIcon, Zap, ChevronLeft, ChevronRight, Wind, ChevronDown } from "lucide-react";
import { FlagIcon } from "@/svgs/FlagIcon";
import { TeacherSchedule, ScheduleNode } from "@/backend/TeacherSchedule";
import { type ReorganizationOption } from "@/backend/types";
import { TeacherEventsUtils, type TeacherEventGroupData } from "@/backend/TeacherEventsUtils";
import { reorganizeEventTimes } from "@/actions/kite-actions";
import { updateEvent, deleteEvent } from "@/actions/event-actions";
import {
  timeToMinutes,
  minutesToTime,
  createUTCDateTime,
  toUTCString,
} from "@/components/formatters/TimeZone";
import { extractStudentNames } from '@/backend/WhiteboardClass';

interface WhiteboardEventsProps {
  events: any[];
  selectedDate: string;
  teacherSchedules: Map<string, TeacherSchedule>;
  viewAs?: "admin" | "teacher" | "student";
}

// Sub-component: Time Adjustment Flag
interface TimeAdjustmentFlagProps {
  proposedTimeOffset: number;
  timeAdjustmentMode: boolean;
  editableScheduleNodes: ScheduleNode[];
  parentTimeAdjustmentMode?: boolean;
  onTimeAdjustment: (minutesOffset: number) => void;
  onAcceptTimeAdjustment: () => void;
  onCancelTimeAdjustment: () => void;
  onSetTimeAdjustmentMode: (mode: boolean) => void;
  onSetViewMode: (mode: "event" | "queue") => void;
}

function TimeAdjustmentFlag({
  proposedTimeOffset,
  timeAdjustmentMode,
  editableScheduleNodes,
  parentTimeAdjustmentMode = false,
  onTimeAdjustment,
  onAcceptTimeAdjustment,
  onCancelTimeAdjustment,
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
      <FlagIcon className="w-4 h-4" />
      <span>{displayTime}</span>
    </div>
  );
}

// Sub-component: Parent Time Adjustment Flag
interface ParentTimeAdjustmentFlagProps {
  parentTimeAdjustmentMode: boolean;
  parentGlobalTime: string | null;
  earliestTime: string | null;
  onParentTimeAdjustment: (minutesOffset: number) => void;
  onParentFlagClick: () => void;
}

function ParentTimeAdjustmentFlag({
  parentTimeAdjustmentMode,
  parentGlobalTime,
  earliestTime,
  onParentTimeAdjustment,
  onParentFlagClick,
}: ParentTimeAdjustmentFlagProps) {
  if (parentTimeAdjustmentMode) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => onParentTimeAdjustment(-30)}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          title="Move all schedules back 30 minutes"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="min-w-[60px] text-center font-mono">
          {parentGlobalTime || "No events"}
        </span>
        <button
          onClick={() => onParentTimeAdjustment(30)}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          title="Move all schedules forward 30 minutes"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={onParentFlagClick}
      className="flex items-center gap-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-2 py-1 cursor-pointer transition-colors"
      title="Click to adjust all schedules globally"
    >
      <FlagIcon className="w-4 h-4" />
      <span>{earliestTime || "No events"}</span>
    </div>
  );
}

// Sub-component: Teacher Events Group using TeacherSchedule
function TeacherEventsGroup({
  teacherSchedule,
  events,
  selectedDate,
  viewAs = "admin",
  parentTimeAdjustmentMode = false,
  parentGlobalTime = null,
  onTeacherEditModeChange,
}: {
  teacherSchedule: TeacherSchedule;
  events: any[];
  selectedDate: string;
  viewAs?: "admin" | "teacher" | "student";
  parentTimeAdjustmentMode?: boolean;
  parentGlobalTime?: string | null;
  onTeacherEditModeChange?: (teacherId: string, inEditMode: boolean) => void;
}) {
  // State management
  const [pendingReorganizations, setPendingReorganizations] = useState<
    Map<string, ReorganizationOption[]>
  >(new Map());
  const [timeAdjustmentMode, setTimeAdjustmentMode] = useState(false);
  const [globalTimeOffset, setGlobalTimeOffset] = useState(0);
  const [viewMode, setViewMode] = useState<"event" | "queue">("event");

  // Computed values
  const scheduleNodes = useMemo(() => teacherSchedule.getNodes(), [teacherSchedule]);
  const eventNodes = useMemo(() => scheduleNodes.filter((node) => node.type === "event"), [scheduleNodes]);
  const [editableScheduleNodes, setEditableScheduleNodes] = useState(scheduleNodes);
  const schedule = teacherSchedule.getSchedule();
  const canReorganize = teacherSchedule.canReorganizeSchedule();
  const router = useRouter();

  // Parent mode auto-switch effect
  useEffect(() => {
    if (parentTimeAdjustmentMode && viewMode === "event") {
      setViewMode("queue");
      setTimeAdjustmentMode(true);
      const teacherId = teacherSchedule.getSchedule().teacherId;
      onTeacherEditModeChange?.(teacherId, true);
    }
  }, [parentTimeAdjustmentMode, viewMode]);

  // Parent time application effect  
  useEffect(() => {
    const teacherId = teacherSchedule.getSchedule().teacherId;

    if (parentTimeAdjustmentMode && parentGlobalTime) {
      const updatedNodes = TeacherEventsUtils.applyParentTimeToSchedule(scheduleNodes, parentGlobalTime);
      const timeOffset = TeacherEventsUtils.calculateTimeOffset(teacherSchedule, parentGlobalTime);
      setEditableScheduleNodes(updatedNodes);
      setGlobalTimeOffset(timeOffset);
    } else if (!parentTimeAdjustmentMode) {
      setEditableScheduleNodes(scheduleNodes);
      setGlobalTimeOffset(0);
      setTimeAdjustmentMode(false);
      setViewMode("event");
    }
  }, [parentTimeAdjustmentMode, parentGlobalTime, scheduleNodes, teacherSchedule]);

  // Sync with original schedule
  useEffect(() => {
    setEditableScheduleNodes(scheduleNodes);
  }, [scheduleNodes]);

  // Handler functions (using backend utilities)
  const handleAdjustDuration = useCallback((lessonId: string, increment: boolean) => {
    setEditableScheduleNodes((currentNodes) => 
      TeacherEventsUtils.adjustLessonDuration(currentNodes, lessonId, increment)
    );
  }, []);

  const handleAdjustTime = useCallback((lessonId: string, increment: boolean) => {
    setEditableScheduleNodes((currentNodes) => {
      const { nodes, globalOffsetDelta } = TeacherEventsUtils.adjustLessonTime(currentNodes, lessonId, increment);
      setGlobalTimeOffset(prev => prev + globalOffsetDelta);
      return nodes;
    });
  }, []);

  const handleRemoveFromQueue = useCallback((lessonId: string) => {
    setEditableScheduleNodes((currentNodes) => {
      const { nodes, newGlobalOffset } = TeacherEventsUtils.removeLessonFromQueue(currentNodes, scheduleNodes, lessonId);
      setGlobalTimeOffset(newGlobalOffset);
      return nodes;
    });
  }, [scheduleNodes]);

  const handleRemoveGap = useCallback((lessonId: string) => {
    if (!teacherSchedule) return;
    teacherSchedule.removeGapForLesson(lessonId);
    const updatedNodes = teacherSchedule.getNodes();
    setEditableScheduleNodes(updatedNodes);
  }, [teacherSchedule]);

  const handleMoveInQueue = useCallback((lessonId: string, direction: 'up' | 'down') => {
    setEditableScheduleNodes(currentNodes => 
      TeacherEventsUtils.moveLessonInQueue(currentNodes, lessonId, direction)
    );
  }, []);

  const handleSubmitQueueChanges = useCallback(async () => {
    await TeacherEventsUtils.submitQueueChanges(scheduleNodes, editableScheduleNodes, events, selectedDate);
  }, [scheduleNodes, editableScheduleNodes, events, selectedDate]);

  const handleResetQueue = useCallback(() => {
    setEditableScheduleNodes(scheduleNodes);
  }, [scheduleNodes]);

  const handleCancelQueue = useCallback(() => {
    const teacherId = teacherSchedule.getSchedule().teacherId;
    
    if (parentTimeAdjustmentMode) {
      setEditableScheduleNodes(scheduleNodes);
    } else {
      setViewMode("event");
      setEditableScheduleNodes(scheduleNodes);
    }
    
    onTeacherEditModeChange?.(teacherId, false);
  }, [scheduleNodes, teacherSchedule, onTeacherEditModeChange, parentTimeAdjustmentMode]);

  const handleSubmitAndExit = useCallback(async () => {
    await handleSubmitQueueChanges();
    setViewMode("event");
  }, [handleSubmitQueueChanges]);

  const handleFullScheduleReorganization = useCallback(async () => {
    const success = await TeacherEventsUtils.performFullScheduleReorganization(teacherSchedule, events, selectedDate);
    if (success) {
      router.refresh();
    }
  }, [teacherSchedule, events, selectedDate, router]);

  const handleTimeAdjustment = useCallback((minutesOffset: number) => {
    const newOffset = globalTimeOffset + minutesOffset;
    setGlobalTimeOffset(newOffset);

    if (newOffset === 0) {
      setEditableScheduleNodes(scheduleNodes);
      return;
    }

    const updatedNodes = TeacherEventsUtils.applyGlobalTimeOffset(scheduleNodes, newOffset);
    setEditableScheduleNodes(updatedNodes);
  }, [globalTimeOffset, scheduleNodes]);

  const handleAcceptTimeAdjustment = useCallback(async () => {
    const result = await TeacherEventsUtils.acceptTimeAdjustment(teacherSchedule, globalTimeOffset, events, selectedDate);
    
    if (result.success) {
      if (result.updatedNodes) {
        setEditableScheduleNodes(result.updatedNodes);
      }
      setTimeAdjustmentMode(false);
      setGlobalTimeOffset(0);
      if (!parentTimeAdjustmentMode) {
        setViewMode("event");
      }
    } else {
      setEditableScheduleNodes(scheduleNodes);
    }
  }, [teacherSchedule, globalTimeOffset, events, selectedDate, parentTimeAdjustmentMode, scheduleNodes]);

  const handleStatusChange = useCallback(async (eventId: string, newStatus: "planned" | "completed" | "tbc" | "cancelled") => {
    await TeacherEventsUtils.changeEventStatus(eventId, newStatus);
  }, []);

  const handleCancelTimeAdjustment = useCallback(() => {
    const teacherId = teacherSchedule.getSchedule().teacherId;
    
    if (parentTimeAdjustmentMode) {
      setTimeAdjustmentMode(false);
      setGlobalTimeOffset(0);
      setEditableScheduleNodes(scheduleNodes);
    } else {
      setTimeAdjustmentMode(false);
      setGlobalTimeOffset(0);
      setEditableScheduleNodes(scheduleNodes);
      setViewMode("event");
    }
    
    onTeacherEditModeChange?.(teacherId, false);
  }, [scheduleNodes, teacherSchedule, onTeacherEditModeChange, parentTimeAdjustmentMode]);

  // Render event cards
  const renderEventCards = () => {
    return scheduleNodes.map((node) => {
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

      const eventData = events.find((e) => e.lesson?.id === node.eventData?.lessonId);
      if (!eventData) return null;

      const studentNames = eventData.booking ? extractStudentNames(eventData.booking) : "No students";

      return (
        <div key={`event-${node.id}-${eventData.id}`}>
          <EventCard
            students={studentNames}
            location={eventData?.location || "No location"}
            duration={node.duration}
            date={new Date(`${selectedDate}T${node.startTime}`).toISOString()}
            status={eventData?.status || "No status"}
            viewAs={viewAs}
            reorganizationOptions={pendingReorganizations.get(eventData.id)}
            onDelete={() => {}}
            onReorganize={() => {}}
            onDismissReorganization={() => {}}
            onCancelReorganization={() => {}}
            onStatusChange={(newStatus) => handleStatusChange(eventData.id, newStatus)}
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
            onAcceptTimeAdjustment={handleAcceptTimeAdjustment}
            onCancelTimeAdjustment={handleCancelTimeAdjustment}
            onSetTimeAdjustmentMode={setTimeAdjustmentMode}
            onSetViewMode={setViewMode}
          />
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground dark:text-gray-400">
          {viewMode === "event" ? (
            <>
              {canReorganize && viewAs === "admin" && (
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
                onClick={() => setViewMode("queue")}
                className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 border border-blue-300"
                title="Edit schedule in queue view"
              >
                Edit Schedule
              </button>
            </>
          ) : (
            <>
              <button
                onClick={timeAdjustmentMode ? handleAcceptTimeAdjustment : handleSubmitAndExit}
                className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 border border-green-300"
                title={timeAdjustmentMode ? "Accept time changes" : "Submit queue changes"}
              >
                Submit
              </button>
              <button
                onClick={timeAdjustmentMode ? handleCancelTimeAdjustment : handleResetQueue}
                className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 border border-yellow-300"
                title={timeAdjustmentMode ? "Cancel time changes" : "Reset all changes made to the queue"}
              >
                Reset
              </button>
              <button
                onClick={timeAdjustmentMode ? handleCancelTimeAdjustment : handleCancelQueue}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded hover:bg-gray-200 border border-gray-300"
                title={timeAdjustmentMode ? "Cancel time changes" : "Cancel editing and discard all changes"}
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
}

export default function WhiteboardEvents({
  events,
  selectedDate,
  teacherSchedules,
  viewAs = "admin",
}: WhiteboardEventsProps) {
  // State
  const [parentTimeAdjustmentMode, setParentTimeAdjustmentMode] = useState(false);
  const [parentGlobalTime, setParentGlobalTime] = useState<string | null>(null);
  const teachersInEditModeRef = useRef<Set<string>>(new Set());
  const [teachersNotInEditMode, setTeachersNotInEditMode] = useState<Set<string>>(new Set());
  const [noWindDropdownOpen, setNoWindDropdownOpen] = useState(false);
  const router = useRouter();

  // Computed values
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

  const earliestTime = useMemo(() => 
    TeacherEventsUtils.findEarliestTime(teacherEventGroups), 
    [teacherEventGroups]
  );

  // Handlers
  const handleParentTimeAdjustment = useCallback((minutesOffset: number) => {
    if (!parentGlobalTime) {
      if (earliestTime) {
        const newTime = minutesToTime(timeToMinutes(earliestTime) + minutesOffset);
        setParentGlobalTime(newTime);
      }
    } else {
      const newTime = minutesToTime(timeToMinutes(parentGlobalTime) + minutesOffset);
      setParentGlobalTime(newTime);
    }
  }, [parentGlobalTime, earliestTime]);

  const handleParentAcceptTimeAdjustment = useCallback(async () => {
    if (!parentGlobalTime) {
      setParentTimeAdjustmentMode(false);
      return;
    }

    const updatePromises: Promise<any>[] = [];

    teacherEventGroups.forEach((group) => {
      const teacherSchedule = group.teacherSchedule;
      if (teacherSchedule && teachersInEditModeRef.current.has(group.teacherId) && !teachersNotInEditMode.has(group.teacherId)) {
        const firstEventNode = teacherSchedule.getNodes().find(n => n.type === "event");
        if (firstEventNode) {
          const originalStartTime = timeToMinutes(firstEventNode.startTime);
          const targetStartTime = timeToMinutes(parentGlobalTime);
          const timeOffset = targetStartTime - originalStartTime;
          
          const success = teacherSchedule.shiftFirstEventAndReorganize(timeOffset);
          if (success) {
            const eventIdMap = TeacherEventsUtils.createEventIdMap(group.events);
            const databaseUpdates = teacherSchedule.getDatabaseUpdatesForShiftedSchedule(selectedDate, eventIdMap);
            if (databaseUpdates.length > 0) {
              updatePromises.push(reorganizeEventTimes(databaseUpdates));
            }
          }
        }
      }
    });

    if (updatePromises.length > 0) {
      const results = await Promise.all(updatePromises);
      const failures = results.filter((r) => !r.success);
      if (failures.length === 0) {
        console.log(`Parent time adjustment applied successfully. Updated ${results.length} teachers.`);
      } else {
        console.error("Some parent time updates failed:", failures);
      }
    }

    setParentTimeAdjustmentMode(false);
    setParentGlobalTime(null);
    teachersInEditModeRef.current.clear();
    setTeachersNotInEditMode(new Set());
  }, [parentGlobalTime, teacherEventGroups, selectedDate, teachersNotInEditMode]);

  const handleParentCancelTimeAdjustment = useCallback(() => {
    setParentTimeAdjustmentMode(false);
    setParentGlobalTime(null);
    teachersInEditModeRef.current.clear();
    setTeachersNotInEditMode(new Set());
  }, []);

  const handleTeacherEditModeChange = useCallback((teacherId: string, inEditMode: boolean) => {
    if (inEditMode) {
      teachersInEditModeRef.current.add(teacherId);
    } else {
      teachersInEditModeRef.current.delete(teacherId);
    }
  }, []);

  const handleParentFlagClick = useCallback(() => {
    setParentTimeAdjustmentMode(true);
    setParentGlobalTime(earliestTime);
    const allTeacherIds = teacherEventGroups.map(group => group.teacherId);
    teachersInEditModeRef.current = new Set(allTeacherIds);
  }, [earliestTime, teacherEventGroups]);

  const handleNoWind = useCallback(async () => {
    if (events.length === 0) return;
    
    try {
      let deletedCount = 0;
      for (const event of events) {
        console.log(`🗑️ Deleting event ${event.id} due to NO WIND`);
        const result = await deleteEvent(event.id);
        if (result.success) {
          deletedCount++;
        } else {
          console.error(`❌ Failed to delete event ${event.id}:`, result.error);
        }
      }
      
      console.log(`✅ ${deletedCount}/${events.length} events deleted due to NO WIND conditions`);
      setNoWindDropdownOpen(false);
      router.refresh();
    } catch (error) {
      console.error('❌ Error deleting events:', error);
    }
  }, [events, router]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (noWindDropdownOpen && !(event.target as Element)?.closest('.relative')) {
        setNoWindDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [noWindDropdownOpen]);

  return (
    <div className="space-y-6">
      {teacherEventGroups.length > 0 && (
        <div className="bg-card dark:bg-gray-800 border border-border dark:border-gray-700 rounded-lg p-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <HeadsetIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-medium text-foreground dark:text-white">
                  Global Schedule Control
                </h3>
                <ParentTimeAdjustmentFlag
                  parentTimeAdjustmentMode={parentTimeAdjustmentMode}
                  parentGlobalTime={parentGlobalTime}
                  earliestTime={earliestTime}
                  onParentTimeAdjustment={handleParentTimeAdjustment}
                  onParentFlagClick={handleParentFlagClick}
                />
              </div>
              <div className="flex items-center gap-2">
                {parentTimeAdjustmentMode && (
                  <>
                    <button
                      onClick={handleParentAcceptTimeAdjustment}
                      className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 border border-green-300"
                      title="Apply global time adjustment to all teachers"
                    >
                      Submit All
                    </button>
                    <button
                      onClick={handleParentCancelTimeAdjustment}
                      className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded hover:bg-gray-200 border border-gray-300"
                      title="Cancel global time adjustment"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* NO WIND Button - Emergency Cancel All Events - Separate row */}
            {events.length > 0 && (
              <div className="flex justify-end">
                <div className="relative">
                  <button
                    onClick={() => setNoWindDropdownOpen(!noWindDropdownOpen)}
                    className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200 border border-red-300 flex items-center gap-1"
                    title="Cancel all events due to unsafe wind conditions"
                  >
                    <Wind className="w-3 h-3" />
                    <span>NO WIND</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  
                  {noWindDropdownOpen && (
                    <div className="absolute right-0 top-full mt-1 bg-white border border-red-300 rounded shadow-lg p-3 z-10 w-64">
                      <div className="text-sm text-red-800 font-medium mb-2">
                        Delete all {events.length} events?
                      </div>
                      <div className="text-xs text-red-600 mb-3">
                        This will cancel all events for today due to unsafe wind conditions. This action cannot be undone.
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleNoWind}
                          className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded"
                        >
                          Delete All
                        </button>
                        <button
                          onClick={() => setNoWindDropdownOpen(false)}
                          className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {teacherEventGroups.length === 0 ? (
        <div className="p-8 bg-muted dark:bg-gray-800 rounded-lg text-center">
          <p className="text-muted-foreground dark:text-gray-400">
            No events found for this date
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {teacherEventGroups.map((group) => (
            <TeacherEventsGroup
              key={group.teacherId}
              teacherSchedule={group.teacherSchedule}
              events={group.events}
              selectedDate={selectedDate}
              viewAs={viewAs}
              parentTimeAdjustmentMode={parentTimeAdjustmentMode}
              parentGlobalTime={parentGlobalTime}
              onTeacherEditModeChange={handleTeacherEditModeChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}