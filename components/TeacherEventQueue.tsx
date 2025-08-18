'use client';

import TeacherLessonQueueCard from '@/components/cards/LessonQueueCard';
import { extractStudentNames } from '@/backend/WhiteboardClass';
import { timeToMinutes, createUTCDateTime } from '@/components/formatters/TimeZone';

interface TeacherEventQueueProps {
  scheduleNodes: any[];
  originalScheduleNodes: any[];
  events: any[];
  teacherSchedule?: any; // Add TeacherSchedule for gap handling
  selectedDate: string;
  onRemove: (lessonId: string) => void;
  onAdjustDuration: (lessonId: string, increment: boolean) => void;
  onAdjustTime: (lessonId: string, increment: boolean) => void;
  onMove: (lessonId: string, direction: 'up' | 'down') => void;
  onRemoveGap?: (lessonId: string) => void;
}

export default function TeacherEventQueue({ 
  scheduleNodes, 
  originalScheduleNodes,
  events, 
  teacherSchedule,
  selectedDate,
  onRemove, 
  onAdjustDuration, 
  onAdjustTime, 
  onMove,
  onRemoveGap
}: TeacherEventQueueProps) {
  
  // Handle gap removal using detected gap duration
  const handleRemoveGapForScheduleNode = (lessonId: string) => {
    if (!teacherSchedule) return;
    
    // Use the centralized gap analysis to get the exact gap duration
    const nodesWithGaps = teacherSchedule.analyzeScheduleGaps(scheduleNodes);
    const nodeWithGap = nodesWithGaps.find(n => n.eventData?.lessonId === lessonId);
    
    if (!nodeWithGap || !nodeWithGap.hasGap || !nodeWithGap.gapDuration) return;
    
    // Calculate how many 30-minute decrements we need to close the gap
    const gapMinutes = nodeWithGap.gapDuration;
    const thirtyMinuteDecrements = Math.ceil(gapMinutes / 30);
    
    // Apply the adjustments by moving the lesson earlier
    for (let i = 0; i < thirtyMinuteDecrements; i++) {
      onAdjustTime(lessonId, false); // false = move earlier (-30 minutes)
    }
  };
  return (
    <>
      {scheduleNodes.map((node, index) => {
        if (node.type === 'gap') return null;

        const eventData = events.find(e => e.lesson?.id === node.eventData?.lessonId);
        if (!eventData) return null;

        const studentList = eventData.booking ? extractStudentNames(eventData.booking).split(',').map(s => s.trim()).filter(s => s) : [];
        
        const originalNode = originalScheduleNodes.find(n => n.eventData?.lessonId === node.eventData?.lessonId);
        const timeAdjustment = originalNode ? timeToMinutes(node.startTime) - timeToMinutes(originalNode.startTime) : 0;

        // Calculate position info first
        const eventNodes = scheduleNodes.filter(n => n.type === 'event');
        const eventNodeIndex = eventNodes.findIndex(en => en.id === node.id);
        const isFirst = eventNodeIndex === 0;

        // Use TeacherSchedule method for proper gap detection
        let hasGapBefore = false;
        let gapDuration = 0;
        
        if (teacherSchedule) {
          // Use the centralized gap analysis method
          const nodesWithGaps = teacherSchedule.analyzeScheduleGaps(scheduleNodes);
          const nodeWithGap = nodesWithGaps.find(n => n.id === node.id);
          
          if (nodeWithGap) {
            hasGapBefore = nodeWithGap.hasGap || false;
            gapDuration = nodeWithGap.gapDuration || 0;
          }
        }

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
          gapDuration: gapDuration, // Add gap duration for display
        };

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
              onRemoveGap={handleRemoveGapForScheduleNode}
            />
          </div>
        );
      })}
    </>
  );
}
