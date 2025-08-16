import React from 'react';
import { ChevronLeft, ChevronRight, Check, X } from 'lucide-react';

interface TimeAdjustmentControlsProps {
  firstEventTime: string | null;
  proposedTimeOffset: number;
  onAdjust: (offset: number) => void;
  onAccept: () => void;
  onCancel: () => void;
}

export default function TimeAdjustmentControls({
  firstEventTime,
  proposedTimeOffset,
  onAdjust,
  onAccept,
  onCancel,
}: TimeAdjustmentControlsProps) {
  // Import your minutesToTime and timeToMinutes utils as needed
  const minutesToTime = (m: number) => {
    const h = Math.floor(m / 60).toString().padStart(2, '0');
    const min = (m % 60).toString().padStart(2, '0');
    return `${h}:${min}`;
  };
  const timeToMinutes = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onAdjust(-30)}
        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
        title="Move back 30 minutes"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <span className="min-w-[60px] text-center font-mono">
        {firstEventTime
          ? minutesToTime(timeToMinutes(firstEventTime) + proposedTimeOffset)
          : 'No events'}
        {proposedTimeOffset !== 0 && (
          <span className="text-orange-600 dark:text-orange-400 ml-1">
            ({proposedTimeOffset > 0 ? '+' : ''}
            {proposedTimeOffset}m)
          </span>
        )}
      </span>
      <button
        onClick={() => onAdjust(30)}
        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
        title="Move forward 30 minutes"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
      <button
        onClick={onAccept}
        className="p-1 rounded bg-green-100 hover:bg-green-200 text-green-700 dark:bg-green-900 dark:hover:bg-green-800 dark:text-green-300"
        title="Accept changes"
      >
        <Check className="w-4 h-4" />
      </button>
      <button
        onClick={onCancel}
        className="p-1 rounded bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900 dark:hover:bg-red-800 dark:text-red-300"
        title="Cancel changes"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
