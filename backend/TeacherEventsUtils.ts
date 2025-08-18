/**
 * TeacherEventsUtils - Business logic for teacher event management
 * Following Rails MVC pattern: Keep complex logic in backend utilities
 */

import { TeacherSchedule, ScheduleNode } from './TeacherSchedule';
import { type ReorganizationOption } from './types';
import { timeToMinutes, minutesToTime, createUTCDateTime, toUTCString } from '@/components/formatters/TimeZone';
import { compactSchedulePreservingOrder } from './ScheduleUtils';
import { reorganizeEventTimes } from '@/actions/kite-actions';
import { updateEvent, deleteEvent } from '@/actions/event-actions';

export interface TeacherEventState {
  scheduleNodes: ScheduleNode[];
  editableScheduleNodes: ScheduleNode[];
  globalTimeOffset: number;
  timeAdjustmentMode: boolean;
  viewMode: "event" | "queue";
  pendingReorganizations: Map<string, ReorganizationOption[]>;
}

export interface ParentControlState {
  parentTimeAdjustmentMode: boolean;
  parentGlobalTime: string | null;
  teachersNotInEditMode: Set<string>;
}

export interface TeacherEventGroupData {
  teacherId: string;
  teacherSchedule: TeacherSchedule;
  events: any[];
}

export class TeacherEventsUtils {
  
  /**
   * Calculate time offset needed to align teacher to parent time
   */
  static calculateTimeOffset(
    teacherSchedule: TeacherSchedule,
    parentGlobalTime: string
  ): number {
    const firstEventNode = teacherSchedule.getNodes().find(n => n.type === "event");
    if (!firstEventNode) return 0;
    
    const originalStartTime = timeToMinutes(firstEventNode.startTime);
    const targetStartTime = timeToMinutes(parentGlobalTime);
    return targetStartTime - originalStartTime;
  }

  /**
   * Apply parent time to teacher schedule nodes
   */
  static applyParentTimeToSchedule(
    scheduleNodes: ScheduleNode[],
    parentGlobalTime: string
  ): ScheduleNode[] {
    const firstEventNode = scheduleNodes.find(node => node.type === "event");
    if (!firstEventNode) return scheduleNodes;

    const originalStartTime = timeToMinutes(firstEventNode.startTime);
    const targetStartTime = timeToMinutes(parentGlobalTime);
    const timeOffset = targetStartTime - originalStartTime;

    return scheduleNodes.map((node) => {
      if (node.type === "event") {
        const originalTime = timeToMinutes(node.startTime);
        const newTime = originalTime + timeOffset;
        return {
          ...node,
          startTime: minutesToTime(Math.max(0, newTime)),
        };
      }
      return node;
    });
  }

  /**
   * Handle duration adjustment for a lesson
   */
  static adjustLessonDuration(
    currentNodes: ScheduleNode[],
    lessonId: string,
    increment: boolean
  ): ScheduleNode[] {
    const nodes = [...currentNodes];
    const targetIndex = nodes.findIndex(
      (node) => node.eventData?.lessonId === lessonId,
    );

    if (targetIndex === -1) return nodes;

    const oldDuration = nodes[targetIndex].duration;
    const newDuration = Math.max(30, oldDuration + (increment ? 30 : -30));
    const actualDurationDelta = newDuration - oldDuration;

    if (actualDurationDelta === 0) return currentNodes;

    return nodes.map((node, index) => {
      if (index === targetIndex) {
        return { ...node, duration: newDuration };
      }
      if (index > targetIndex && node.type === "event") {
        const newStartTime = minutesToTime(
          timeToMinutes(node.startTime) + actualDurationDelta,
        );
        return { ...node, startTime: newStartTime };
      }
      return node;
    });
  }

