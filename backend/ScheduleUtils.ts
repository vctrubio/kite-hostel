/**
 * ScheduleUtils - Reusable utilities for schedule management
 */

import { timeToMinutes, minutesToTime } from '@/components/formatters/TimeZone';

export interface ScheduleItem {
  id: string;
  startTime: string; // HH:MM format
  duration: number; // minutes
  type?: 'event' | 'gap';
}

export interface ScheduleGap {
  id: string;
  type: 'gap';
  startTime: string;
  duration: number;
  next: null;
}

/**
 * Detect gaps between scheduled items
 * @param items - Array of schedule items sorted by start time
 * @returns Array of items with gaps inserted between them
 */
export function detectScheduleGaps<T extends ScheduleItem>(items: T[]): (T | ScheduleGap)[] {
  if (items.length <= 1) {
    return [...items];
  }

  // Sort items by start time to ensure proper order
  const sortedItems = [...items].sort((a, b) => 
    timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  );

  const itemsWithGaps: (T | ScheduleGap)[] = [];

  for (let i = 0; i < sortedItems.length; i++) {
    const currentItem = sortedItems[i];
    itemsWithGaps.push(currentItem);

    // Check if there's a gap before the next item
    if (i < sortedItems.length - 1) {
      const nextItem = sortedItems[i + 1];
      const currentEndTime = timeToMinutes(currentItem.startTime) + currentItem.duration;
      const nextStartTime = timeToMinutes(nextItem.startTime);

      // If there's a gap between current item end and next item start
      if (nextStartTime > currentEndTime) {
        const gapDuration = nextStartTime - currentEndTime;
        const gapStartTime = minutesToTime(currentEndTime);

        // Create a gap item
        const gapItem: ScheduleGap = {
          id: `gap_${currentItem.id}_${nextItem.id}`,
          type: 'gap',
          startTime: gapStartTime,
          duration: gapDuration,
          next: null
        };

        itemsWithGaps.push(gapItem);
      }
    }
  }

  return itemsWithGaps;
}

/**
 * Check if there are any gaps in a schedule
 * @param items - Array of schedule items
 * @param minimumGapMinutes - Minimum gap duration to consider (default: 15 minutes)
 * @returns True if gaps exist that are larger than minimum
 */
export function hasScheduleGaps<T extends ScheduleItem>(
  items: T[], 
  minimumGapMinutes: number = 15
): boolean {
  if (items.length <= 1) {
    return false;
  }

  const sortedItems = [...items].sort((a, b) => 
    timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  );

  for (let i = 0; i < sortedItems.length - 1; i++) {
    const current = sortedItems[i];
    const next = sortedItems[i + 1];

    const currentEnd = timeToMinutes(current.startTime) + current.duration;
    const nextStart = timeToMinutes(next.startTime);
    const gap = nextStart - currentEnd;

    if (gap >= minimumGapMinutes) {
      return true;
    }
  }

  return false;
}

/**
 * Calculate total gap time in a schedule
 * @param items - Array of schedule items
 * @returns Total gap duration in minutes
 */
export function calculateTotalGapTime<T extends ScheduleItem>(items: T[]): number {
  if (items.length <= 1) {
    return 0;
  }

  const sortedItems = [...items].sort((a, b) => 
    timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  );

  let totalGapTime = 0;

  for (let i = 0; i < sortedItems.length - 1; i++) {
    const current = sortedItems[i];
    const next = sortedItems[i + 1];

    const currentEnd = timeToMinutes(current.startTime) + current.duration;
    const nextStart = timeToMinutes(next.startTime);
    const gap = nextStart - currentEnd;

    if (gap > 0) {
      totalGapTime += gap;
    }
  }

  return totalGapTime;
}

/**
 * Compact a schedule by removing gaps
 * @param items - Array of schedule items to compact
 * @returns Array of items with gaps removed (items moved earlier)
 */
export function compactSchedule<T extends ScheduleItem>(items: T[]): T[] {
  if (items.length <= 1) {
    return [...items];
  }

  const sortedItems = [...items].sort((a, b) => 
    timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  );

  const compactedItems = [...sortedItems];

  // Start with the first item time - keep it as anchor
  let currentEndTime = timeToMinutes(compactedItems[0].startTime) + compactedItems[0].duration;

  // Compact all items starting from the second one
  for (let i = 1; i < compactedItems.length; i++) {
    const currentItem = compactedItems[i];

    // Set current item to start right after previous one ends (no gap)
    currentItem.startTime = minutesToTime(currentEndTime);

    // Update end time for next iteration
    currentEndTime = currentEndTime + currentItem.duration;
  }

  return compactedItems;
}

/**
 * Find the next available time slot after all scheduled items
 * @param items - Array of schedule items
 * @param requestedDuration - Duration needed for the new slot
 * @param defaultStartTime - Default start time if no items exist (default: '10:00')
 * @returns Available slot information
 */
export function findNextAvailableSlot<T extends ScheduleItem>(
  items: T[], 
  requestedDuration: number,
  defaultStartTime: string = '10:00'
): { startTime: string; endTime: string; duration: number } {
  // If no items scheduled, suggest starting at default time
  if (items.length === 0) {
    const startMinutes = timeToMinutes(defaultStartTime);
    return {
      startTime: defaultStartTime,
      endTime: minutesToTime(startMinutes + requestedDuration),
      duration: requestedDuration
    };
  }

  // Find the latest end time among all items
  let latestEndTime = 0;
  
  items.forEach(item => {
    const itemStartMinutes = timeToMinutes(item.startTime);
    const itemEndMinutes = itemStartMinutes + item.duration;
    
    if (itemEndMinutes > latestEndTime) {
      latestEndTime = itemEndMinutes;
    }
  });

  return {
    startTime: minutesToTime(latestEndTime),
    endTime: minutesToTime(latestEndTime + requestedDuration),
    duration: requestedDuration
  };
}

/**
 * Compact a schedule by removing gaps, preserving the order of items.
 * The first item's start time is used as an anchor.
 * @param items - Array of schedule items to compact, in the desired order.
 * @returns A new array of items with gaps removed (items moved earlier).
 */
export function compactSchedulePreservingOrder<T extends ScheduleItem>(
  items: T[],
  anchorTime?: string,
): T[] {
  if (items.length === 0) {
    return [];
  }

  const compactedItems = items.map((item) => ({ ...item }));

  // Use anchorTime if provided, otherwise use the first item's time.
  let currentTimeMinutes = anchorTime
    ? timeToMinutes(anchorTime)
    : timeToMinutes(compactedItems[0].startTime);

  for (let i = 0; i < compactedItems.length; i++) {
    compactedItems[i].startTime = minutesToTime(currentTimeMinutes);
    currentTimeMinutes += compactedItems[i].duration;
  }

  return compactedItems;
}