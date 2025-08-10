/**
 * TeacherSchedule - Simple linked list for teacher daily schedules
 */

import { addMinutesToTime, timeToMinutes, minutesToTime, createUTCDateTime, toUTCString } from '@/components/formatters/TimeZone';
import { format } from 'date-fns';
import { detectScheduleGaps, hasScheduleGaps, compactSchedule, findNextAvailableSlot, type ScheduleItem } from './ScheduleUtils';

export type ScheduleItemType = 'event' | 'gap';

export interface ScheduleNode extends ScheduleItem {
  id: string;
  type: ScheduleItemType;
  startTime: string; // HH:MM format
  duration: number; // minutes
  next: ScheduleNode | null;
  
  // Event-specific data (only when type === 'event')
  eventData?: {
    lessonId: string;
    location: string;
    studentCount: number;
    studentNames?: string[]; // Add student names for conflict display
  };
}

export interface TeacherDaySchedule {
  teacherId: string;
  teacherName: string;
  date: string;
  head: ScheduleNode | null;
}

export interface AvailableSlot {
  startTime: string;
  endTime: string;
  duration: number;
}

export interface ConflictInfo {
  hasConflict: boolean;
  conflictingNodes: ScheduleNode[];
  suggestedAlternatives: AvailableSlot[];
}

export interface ReorganizationOption {
  type: 'shift_next' | 'compact_schedule';
  description: string;
  nodeToMove?: ScheduleNode;
  nodesToMove?: ScheduleNode[];
  newStartTime?: string;
  timeSaved?: number;
  feasible: boolean;
  deletedEventTime?: string; // Time slot of the deleted event for reference
}

export class TeacherSchedule {
  private schedule: TeacherDaySchedule;

  constructor(teacherId: string, teacherName: string, date: string) {
    this.schedule = {
      teacherId,
      teacherName,
      date,
      head: null
    };
  }

  /**
   * Create multiple teacher schedules from lessons data
   */
  static createSchedulesFromLessons(date: string, lessons: any[]): Map<string, TeacherSchedule> {
    const schedules = new Map<string, TeacherSchedule>();
    
    // Group lessons by teacher
    const teacherLessonsMap = new Map<string, any[]>();
    
    lessons
      .filter(lesson => lesson != null) // Filter out null/undefined lessons
      .forEach(lesson => {
        if (lesson.teacher?.id) {
          const teacherId = lesson.teacher.id;
          if (!teacherLessonsMap.has(teacherId)) {
            teacherLessonsMap.set(teacherId, []);
          }
          teacherLessonsMap.get(teacherId)!.push(lesson);
        }
      });

    // Create schedule for each teacher
    teacherLessonsMap.forEach((teacherLessons, teacherId) => {
      const teacher = teacherLessons[0].teacher;
      const schedule = new TeacherSchedule(teacherId, teacher.name, date);
      
      // Add existing events from lessons
      teacherLessons.forEach(lesson => {
        // Add safety check for lesson existence
        if (!lesson || !lesson.events) return;
        
        lesson.events
          .filter((event: any) => event != null) // Filter out null/undefined events
          .forEach((event: any) => {
            // Add proper null/undefined checks
            if (event && event.date && TeacherSchedule.isSameDate(event.date, date)) {
              // Convert UTC timestamp to local time using the same method as EventCard
              const localTime = format(new Date(event.date), 'HH:mm');
              
              // Extract student names from booking.students (BookingStudent relations)
              let studentNames: string[] = [];
              if (lesson.booking?.students && Array.isArray(lesson.booking.students)) {
                studentNames = lesson.booking.students.map((bookingStudent: any) => 
                  bookingStudent.student?.name || bookingStudent.student?.first_name || 'Unknown'
                );
              }
              
              schedule.addEvent(
                localTime,
                event.duration || 120,
                lesson.id,
                event.location || 'Los Lances',
                lesson.booking?.students?.length || 1,
                studentNames.length > 0 ? studentNames : undefined
              );
            }
          });
      });
      
      schedules.set(teacherId, schedule);
    });

    return schedules;
  }

  /**
   * Add an event to the linked list (sorted by start time)
   */
  addEvent(startTime: string, duration: number, lessonId: string, location: string, studentCount: number, studentNames?: string[]): ScheduleNode {
    const node: ScheduleNode = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'event',
      startTime,
      duration,
      next: null,
      eventData: {
        lessonId,
        location,
        studentCount,
        studentNames
      }
    };