  /**
   * Handle time adjustment for a lesson with gap closure logic
   */
  static adjustLessonTime(
    currentNodes: ScheduleNode[],
    lessonId: string,
    increment: boolean
  ): { nodes: ScheduleNode[]; globalOffsetDelta: number } {
    const nodes = [...currentNodes];
    const targetIndex = nodes.findIndex(
      (node) => node.eventData?.lessonId === lessonId,
    );

    if (targetIndex === -1) return { nodes, globalOffsetDelta: 0 };

    const delta = increment ? 30 : -30;
    let globalOffsetDelta = 0;

    // If this is the first event, track global offset change
    if (targetIndex === 0) {
      globalOffsetDelta = delta;
    }

    const updatedNodes = nodes.map((node, index) => {
      if (index >= targetIndex && node.type === "event") {
        const newStartTime = minutesToTime(
          timeToMinutes(node.startTime) + delta,
        );
        return { ...node, startTime: newStartTime };
      }
      return node;
    });

    // Auto-close gaps when moving later (+30 minutes)
    if (increment && targetIndex < nodes.length - 1) {
      const eventNodes = updatedNodes.filter((n) => n.type === "event");
      const currentEventIndex = eventNodes.findIndex(
        (n) => n.eventData?.lessonId === lessonId,
      );

      if (
        currentEventIndex >= 0 &&
        currentEventIndex < eventNodes.length - 1
      ) {
        const currentEvent = eventNodes[currentEventIndex];
        const nextEvent = eventNodes[currentEventIndex + 1];

        const currentEndTime =
          timeToMinutes(currentEvent.startTime) + currentEvent.duration;
        const nextStartTime = timeToMinutes(nextEvent.startTime);
        const gap = nextStartTime - currentEndTime;

        // If gap is exactly 30 minutes (the adjustment we just made), close it
        if (gap === 30) {
          return {
            nodes: updatedNodes.map((node, index) => {
              const nodeEventIndex = eventNodes.findIndex(
                (en) => en.id === node.id,
              );
              if (nodeEventIndex > currentEventIndex && node.type === "event") {
                const newStartTime = minutesToTime(
                  timeToMinutes(node.startTime) - 30,
                );
                return { ...node, startTime: newStartTime };
              }
              return node;
            }),
            globalOffsetDelta
          };
        }
      }
    }

    return { nodes: updatedNodes, globalOffsetDelta };
  }

  /**
   * Handle removing a lesson from queue
   */
  static removeLessonFromQueue(
    currentNodes: ScheduleNode[],
    scheduleNodes: ScheduleNode[],
    lessonId: string
  ): { nodes: ScheduleNode[]; newGlobalOffset: number } {
    const filteredNodes = currentNodes.filter(
      (node) => node.eventData?.lessonId !== lessonId,
    );

    let newGlobalOffset = 0;

    // If we removed the first event, recalculate the global offset
    if (
      currentNodes[0]?.eventData?.lessonId === lessonId &&
      filteredNodes.length > 0
    ) {
      const newFirstEvent = filteredNodes.find(
        (node) => node.type === "event",
      );
      const originalFirstEvent = scheduleNodes.find(
        (node) => node.type === "event",
      );

      if (newFirstEvent && originalFirstEvent) {
        const newTime = timeToMinutes(newFirstEvent.startTime);
        const originalTime = timeToMinutes(originalFirstEvent.startTime);
        newGlobalOffset = newTime - originalTime;
      }
    }

    return { nodes: filteredNodes, newGlobalOffset };
  }

