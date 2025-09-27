"use client";

import TeacherLessonQueueCard from "@/components/cards/LessonQueueCard";
import {
  timeToMinutes,
} from "@/components/formatters/TimeZone";
import { TeacherQueue } from "@/backend/TeacherQueue";

interface TeacherQueueEditorProps {
  scheduleNodes: any[];
  originalScheduleNodes: any[];
  events: any[];
  teacherQueue: TeacherQueue;
  selectedDate: string;
  onRemove: (lessonId: string) => Promise<void>;
  onAdjustDuration: (lessonId: string, increment: boolean) => void;
  onAdjustTime: (lessonId: string, increment: boolean) => void;
  onMove: (lessonId: string, direction: "up" | "down") => void;
  onRefresh: () => void;
}

export default function TeacherQueueEditor({
  scheduleNodes,
  originalScheduleNodes,
  events,
  teacherQueue,
  selectedDate,
  onRemove,
  onAdjustDuration,
  onAdjustTime,
  onMove,
  onRefresh,
}: TeacherQueueEditorProps) {
  // Simple gap detection for TeacherQueue - check if there's time between events
  const detectGapBefore = (currentNode: any, index: number): { hasGap: boolean; gapDuration: number } => {
    if (index === 0) {
      return { hasGap: false, gapDuration: 0 };
    }

    const previousNode = scheduleNodes[index - 1];
    if (!previousNode || previousNode.type !== "event") {
      return { hasGap: false, gapDuration: 0 };
    }

    const previousEndTime = timeToMinutes(previousNode.startTime) + previousNode.duration;
    const currentStartTime = timeToMinutes(currentNode.startTime);
    const gapMinutes = currentStartTime - previousEndTime;

    return {
      hasGap: gapMinutes > 0,
      gapDuration: gapMinutes > 0 ? gapMinutes : 0,
    };
  };

  // Handle gap removal for TeacherQueue
  const handleRemoveGapForScheduleNode = (lessonId: string) => {
    // Use TeacherQueue's gap removal method instead of manual adjustments
    teacherQueue.removeGap(lessonId);
    // Trigger refresh to update the UI
    onRefresh();
  };

  return (
    <>
      {scheduleNodes.map((node, index) => {
        if (node.type === "gap") return null;

        const eventData = events.find(
          (e) => e.lesson?.id === node.eventData?.lessonId,
        );
        if (!eventData) return null;

        // Get student names from TeacherQueue events
        const queueEvent = teacherQueue.getAllEvents().find(
          (e) => e.lessonId === node.eventData?.lessonId,
        );
        const studentList = queueEvent ? queueEvent.billboardClass.getStudentNames() : [];

        const originalNode = originalScheduleNodes.find(
          (n) => n.eventData?.lessonId === node.eventData?.lessonId,
        );
        const timeAdjustment = originalNode
          ? timeToMinutes(node.startTime) - timeToMinutes(originalNode.startTime)
          : 0;

        // Calculate position info
        const eventNodes = scheduleNodes.filter((n) => n.type === "event");
        const eventNodeIndex = eventNodes.findIndex((en) => en.id === node.id);
        const isFirst = eventNodeIndex === 0;

        // Gap detection using our simplified logic
        const { hasGap, gapDuration } = detectGapBefore(node, index);

        // Create local datetime without timezone conversion
        if (!node.startTime) {
          throw new Error(`Missing startTime for lesson ${node.eventData?.lessonId}`);
        }
        
        // Get time in minutes for bounds checking
        const currentTimeMinutes = timeToMinutes(node.startTime);

        // Get remaining minutes from the BillboardClass instance
        const remainingMinutes = queueEvent ? queueEvent.billboardClass.getRemainingMinutes() : 0;

        const queuedLesson = {
          lessonId: node.eventData?.lessonId || "",
          students: studentList,
          duration: node.duration,
          remainingMinutes: remainingMinutes,
          scheduledDateTime: node.startTime, // Just pass the time string
          hasGap: hasGap,
          timeAdjustment: timeAdjustment,
          gapDuration: gapDuration,
        };

        const isLast = eventNodeIndex === eventNodes.length - 1;

        // Use TeacherQueue methods for move validation
        const canMoveEarlier = teacherQueue.canMoveEarlier(node.eventData?.lessonId || "");
        const canMoveLater = teacherQueue.canMoveLater(node.eventData?.lessonId || "");

        return (
          <div key={`queue-${node.id}`}>
            <TeacherLessonQueueCard
              queuedLesson={queuedLesson}
              location={eventData.location || "No location"}
              isFirst={isFirst}
              isLast={isLast}
              canMoveEarlier={canMoveEarlier}
              canMoveLater={canMoveLater}
              onRemove={async (lessonId) => {
                await onRemove(lessonId);
                onRefresh();
              }}
              onAdjustDuration={(lessonId, increment) => {
                teacherQueue.adjustLessonDuration(lessonId, increment);
                onRefresh();
              }}
              onAdjustTime={(lessonId, increment) => {
                teacherQueue.adjustLessonTime(lessonId, increment);
                onRefresh();
              }}
              onMoveUp={(lessonId) => {
                teacherQueue.moveLessonUp(lessonId);
                onRefresh();
              }}
              onMoveDown={(lessonId) => {
                teacherQueue.moveLessonDown(lessonId);
                onRefresh();
              }}
              onRemoveGap={handleRemoveGapForScheduleNode}
            />
          </div>
        );
      })}
    </>
  );
}