    this.insertNode(node);
    return node;
  }

  /**
   * Insert node in chronological order
   */
  private insertNode(newNode: ScheduleNode): void {
    if (!this.schedule.head || this.timeToMinutes(newNode.startTime) < this.timeToMinutes(this.schedule.head.startTime)) {
      newNode.next = this.schedule.head;
      this.schedule.head = newNode;
      return;
    }

    let current = this.schedule.head;
    while (current.next && this.timeToMinutes(current.next.startTime) < this.timeToMinutes(newNode.startTime)) {
      current = current.next;
    }

    newNode.next = current.next;
    current.next = newNode;
  }

  /**
   * Calculate the next possible slot after existing events
   */
  calculatePossibleSlot(requestedDuration: number): AvailableSlot | null {
    const storedNodes = this.getStoredNodes();
    const eventNodes = storedNodes.filter(node => node.type === 'event');
    
    // Use the utility function to find next available slot
    return findNextAvailableSlot(eventNodes, requestedDuration);
  }

  /**
   * Get available time slots between events
   */
  getAvailableSlots(minimumDuration: number = 60): AvailableSlot[] {
    const storedNodes = this.getStoredNodes();
    const eventNodes = storedNodes.filter(node => node.type === 'event');
    
    if (eventNodes.length === 0) {
      return []; // No events scheduled, return empty slots
    }

    const slots: AvailableSlot[] = [];
    
    // Sort events by start time
    const sortedEvents = [...eventNodes].sort((a, b) => 
      this.timeToMinutes(a.startTime) - this.timeToMinutes(b.startTime)
    );

    // Check gaps between events
    for (let i = 0; i < sortedEvents.length - 1; i++) {
      const currentEvent = sortedEvents[i];
      const nextEvent = sortedEvents[i + 1];
      
      const currentEnd = this.timeToMinutes(currentEvent.startTime) + currentEvent.duration;
      const nextStart = this.timeToMinutes(nextEvent.startTime);
      const gapDuration = nextStart - currentEnd;

      if (gapDuration >= minimumDuration) {
        slots.push({
          startTime: this.minutesToTime(currentEnd),
          endTime: nextEvent.startTime,
          duration: gapDuration
        });
      }
    }

    return slots;
  }

  /**
   * Check for conflicts when adding a new item
   */
  checkConflict(startTime: string, duration: number): ConflictInfo {
    const proposedStart = this.timeToMinutes(startTime);
    const proposedEnd = proposedStart + duration;
    const conflictingNodes: ScheduleNode[] = [];

    let current = this.schedule.head;
    while (current) {
      const nodeStart = this.timeToMinutes(current.startTime);
      const nodeEnd = nodeStart + current.duration;

      // Check for overlap
      if (proposedStart < nodeEnd && proposedEnd > nodeStart) {
        conflictingNodes.push(current);
      }

      current = current.next;
    }

    const hasConflict = conflictingNodes.length > 0;
    let suggestedAlternatives: AvailableSlot[] = [];
    
    if (hasConflict) {
      const nextSlot = this.calculatePossibleSlot(duration);
      if (nextSlot) {
        suggestedAlternatives = [nextSlot];
      }
    }

    return {
      hasConflict,
      conflictingNodes,
      suggestedAlternatives
    };
  }

  /**
   * Get the schedule
   */
  getSchedule(): TeacherDaySchedule {
    return { ...this.schedule };
  }

  /**
   * Get all nodes as array, including automatically detected gaps
   */
  getNodes(): ScheduleNode[] {
    const storedNodes = this.getStoredNodes();
    const eventNodes = storedNodes.filter(node => node.type === 'event');
    
    // Use the utility function to detect gaps
    return detectScheduleGaps(eventNodes) as ScheduleNode[];
  }

  /**
   * Get only the actual stored nodes (without auto-detected gaps)
   */
  getStoredNodes(): ScheduleNode[] {
    const nodes: ScheduleNode[] = [];
    let current = this.schedule.head;
    
    while (current) {
      nodes.push(current);
      current = current.next;
    }
    
    return nodes;
  }

  /**
   * Remove a node by id
   */
  removeNode(nodeId: string): boolean {
    if (!this.schedule.head) return false;

    if (this.schedule.head.id === nodeId) {
      this.schedule.head = this.schedule.head.next;
      return true;
    }

    let current = this.schedule.head;
    while (current.next && current.next.id !== nodeId) {
      current = current.next;
    }

    if (current.next) {
      current.next = current.next.next;
      return true;
    }

    return false;
  }

  /**
   * Get reorganization options when removing a node
   */
  getReorganizationOptions(nodeIdToRemove: string): ReorganizationOption[] {
    const nodeToRemove = this.findNodeById(nodeIdToRemove);
    if (!nodeToRemove) return [];

    const options: ReorganizationOption[] = [];
    const removedDuration = nodeToRemove.duration;

    // Only offer compact schedule option if there are subsequent nodes
    const subsequentNodes = this.getNodesAfter(nodeIdToRemove);
    if (subsequentNodes.length > 0) {
      options.push({
        type: 'compact_schedule',
        description: `Compact schedule by moving ${subsequentNodes.length} events earlier`,
        nodesToMove: subsequentNodes,
        timeSaved: removedDuration,
        feasible: true
      });
    }

    return options;
  }

  /**
   * Check if reorganization is possible for this teacher's schedule
   */
  canReorganizeSchedule(): boolean {
    const nodes = this.getStoredNodes();
    const eventNodes = nodes.filter(node => node.type === 'event');
    
    // Use the utility function to check for gaps
    return hasScheduleGaps(eventNodes, 15); // 15+ minute gaps
  }

  /**
   * Perform automatic compact reorganization of entire schedule
   */
  performCompactReorganization(): boolean {
    try {
      const nodes = this.getStoredNodes();
      const eventNodes = nodes.filter(node => node.type === 'event');
      
      if (eventNodes.length < 2) return false;

      // Use the utility function to compact the schedule
      const compactedEvents = compactSchedule(eventNodes);
      
      // Update the actual nodes with the compacted times
      compactedEvents.forEach((compactedEvent, index) => {
        eventNodes[index].startTime = compactedEvent.startTime;
      });
      
      // Resort the schedule to maintain order
      this.resortSchedule();
      return true;
    } catch (error) {
      console.error('Error performing compact reorganization:', error);
      return false;
    }
  }

  /**
   * Get database updates for full schedule compaction
   */
  getDatabaseUpdatesForCompactReorganization(selectedDate: string, eventIdMap: Map<string, string>): Array<{
    eventId: string;
    newDateTime: string;
  }> {
    const updates: Array<{ eventId: string; newDateTime: string }> = [];
    
    try {
      const nodes = this.getStoredNodes();
      const eventNodes = nodes.filter(node => node.type === 'event');
      
      // Update all events except the first one (which stays in place)
      for (let i = 1; i < eventNodes.length; i++) {
        const node = eventNodes[i];
        const lessonId = node.eventData?.lessonId;
        const eventId = lessonId ? eventIdMap.get(lessonId) : undefined;
        
        if (eventId && lessonId) {
          const newDateTime = this.combineDateTime(selectedDate, node.startTime);
          updates.push({
            eventId,
            newDateTime
          });
        }
      }
    } catch (error) {
      console.error('Error generating compact reorganization updates:', error);
    }
    
    return updates;
  }

  /**
   * Execute reorganization based on selected option
   */
  reorganizeTeacherEvents(option: ReorganizationOption): boolean {
    try {
      switch (option.type) {
        case 'shift_next':
          if (option.nodeToMove && option.newStartTime) {
            // Find next available slot for the node to move
            const nextSlot = this.calculatePossibleSlot(option.nodeToMove.duration);
            if (nextSlot) {
              option.nodeToMove.startTime = nextSlot.startTime;
              this.resortSchedule();
              return true;
            }
          }
          break;

        case 'compact_schedule':
          if (option.nodesToMove) {
            // For reorganization after deletion, we want to use the deleted node's time slot
            // The first node to move should start at the time the deleted node was at
            const firstNodeToMove = option.nodesToMove[0];
            
            // If we have timeSaved, it means we removed a node and want to shift everything up
            let nextStartTime: number;
            if (option.timeSaved) {
              // Calculate the earliest time any of the nodes to move currently has
              const earliestTime = Math.min(...option.nodesToMove.map(node => 
                this.timeToMinutes(node.startTime)
              ));
              
              // Move everything back by the time saved (which is the duration of deleted node)
              nextStartTime = earliestTime - option.timeSaved;
            } else {
              // Normal compacting - just start after the previous node
              const nodeBeforeFirst = this.findNodeBefore(firstNodeToMove.id);
              if (nodeBeforeFirst) {
                nextStartTime = this.timeToMinutes(nodeBeforeFirst.startTime) + nodeBeforeFirst.duration;
              } else {
                nextStartTime = this.timeToMinutes(firstNodeToMove.startTime);
              }
            }
            
            // Compact all nodes to move sequentially
            option.nodesToMove.forEach(node => {
              node.startTime = this.minutesToTime(Math.max(0, nextStartTime));
              nextStartTime += node.duration; // Next event starts after this one ends
            });
            
            this.resortSchedule();
            return true;
          }
          break;
      }
      return false;
    } catch (error) {
      console.error('Error reorganizing schedule:', error);
      return false;
    }
  }

  /**
   * Get database updates for reorganization after removing a specific node
   * This simulates the reorganization without actually modifying the schedule
   */
  getDatabaseUpdatesAfterNodeRemoval(
    nodeIdToRemove: string, 
    option: ReorganizationOption, 
    selectedDate: string, 
    eventIdMap: Map<string, string>
  ): Array<{ eventId: string; newDateTime: string; }> {
    const updates: Array<{ eventId: string; newDateTime: string }> = [];
    
    try {
      // Get the nodes that would remain after removal
      const allNodes = this.getStoredNodes();
      const nodeToRemove = allNodes.find(n => n.id === nodeIdToRemove);
      if (!nodeToRemove) return updates;
      
      if (option.type === 'compact_schedule' && option.nodesToMove) {
        // Start from the deleted event's time slot
        let nextStartTime = this.timeToMinutes(nodeToRemove.startTime);
        
        // Generate updates for each node that needs to move
        option.nodesToMove.forEach(node => {
          // Skip if this is the node being removed
          if (node.id === nodeIdToRemove) return;
          
          const lessonId = node.eventData?.lessonId;
          const eventId = lessonId ? eventIdMap.get(lessonId) : undefined;
          
          if (eventId && lessonId) {
            const newStartTime = this.minutesToTime(nextStartTime);
            const newDateTime = this.combineDateTime(selectedDate, newStartTime);
            
            updates.push({
              eventId,
              newDateTime
            });
          }
          
          // Next event starts after this one ends (account for duration)
          nextStartTime += node.duration;
        });
      }
    } catch (error) {
      console.error('Error generating updates after node removal:', error);
    }
    
    return updates;
  }

  /**
   * Get database update information for reorganization
   */
  getDatabaseUpdatesForReorganization(option: ReorganizationOption, selectedDate: string, eventIdMap: Map<string, string>): Array<{
    eventId: string;
    newDateTime: string;
  }> {
    const updates: Array<{ eventId: string; newDateTime: string }> = [];
    
    try {
      switch (option.type) {
        case 'shift_next':
          if (option.nodeToMove && option.newStartTime) {
            const lessonId = option.nodeToMove.eventData?.lessonId;
            const eventId = lessonId ? eventIdMap.get(lessonId) : undefined;
            
            if (eventId && lessonId) {
              const newDateTime = this.combineDateTime(selectedDate, option.newStartTime);
              updates.push({
                eventId,
                newDateTime
              });
            }
          }
          break;

        case 'compact_schedule':
          if (option.nodesToMove && option.timeSaved) {
            // Find the node that comes before the nodes to move
            const firstNodeToMove = option.nodesToMove[0];
            const nodeBeforeFirst = this.findNodeBefore(firstNodeToMove.id);
            
            let nextStartTime: number;
            if (nodeBeforeFirst) {
              // Start right after the previous node ends
              nextStartTime = this.timeToMinutes(nodeBeforeFirst.startTime) + nodeBeforeFirst.duration;
            } else {
              // If no previous node, keep the original start time of first node to move
              nextStartTime = this.timeToMinutes(firstNodeToMove.startTime);
            }
            
            // Generate updates for each node, placing them sequentially
            option.nodesToMove.forEach(node => {
              const lessonId = node.eventData?.lessonId;
              const eventId = lessonId ? eventIdMap.get(lessonId) : undefined;
              
              if (eventId && lessonId) {
                const newStartTime = this.minutesToTime(nextStartTime);
                const newDateTime = this.combineDateTime(selectedDate, newStartTime);
                
                updates.push({
                  eventId,
                  newDateTime
                });
              }
              
              // Next event starts after this one ends (account for duration)
              nextStartTime += node.duration;
            });
          }
          break;
      }
    } catch (error) {
      console.error('Error generating database updates:', error);
    }
    
    return updates;
  }

  /**
   * Combine date and time into a proper timestamp string
   */
  private combineDateTime(dateString: string, timeString: string): string {
    // Use the UTC utilities to ensure correct timezone handling
    const utcDateTime = createUTCDateTime(dateString, timeString);
    return toUTCString(utcDateTime);
  }

  /**
   * Find a node by its ID
   */
  private findNodeById(nodeId: string): ScheduleNode | null {
    let current = this.schedule.head;
    while (current) {
      if (current.id === nodeId) return current;
      current = current.next;
    }
    return null;
  }

  /**
   * Find the node that comes before a specific node ID
   */
  private findNodeBefore(nodeId: string): ScheduleNode | null {
    if (!this.schedule.head || this.schedule.head.id === nodeId) {
      return null;
    }

    let current = this.schedule.head;
    while (current.next && current.next.id !== nodeId) {
      current = current.next;
    }

    return current.next ? current : null;
  }

  /**
   * Get all nodes that come after a specific node
   */
  private getNodesAfter(nodeId: string): ScheduleNode[] {
    const nodes: ScheduleNode[] = [];
    let current = this.schedule.head;
    let foundTarget = false;

    while (current) {
      if (foundTarget) {
        nodes.push(current);
      }
      if (current.id === nodeId) {
        foundTarget = true;
      }
      current = current.next;
    }

    return nodes;
  }

  /**
   * Resort the linked list to maintain chronological order
   */
  private resortSchedule(): void {
    if (!this.schedule.head) return;

    // Convert to array, sort, and rebuild linked list
    const nodes = this.getStoredNodes();
    nodes.sort((a, b) => this.timeToMinutes(a.startTime) - this.timeToMinutes(b.startTime));

    // Rebuild the linked list
    this.schedule.head = null;
    nodes.forEach(node => {
      node.next = null; // Reset next pointer
      this.insertNode(node);
    });
  }

  // Utility methods
  private timeToMinutes(time: string): number {
    return timeToMinutes(time);
  }

  private minutesToTime(minutes: number): string {
    return minutesToTime(minutes);
  }

  static isSameDate(date1: string, date2: string): boolean {
    return new Date(date1).toDateString() === new Date(date2).toDateString();
  }

  static extractTimeFromDate(dateString: string): string {
    // Convert UTC timestamp to local time using the same method as EventCard
    return format(new Date(dateString), 'HH:mm');
  }

  /**
   * Shift the first event's start time and reorganize all subsequent events
   */
  shiftFirstEventAndReorganize(minutesOffset: number): boolean {
    if (!this.schedule.head || this.schedule.head.type !== 'event') {
      return false; // No events to shift
    }

    const firstNode = this.schedule.head;
    const currentStartMinutes = timeToMinutes(firstNode.startTime);
    const newStartMinutes = currentStartMinutes + minutesOffset;
    
    // Check if new time is valid (not negative)
    if (newStartMinutes < 0) {
      return false; // Cannot shift to negative time
    }

    const newStartTime = minutesToTime(newStartMinutes);
    
    // Update the first event's time
    firstNode.startTime = newStartTime;
    
    // Reorganize all subsequent events to remove gaps
    let currentNode = firstNode;
    let nextEventStartTime = newStartMinutes + firstNode.duration;
    
    while (currentNode.next) {
      const nextNode = currentNode.next;
      
      if (nextNode.type === 'event') {
        nextNode.startTime = minutesToTime(nextEventStartTime);
        nextEventStartTime += nextNode.duration;
      }
      
      currentNode = nextNode;
    }
    
    return true;
  }

  /**
   * Get database updates for shifted first event and reorganized schedule
   */
  getDatabaseUpdatesForShiftedSchedule(selectedDate: string, eventIdMap: Map<string, string>): Array<{ eventId: string; newDateTime: string }> {
    const updates: Array<{ eventId: string; newDateTime: string }> = [];
    
    let current = this.schedule.head;
    while (current) {
      if (current.type === 'event' && current.eventData?.lessonId) {
        const eventId = eventIdMap.get(current.eventData.lessonId);
        if (eventId) {
          const newDateTime = toUTCString(createUTCDateTime(selectedDate, current.startTime));
          updates.push({
            eventId,
            newDateTime
          });
        }
      }
      current = current.next;
    }
    
    return updates;
  }
}