  /**
   * Handle moving lesson in queue
   */
  static moveLessonInQueue(
    currentNodes: ScheduleNode[],
    lessonId: string,
    direction: 'up' | 'down'
  ): ScheduleNode[] {
    const firstEventNode = currentNodes.find(n => n.type === 'event');
    if (!firstEventNode) return currentNodes;
    
    const anchorTime = firstEventNode.startTime;
    const updatedNodes = [...currentNodes];
    const movingNodeIndex = updatedNodes.findIndex(n => n.eventData?.lessonId === lessonId);

    if (movingNodeIndex === -1) return currentNodes;

    let swapNodeIndex = -1;
    if (direction === 'up') {
      for (let i = movingNodeIndex - 1; i >= 0; i--) {
        if (updatedNodes[i].type === 'event') {
          swapNodeIndex = i;
          break;
        }
      }
    } else {
      for (let i = movingNodeIndex + 1; i < updatedNodes.length; i++) {
        if (updatedNodes[i].type === 'event') {
          swapNodeIndex = i;
          break;
        }
      }
    }

    if (swapNodeIndex === -1) return currentNodes;

    // Swap the nodes
    [updatedNodes[movingNodeIndex], updatedNodes[swapNodeIndex]] = 
    [updatedNodes[swapNodeIndex], updatedNodes[movingNodeIndex]];

    const eventNodes = updatedNodes.filter(n => n.type === 'event');
    return compactSchedulePreservingOrder(eventNodes, anchorTime);
  }

  /**
   * Apply global time offset to all events in schedule
   */
  static applyGlobalTimeOffset(
    scheduleNodes: ScheduleNode[],
    globalTimeOffset: number
  ): ScheduleNode[] {
    if (globalTimeOffset === 0) return scheduleNodes;

    return scheduleNodes.map((node) => {
      if (node.type === "event") {
        const originalTime = timeToMinutes(node.startTime);
        const newTime = originalTime + globalTimeOffset;
        return {
          ...node,
          startTime: minutesToTime(Math.max(0, newTime)),
        };
      }
      return node;
    });
  }

  /**
   * Create event ID mapping for database updates
   */
  static createEventIdMap(eventsList: any[]): Map<string, string> {
    const map = new Map<string, string>();
    eventsList.forEach((eventData) => {
      if (eventData.lesson?.id && eventData.id) {
        map.set(eventData.lesson.id, eventData.id);
      }
    });
    return map;
  }

  /**
   * Find earliest time across teacher groups
   */
  static findEarliestTime(teacherEventGroups: any[]): string | null {
    if (teacherEventGroups.length === 0) return null;

    const allFirstTimes = teacherEventGroups
      .map((group) => {
        const firstEvent = group.teacherSchedule
          ?.getNodes()
          .find((node) => node.type === "event");
        return firstEvent ? timeToMinutes(firstEvent.startTime) : Infinity;
      })
      .filter((time) => time !== Infinity);

    return allFirstTimes.length > 0 ? minutesToTime(Math.min(...allFirstTimes)) : null;
  }

  /**
   * Check if teacher should be excluded from parent updates
   */
  static shouldExcludeFromParentUpdate(
    teacherId: string,
    teachersInEditMode: Set<string>,
    teachersNotInEditMode: Set<string>
  ): boolean {
    return !teachersInEditMode.has(teacherId) || teachersNotInEditMode.has(teacherId);
  }

  /**
   * Handle database submission of queue changes
   */
  static async submitQueueChanges(
    originalScheduleNodes: ScheduleNode[],
    editableScheduleNodes: ScheduleNode[],
    events: any[],
    selectedDate: string
  ): Promise<void> {
    const originalEventNodes = originalScheduleNodes.filter((n) => n.type === "event");
    const modifiedEventNodes = editableScheduleNodes.filter((n) => n.type === "event");
    const updatePromises: Promise<any>[] = [];

    // Find and process updates/position changes
    modifiedEventNodes.forEach((modifiedNode) => {
      const originalNode = originalEventNodes.find(
        (n) => n.eventData.lessonId === modifiedNode.eventData.lessonId,
      );
      if (!originalNode) return;

      const updates: { date?: string; duration?: number } = {};
      let hasChanges = false;

      if (originalNode.startTime !== modifiedNode.startTime) {
        updates.date = toUTCString(createUTCDateTime(selectedDate, modifiedNode.startTime));
        hasChanges = true;
      }

      if (originalNode.duration !== modifiedNode.duration) {
        updates.duration = modifiedNode.duration;
        hasChanges = true;
      }

      if (hasChanges) {
        const eventData = events.find(
          (e) => e.lesson?.id === modifiedNode.eventData.lessonId,
        );
        if (eventData && eventData.id) {
          updatePromises.push(updateEvent(eventData.id, updates));
        }
      }
    });

    // Find and process deletions
    originalEventNodes.forEach((originalNode) => {
      if (
        !modifiedEventNodes.some(
          (n) => n.eventData.lessonId === originalNode.eventData.lessonId,
        )
      ) {
        const eventData = events.find(
          (e) => e.lesson?.id === originalNode.eventData.lessonId,
        );
        if (eventData && eventData.id) {
          updatePromises.push(deleteEvent(eventData.id));
        }
      }
    });

    if (updatePromises.length > 0) {
      try {
        const results = await Promise.all(updatePromises);
        const failures = results.filter((r) => !r.success);
        if (failures.length > 0) {
          console.error("Some updates failed:", failures);
        } else {
          console.log("All events updated successfully.");
        }
      } catch (error) {
        console.error("An error occurred during batch update:", error);
      }
    }
  }

