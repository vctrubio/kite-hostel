'use client';

import TeacherLessonQueueCard from '@/components/cards/LessonQueueCard';
import { extractStudentNames } from '@/backend/WhiteboardClass';
import { timeToMinutes, createUTCDateTime } from '@/components/formatters/TimeZone';

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

        // Check time bounds and create safe datetime
        const currentTimeMinutes = timeToMinutes(node.startTime);
        let localDateTimeString: string;
        if (currentTimeMinutes >= 360 && currentTimeMinutes <= 1380) {
          localDateTimeString = createUTCDateTime(selectedDate, node.startTime).toISOString();
        } else {
          // Fallback to a safe time if invalid
          localDateTimeString = createUTCDateTime(selectedDate, '09:00').toISOString();
        }

        const queuedLesson = {
          lessonId: eventData.lesson.id,
          students: studentList,
          duration: node.duration,
          remainingMinutes: 240, // Placeholder
          scheduledDateTime: localDateTimeString, // Pass the full ISO string
          hasGap: hasGapBefore,
          timeAdjustment: timeAdjustment,
        };

        const eventNodes = scheduleNodes.filter(n => n.type === 'event');
        const eventNodeIndex = eventNodes.findIndex(en => en.id === node.id);
        const isFirst = eventNodeIndex === 0;
        const isLast = eventNodeIndex === eventNodes.length - 1;

        // Check if can move earlier (conflict check)
        let canMoveEarlier = true;
        if (!isFirst) {
          const previousEventNode = eventNodes[eventNodeIndex - 1];
          if (previousEventNode) {
            const previousEventEndTime = timeToMinutes(previousEventNode.startTime) + previousEventNode.duration;
            const newCurrentEventStartTime = timeToMinutes(node.startTime) - 30;
            if (newCurrentEventStartTime < previousEventEndTime) {
              canMoveEarlier = false;
            }
          }
        }
        
        // Also check time bounds for moving earlier
        if (currentTimeMinutes <= 360) {
          canMoveEarlier = false;
        }
        
        // Check if can move later (time bounds check)
        const canMoveLater = currentTimeMinutes < 1380;

        return (
          <div key={`queue-${node.id}`}>
            <TeacherLessonQueueCard
              queuedLesson={queuedLesson}
              location={eventData.location || 'No location'}
              isFirst={isFirst}
              isLast={isLast}
              canMoveEarlier={canMoveEarlier}
              canMoveLater={canMoveLater}
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
