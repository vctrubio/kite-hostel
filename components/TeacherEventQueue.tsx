'use client';

import TeacherLessonQueueCard from '@/components/cards/LessonQueueCard';
import { extractStudentNames } from '@/backend/WhiteboardClass';
import { timeToMinutes, createUTCDateTime, toUTCString } from '@/components/formatters/TimeZone';

interface TeacherEventQueueProps {
  scheduleNodes: any[];
  originalScheduleNodes: any[];
  events: any[];
  selectedDate: string;
  onRemove: (lessonId: string) => void;
  onAdjustDuration: (lessonId: string, increment: boolean) => void;
  onAdjustTime: (lessonId: string, increment: boolean) => void;
  onMove: (lessonId: string, direction: 'up' | 'down') => void;
}

export default function TeacherEventQueue({ 
  scheduleNodes, 
  originalScheduleNodes,
  events, 
  selectedDate,
  onRemove, 
  onAdjustDuration, 
  onAdjustTime, 
  onMove 
}: TeacherEventQueueProps) {
  return (
    <>
      {scheduleNodes.map((node, index) => {
        if (node.type === 'gap') return null;

        const eventData = events.find(e => e.lesson?.id === node.eventData?.lessonId);
        if (!eventData) return null;

        const studentList = eventData.booking ? extractStudentNames(eventData.booking).split(',').map(s => s.trim()).filter(s => s) : [];
        
        const originalNode = originalScheduleNodes.find(n => n.eventData?.lessonId === node.eventData?.lessonId);
        const timeAdjustment = originalNode ? timeToMinutes(node.startTime) - timeToMinutes(originalNode.startTime) : 0;

        const previousNode = index > 0 ? scheduleNodes[index - 1] : null;
        const hasGapBefore = previousNode?.type === 'gap';

        // Convert UTC time string to local time for display
        const utcDateString = toUTCString(createUTCDateTime(selectedDate, node.startTime));
        const localTime = new Date(utcDateString).toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });

        const queuedLesson = {
          lessonId: eventData.lesson.id,
          students: studentList,
          duration: node.duration,
          remainingMinutes: 240, // Placeholder
          scheduledStartTime: localTime,
          hasGap: hasGapBefore,
          timeAdjustment: timeAdjustment,
        };

        const eventNodes = scheduleNodes.filter(n => n.type === 'event');
        const eventNodeIndex = eventNodes.findIndex(en => en.id === node.id);
        const isFirst = eventNodeIndex === 0;
        const isLast = eventNodeIndex === eventNodes.length - 1;

        return (
          <div key={`queue-${node.id}`}>
            <TeacherLessonQueueCard
              queuedLesson={queuedLesson}
              location={eventData.location || 'No location'}
              isFirst={isFirst}
              isLast={isLast}
              canMoveEarlier={true}
              onRemove={onRemove}
              onAdjustDuration={onAdjustDuration}
              onAdjustTime={onAdjustTime}
              onMoveUp={(lessonId) => onMove(lessonId, 'up')}
              onMoveDown={(lessonId) => onMove(lessonId, 'down')}
            />
          </div>
        );
      })}
    </>
  );
}
