'use client';

import { ChevronUp, ChevronDown, X, AlertTriangle, ArrowUp, ArrowDown, MapPin } from 'lucide-react';
import { HelmetIcon } from '@/svgs';
import { addMinutesToTime } from '@/components/formatters/TimeZone';
import { Duration } from '@/components/formatters/Duration';
import { type QueuedLesson } from '@/backend/TeacherSchedule';

interface TeacherLessonQueueCardProps {
  queuedLesson: QueuedLesson;
  location: string; // Add location prop
  isFirst: boolean;
  isLast: boolean;
  canMoveEarlier: boolean; // Can't overlap with previous lesson
  onRemove: (lessonId: string) => void;
  onAdjustDuration: (lessonId: string, increment: boolean) => void;
  onAdjustTime: (lessonId: string, increment: boolean) => void;
  onMoveUp: (lessonId: string) => void;
  onMoveDown: (lessonId: string) => void;
}

export default function TeacherLessonQueueCard({
  queuedLesson,
  location,
  isFirst,
  isLast,
  canMoveEarlier,
  onRemove,
  onAdjustDuration,
  onAdjustTime,
  onMoveUp,
  onMoveDown
}: TeacherLessonQueueCardProps) {
  return (
    <div className={`p-4 rounded-lg border ${
      queuedLesson.hasGap && !isFirst
        ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800' 
        : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
    }`}>
      {/* Header: Students with helmets and controls */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {queuedLesson.students.map((_, i) => (
              <HelmetIcon key={i} className="w-4 h-4 text-yellow-500" />
            ))}
          </div>
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {queuedLesson.students.join(', ')}
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {/* Reorder buttons */}
          {!isFirst && (
            <button
              onClick={() => onMoveUp(queuedLesson.lessonId)}
              className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
              title="Move up in queue"
            >
              <ArrowUp className="w-3 h-3" />
            </button>
          )}
          
          {!isLast && (
            <button
              onClick={() => onMoveDown(queuedLesson.lessonId)}
              className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
              title="Move down in queue"
            >
              <ArrowDown className="w-3 h-3" />
            </button>
          )}
          
          {/* Remove button */}
          <button
            onClick={() => onRemove(queuedLesson.lessonId)}
            className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
            title="Remove from queue"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Time and Duration Controls - Side by Side */}
      <div className="flex gap-4">
        {/* Start Time */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-gray-600 dark:text-gray-400">Start</div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onAdjustTime(queuedLesson.lessonId, false)}
                disabled={!canMoveEarlier}
                className="p-1 border border-gray-300 dark:border-gray-500 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={canMoveEarlier ? "30 minutes earlier" : "Cannot move earlier - would overlap"}
              >
                <ChevronDown className="w-3 h-3" />
              </button>
              
              <button
                onClick={() => onAdjustTime(queuedLesson.lessonId, true)}
                className="p-1 border border-gray-300 dark:border-gray-500 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title="30 minutes later"
              >
                <ChevronUp className="w-3 h-3" />
              </button>
            </div>
          </div>
          
          <div className="text-center">
            {queuedLesson.scheduledStartTime && (
              <div className="text-sm font-medium text-green-600 dark:text-green-400">
                {queuedLesson.scheduledStartTime}
              </div>
            )}
            {/* Show time adjustment only if it exists and is not 0 */}
            {queuedLesson.timeAdjustment !== undefined && queuedLesson.timeAdjustment !== 0 && (
              <div className="text-xs text-blue-600 dark:text-blue-400">
                {queuedLesson.timeAdjustment > 0 ? '+' : ''}{queuedLesson.timeAdjustment}m
              </div>
            )}
          </div>
        </div>

        {/* Separator */}
        <div className="w-px bg-gray-300 dark:bg-gray-500 my-1"></div>

        {/* Duration */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-gray-600 dark:text-gray-400">Duration</div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onAdjustDuration(queuedLesson.lessonId, false)}
                disabled={queuedLesson.duration <= 30}
                className="p-1 border border-gray-300 dark:border-gray-500 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="30 minutes less"
              >
                <ChevronDown className="w-3 h-3" />
              </button>
              
              <button
                onClick={() => onAdjustDuration(queuedLesson.lessonId, true)}
                disabled={queuedLesson.duration >= queuedLesson.remainingMinutes}
                className="p-1 border border-gray-300 dark:border-gray-500 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="30 minutes more"
              >
                <ChevronUp className="w-3 h-3" />
              </button>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              +<Duration minutes={queuedLesson.duration} />
            </div>
            {queuedLesson.scheduledStartTime && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {addMinutesToTime(queuedLesson.scheduledStartTime, queuedLesson.duration)}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Location and remaining time info */}
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center flex items-center justify-center gap-2">
        <div className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          <span>{location}</span>
        </div>
        <span>•</span>
        <span><Duration minutes={queuedLesson.remainingMinutes - queuedLesson.duration} /> remaining</span>
      </div>

      {/* Gap warning - only show if not first and has gap */}
      {!isFirst && queuedLesson.hasGap && (
        <div className="flex items-center justify-center gap-1 mt-2 text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 p-2 rounded border border-orange-200 dark:border-orange-800">
          <AlertTriangle className="w-3 h-3 flex-shrink-0" />
          <span>Gap from previous lesson</span>
        </div>
      )}
    </div>
  );
}
