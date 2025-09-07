'use client';

import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, X, AlertTriangle, ArrowUp, ArrowDown, MapPin } from 'lucide-react';
import { HelmetIcon } from '@/svgs';
import { Duration } from '@/components/formatters/Duration';
import { DateTime, formatTime } from '@/components/formatters/DateTime';
import { type EventNode } from '@/backend/TeacherQueue';
import { addMinutes, format } from 'date-fns';

interface TeacherLessonQueueCardProps {
  eventNode: EventNode;
  location: string;
  isFirst: boolean;
  isLast: boolean;
  canMoveEarlier: boolean;
  canMoveLater?: boolean;
  onRemove: (lessonId: string) => void;
  onAdjustDuration: (lessonId: string, increment: boolean) => void;
  onAdjustTime: (lessonId: string, increment: boolean) => void;
  onMoveUp: (lessonId: string) => void;
  onMoveDown: (lessonId: string) => void;
  onRemoveGap?: (lessonId: string) => void;
  onSubmit?: (lessonId: string) => void;
}

export default function TeacherLessonQueueCard({
  eventNode,
  location,
  isFirst,
  isLast,
  canMoveEarlier,
  canMoveLater = true,
  onRemove,
  onAdjustDuration,
  onAdjustTime,
  onMoveUp,
  onMoveDown,
  onRemoveGap
}: TeacherLessonQueueCardProps) {
  // --- Logic at the top ---
  const lessonId = eventNode.lessonId;
  const duration = eventNode.eventData.duration;
  const scheduledDateTime = eventNode.eventData.date;
  const students = eventNode.billboardClass.getStudentNames();
  const remainingMinutes = eventNode.billboardClass.getRemainingMinutes();
  const hasGap = eventNode.hasGap;
  const timeAdjustment = eventNode.timeAdjustment;

  const endTime = scheduledDateTime ? formatTime(addMinutes(new Date(scheduledDateTime), duration).toISOString()) : '';
  const remaining = remainingMinutes - duration;
  const studentNames = students.join(', ');
  const gapDuration = 0; // Remove this logic for simplicity
  
  // Check if this is a pending event (no event ID yet)
  const isPendingEvent = !eventNode.eventData.id;

  // --- Render ---
  return (
    <div
      className={`p-4 rounded-lg border max-w-[420px] min-w-[240] ${
        isPendingEvent
          ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
          : hasGap && !isFirst
          ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
          : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
        }`}
    >
      {/* Header: Helmets, names, controls */}
      <div className="flex items-center justify-between mb-3 w-full">
        <div className="flex gap-1 flex-shrink-0">
          {students.map((_, i) => (
            <HelmetIcon key={i} className="w-4 h-4 text-yellow-500" />
          ))}
        </div>
        <div className="flex-1 mx-2 flex flex-wrap gap-1 items-center">
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {studentNames}
          </span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {!isFirst && (
            <button
              onClick={() => onMoveUp(lessonId)}
              className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
              title="Move up in queue"
            >
              <ArrowUp className="w-3 h-3" />
            </button>
          )}
          {!isLast && (
            <button
              onClick={() => onMoveDown(lessonId)}
              className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
              title="Move down in queue"
            >
              <ArrowDown className="w-3 h-3" />
            </button>
          )}
          <button
            onClick={() => onRemove(lessonId)}
            className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
            title="Remove from queue"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Time and Duration Controls - Side by Side */}
      <div className="flex gap-4">
        {/* Start Time (flex-grow) */}
        <div className="flex-grow min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center mb-2 w-full justify-between">
              <span className="text-xs text-gray-600 dark:text-gray-400">Start</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onAdjustTime(lessonId, false)}
                  disabled={!canMoveEarlier}
                  className="p-1 border border-gray-300 dark:border-gray-500 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title={canMoveEarlier ? '30 minutes earlier' : 'Cannot move earlier - would overlap'}
                >
                  <ChevronLeft className="w-3 h-3" />
                </button>
                <button
                  onClick={() => onAdjustTime(lessonId, true)}
                  disabled={!canMoveLater}
                  className="p-1 border border-gray-300 dark:border-gray-500 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title={canMoveLater ? "30 minutes later" : "Cannot move later - would exceed 23:00"}
                >
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 justify-end">
            {timeAdjustment !== 0 && (
              <div className="text-xs text-blue-600 dark:text-blue-400 mr-2">
                {timeAdjustment > 0 && '+'}
                <Duration minutes={timeAdjustment} />
              </div>
            )}
            <div className="flex flex-col text-center">
              {scheduledDateTime && (
                <div className="text-sm font-medium text-green-600 dark:text-green-400">
                  {formatTime(scheduledDateTime)}
                </div>
              )}
              {endTime && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {endTime}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Separator */}
        <div className="w-px bg-gray-300 dark:bg-gray-500 my-1"></div>

        {/* Duration: up arrow, value, down arrow only */}
        <div className="flex gap-2 justify-center w-16 min-w-[4rem]">
          {/* <div>time icon</div> */}
          <div className="flex flex-col">

          <button
            onClick={() => onAdjustDuration(lessonId, true)}
            disabled={duration >= remainingMinutes}
            className="p-1 border border-gray-300 dark:border-gray-500 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="30 minutes more"
          >
            <ChevronUp className="w-3 h-3" />
          </button>
          <div className="text-sm font-medium text-gray-900 dark:text-white my-1">
            +<Duration minutes={duration} />
          </div>
          <button
            onClick={() => onAdjustDuration(lessonId, false)}
            disabled={duration <= 30}
            className="p-1 border border-gray-300 dark:border-gray-500 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="30 minutes less"
          >
            <ChevronDown className="w-3 h-3" />
          </button>
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
        <span><Duration minutes={remaining} /> remaining</span>
        {isPendingEvent && (
          <>
            <span>•</span>
            <span className="text-yellow-600 dark:text-yellow-400 font-medium">PENDING</span>
          </>
        )}
      </div>

      {/* Gap warning - only show if not first and has gap */}
      {!isFirst && hasGap && (
        <button
          onClick={() => onRemoveGap?.(lessonId)}
          className="flex items-center justify-center gap-1 mt-2 text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 p-2 rounded border border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-900/30 hover:border-orange-300 dark:hover:border-orange-700 transition-colors cursor-pointer w-full"
          title="Click to remove gap"
        >
          <AlertTriangle className="w-3 h-3 flex-shrink-0" />
          <Duration minutes={gapDuration} />
          <span>gap</span>
        </button>
      )}
    </div>
  );
}