  /**
   * Handle full schedule reorganization
   */
  static async performFullScheduleReorganization(
    teacherSchedule: TeacherSchedule,
    events: any[],
    selectedDate: string
  ): Promise<boolean> {
    const eventIdMap = this.createEventIdMap(events);
    const success = teacherSchedule.performCompactReorganization();
    if (!success) {
      console.log('No reorganization needed or failed to reorganize schedule');
      return false;
    }

    const databaseUpdates = teacherSchedule.getDatabaseUpdatesForCompactReorganization(selectedDate, eventIdMap);
    if (databaseUpdates.length > 0) {
      const dbResult = await reorganizeEventTimes(databaseUpdates);
      if (dbResult.success) {
        console.log(`Full schedule reorganized successfully. Updated ${dbResult.updatedCount} events in database.`);
        return true;
      } else {
        console.error('Failed to update database:', dbResult.error);
        return false;
      }
    } else {
      console.log('Schedule already optimized');
      return true;
    }
  }

  /**
   * Handle time adjustment acceptance
   */
  static async acceptTimeAdjustment(
    teacherSchedule: TeacherSchedule,
    globalTimeOffset: number,
    events: any[],
    selectedDate: string
  ): Promise<{ success: boolean; updatedNodes?: ScheduleNode[] }> {
    if (globalTimeOffset === 0) {
      return { success: true };
    }

    const eventIdMap = this.createEventIdMap(events);
    const success = teacherSchedule.shiftFirstEventAndReorganize(globalTimeOffset);
    if (!success) {
      console.error("Failed to shift schedule");
      return { success: false };
    }

    const databaseUpdates = teacherSchedule.getDatabaseUpdatesForShiftedSchedule(
      selectedDate,
      eventIdMap,
    );

    if (databaseUpdates.length > 0) {
      const dbResult = await reorganizeEventTimes(databaseUpdates);
      if (dbResult.success) {
        console.log(
          `Schedule shifted by ${globalTimeOffset} minutes. Updated ${dbResult.updatedCount} events in database.`,
        );
        return { success: true, updatedNodes: teacherSchedule.getNodes() };
      } else {
        console.error("Failed to update database:", dbResult.error);
        return { success: false };
      }
    }

    return { success: true, updatedNodes: teacherSchedule.getNodes() };
  }

  /**
   * Handle event status change
   */
  static async changeEventStatus(
    eventId: string,
    newStatus: "planned" | "completed" | "tbc" | "cancelled"
  ): Promise<boolean> {
    try {
      const result = await updateEvent(eventId, { status: newStatus });
      if (result.success) {
        console.log("Event status updated successfully:", eventId, "to", newStatus);
        return true;
      } else {
        console.error("Failed to update event status:", result.error);
        return false;
      }
    } catch (error) {
      console.error("Error updating event status:", error);
      return false;
    }
  }
}