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
  onRefresh: () => void;
}

export default function TeacherQueueEditor({
  scheduleNodes,
  originalScheduleNodes,
  events,
  teacherQueue,
  selectedDate: _selectedDate,
  onRemove,
  onRefresh,
}: TeacherQueueEditorProps) {
  // Detect gaps between consecutive events
  const detectGapBefore = (currentNode: any, index: number) => {
    if (index === 0) return { hasGap: false, gapDuration: 0 };

    const previousNode = scheduleNodes[index - 1];
    if (!previousNode || previousNode.type !== "event") {
      return { hasGap: false, gapDuration: 0 };
    }

    const previousEndTime = timeToMinutes(previousNode.startTime) + previousNode.duration;
    const currentStartTime = timeToMinutes(currentNode.startTime);
    const gapMinutes = currentStartTime - previousEndTime;

    return {
      hasGap: gapMinutes > 0,
      gapDuration: Math.max(0, gapMinutes),
    };
  };

  // Remove gaps by shifting events earlier
  const handleRemoveGap = (lessonId: string) => {
    teacherQueue.removeGap(lessonId);
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

        // Get lesson data from TeacherQueue
        const queueEvent = teacherQueue.getAllEvents().find(
          (e) => e.lessonId === node.eventData?.lessonId,
        );
        const studentList = queueEvent?.billboardClass.getStudentNames() || [];

        const originalNode = originalScheduleNodes.find(
          (n) => n.eventData?.lessonId === node.eventData?.lessonId,
        );
        const timeAdjustment = originalNode
          ? timeToMinutes(node.startTime) - timeToMinutes(originalNode.startTime)
          : 0;

        // Calculate position and timing info
        const eventNodes = scheduleNodes.filter((n) => n.type === "event");
        const eventNodeIndex = eventNodes.findIndex((en) => en.id === node.id);
        const isFirst = eventNodeIndex === 0;
        const isLast = eventNodeIndex === eventNodes.length - 1;
        
        const { hasGap, gapDuration } = detectGapBefore(node, index);
        
        if (!node.startTime) {
          throw new Error(`Missing startTime for lesson ${node.eventData?.lessonId}`);
        }
        
        const remainingMinutes = queueEvent?.billboardClass.getRemainingMinutes() || 0;

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

        // Check movement capabilities
        const lessonId = node.eventData?.lessonId || "";
        const canMoveEarlier = teacherQueue.canMoveEarlier(lessonId);
        const canMoveLater = teacherQueue.canMoveLater(lessonId);

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
              onRemoveGap={handleRemoveGap}
            />
          </div>
        );
      })}
    </>
  );
}