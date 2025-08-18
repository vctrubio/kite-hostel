/**
 * TeacherSchedule - Simple linked list for teacher daily schedules
 */

import { addMinutesToTime, timeToMinutes, minutesToTime, createUTCDateTime, toUTCString } from '@/components/formatters/TimeZone';
import { format } from 'date-fns';
import { detectScheduleGaps, hasScheduleGaps, compactSchedule, findNextAvailableSlot, type ScheduleItem } from './ScheduleUtils';
import { type TeacherStats, type ReorganizationOption } from './types';

export type ScheduleItemType = 'event' | 'gap';

export interface QueuedLesson {
  lessonId: string;
  duration: number;
  students: string[];
  remainingMinutes: number;
  scheduledStartTime?: string; // Calculated start time
  hasGap?: boolean; // Whether there's a gap before this lesson
  timeAdjustment?: number; // Manual time adjustment in minutes
  gapClosureAdjustment?: number; // Automatic adjustment from gap closure
}

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


export class TeacherSchedule {
  private schedule: TeacherDaySchedule;
  private lessonQueue: QueuedLesson[] = []; // Add lesson queue
  private queueStartTime: string | null = null; // Preferred queue start time
  public lessons: any[] = [];

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
      schedule.lessons = teacherLessons;
      
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

  /**
   * Queue Management Methods
   */

  // Add lesson to queue
  addLessonToQueue(lessonId: string, duration: number, students: string[], remainingMinutes: number, lessonStatus?: string): void {
    // Only allow adding if lesson is planned
    if (lessonStatus && lessonStatus !== 'planned') {
      return;
    }
    // Check if lesson already in queue
    if (this.lessonQueue.some(q => q.lessonId === lessonId)) {
      return;
    }

    const queuedLesson: QueuedLesson = {
      lessonId,
      duration,
      students,
      remainingMinutes
    };

    this.lessonQueue.push(queuedLesson);
    this.recalculateQueueSchedule(this.queueStartTime);
  }

  // Remove lesson from queue
  removeLessonFromQueue(lessonId: string): void {
    this.lessonQueue = this.lessonQueue.filter(q => q.lessonId !== lessonId);
    this.recalculateQueueSchedule(this.queueStartTime);
  }

  // Update lesson duration in queue
  updateQueueLessonDuration(lessonId: string, newDuration: number): void {
    const lesson = this.lessonQueue.find(q => q.lessonId === lessonId);
    if (lesson) {
      lesson.duration = Math.min(newDuration, lesson.remainingMinutes);
      this.recalculateQueueSchedule(this.queueStartTime);
    }
  }

  // Update lesson start time adjustment in queue
  updateQueueLessonStartTime(lessonId: string, timeAdjustmentMinutes: number): void {
    const lessonIndex = this.lessonQueue.findIndex(q => q.lessonId === lessonId);
    if (lessonIndex < 0) return;
    
    const lesson = this.lessonQueue[lessonIndex];
    
    // Initialize timeAdjustment if it doesn't exist
    if (!lesson.timeAdjustment) {
      lesson.timeAdjustment = 0;
    }
    lesson.timeAdjustment += timeAdjustmentMinutes;
    
    // If moving later (+30 minutes) and there's a next lesson, check for gap closure
    if (timeAdjustmentMinutes > 0 && lessonIndex < this.lessonQueue.length - 1) {
      const nextLesson = this.lessonQueue[lessonIndex + 1];
      
      // Store original adjustments before recalculation
      const originalAdjustments = this.lessonQueue.map(q => q.timeAdjustment || 0);
      
      // Recalculate to get current state
      this.recalculateQueueSchedule(this.queueStartTime);
      
      // Check if after adjustment, this lesson would end exactly when next lesson starts
      if (lesson.scheduledStartTime && nextLesson.scheduledStartTime) {
        const currentEndTime = this.timeToMinutes(lesson.scheduledStartTime) + lesson.duration;
        const nextStartTime = this.timeToMinutes(nextLesson.scheduledStartTime);
        const gap = nextStartTime - currentEndTime;
        
        // If gap is exactly 30 minutes (the adjustment we just made), close it
        if (gap === 30) {
          // Instead of modifying timeAdjustment (which affects display), 
          // we'll handle this in recalculateQueueSchedule by tracking gap closure
          for (let i = lessonIndex + 1; i < this.lessonQueue.length; i++) {
            const subsequentLesson = this.lessonQueue[i];
            // Mark this lesson as having an automatic gap closure adjustment
            if (!subsequentLesson.gapClosureAdjustment) {
              subsequentLesson.gapClosureAdjustment = 0;
            }
            subsequentLesson.gapClosureAdjustment -= 30;
          }
        }
      }
    }
    
    this.recalculateQueueSchedule(this.queueStartTime);
  }

  // Set queue gap - REMOVED: Now hardcoded to 15 minutes
  // setQueueGap method removed - gap is always 15 minutes

  // Set preferred start time for queue
  setQueueStartTime(startTime: string): void {
    this.queueStartTime = startTime;
    this.recalculateQueueSchedule(this.queueStartTime);
  }

  // Get current queue
  getLessonQueue(): QueuedLesson[] {
    return [...this.lessonQueue];
  }

  // Get queue gap - REMOVED: Always returns 15
  // getQueueGap method removed - gap is always 15 minutes

  // Clear entire queue
  clearQueue(): void {
    this.lessonQueue = [];
  }

  // Move lesson up in queue (swap with previous)
  moveQueueLessonUp(lessonId: string): void {
    const index = this.lessonQueue.findIndex(q => q.lessonId === lessonId);
    if (index > 0) {
      // Swap with previous lesson
      [this.lessonQueue[index - 1], this.lessonQueue[index]] = 
      [this.lessonQueue[index], this.lessonQueue[index - 1]];
      this.recalculateQueueSchedule(this.queueStartTime);
    }
  }

  // Move lesson down in queue (swap with next)
  moveQueueLessonDown(lessonId: string): void {
    const index = this.lessonQueue.findIndex(q => q.lessonId === lessonId);
    if (index >= 0 && index < this.lessonQueue.length - 1) {
      // Swap with next lesson
      [this.lessonQueue[index], this.lessonQueue[index + 1]] = 
      [this.lessonQueue[index + 1], this.lessonQueue[index]];
      this.recalculateQueueSchedule(this.queueStartTime);
    }
  }

  // Check if lesson can move earlier without overlap
  canMoveQueueLessonEarlier(lessonId: string): boolean {
    const index = this.lessonQueue.findIndex(q => q.lessonId === lessonId);
    if (index < 0) return false; // Not found
    if (index === 0) return true; // First lesson can always move earlier - no previous lesson to overlap
    
    const currentLesson = this.lessonQueue[index];
    const previousLesson = this.lessonQueue[index - 1];
    
    if (!currentLesson.scheduledStartTime || !previousLesson.scheduledStartTime) {
      return false;
    }

    // Calculate if moving 30 minutes earlier would overlap with previous lesson
    const currentStartMinutes = this.timeToMinutes(currentLesson.scheduledStartTime);
    const proposedStartMinutes = currentStartMinutes - 30;
    const previousEndMinutes = this.timeToMinutes(previousLesson.scheduledStartTime) + previousLesson.duration;
    
    // Check if moving 30 minutes earlier would overlap with previous lesson (no gap required)
    return proposedStartMinutes >= previousEndMinutes;
  }

  // Recalculate queue schedule with proper gap detection
  private recalculateQueueSchedule(preferredStartTime?: string): void {
    if (this.lessonQueue.length === 0) return;

    // PHASE 1: Calculate all lesson positions
    const startTime = preferredStartTime || this.queueStartTime;
    let currentTime = this.findNextAvailableTime(startTime);

    this.lessonQueue.forEach((queuedLesson, index) => {
      // Apply manual time adjustment if specified
      if (queuedLesson.timeAdjustment) {
        currentTime += queuedLesson.timeAdjustment;
      }
      
      // Apply gap closure adjustment if specified
      if (queuedLesson.gapClosureAdjustment) {
        currentTime += queuedLesson.gapClosureAdjustment;
      }

      // Check if there's a conflict with existing events
      const hasConflict = this.hasConflictAtTime(currentTime, queuedLesson.duration);
      
      if (hasConflict) {
        const nextSlot = this.calculatePossibleSlot(queuedLesson.duration);
        if (nextSlot) {
          currentTime = this.timeToMinutes(nextSlot.startTime);
        }
      }

      // Set the calculated start time
      queuedLesson.scheduledStartTime = this.minutesToTime(currentTime);

      // Move to next time slot - back-to-back lessons
      currentTime += queuedLesson.duration;
    });

    // PHASE 2: Detect gaps between consecutive lessons
    this.detectAndUpdateGaps();
  }

  // Separate method for gap detection after all positions are calculated
  private detectAndUpdateGaps(): void {
    this.lessonQueue.forEach((queuedLesson, index) => {
      if (index === 0) {
        // First lesson never has a gap from previous
        queuedLesson.hasGap = false;
        return;
      }

      const previousLesson = this.lessonQueue[index - 1];
      if (!previousLesson.scheduledStartTime || !queuedLesson.scheduledStartTime) {
        queuedLesson.hasGap = false;
        return;
      }

      // Calculate when this lesson should start (immediately after previous lesson ends)
      const previousEndTime = this.timeToMinutes(previousLesson.scheduledStartTime) + previousLesson.duration;
      const actualStartTime = this.timeToMinutes(queuedLesson.scheduledStartTime);
      
      // There's a gap if the actual start time is later than when it should start
      const gapMinutes = actualStartTime - previousEndTime;
      queuedLesson.hasGap = gapMinutes > 0;
      
      // Optional: Store gap duration for debugging or display
      if (queuedLesson.hasGap) {
        (queuedLesson as any).gapDuration = gapMinutes;
      } else {
        delete (queuedLesson as any).gapDuration;
      }
    });
  }

  // Remove gap for a specific lesson by setting exact start time
  removeGapForLesson(lessonId: string): void {
    const lessonIndex = this.lessonQueue.findIndex(q => q.lessonId === lessonId);
    if (lessonIndex <= 0) return; // Can't remove gap for first lesson or lesson not found

    const lesson = this.lessonQueue[lessonIndex];
    const previousLesson = this.lessonQueue[lessonIndex - 1];
    
    if (!lesson.scheduledStartTime || !previousLesson.scheduledStartTime) return;

    // Calculate where this lesson should start (immediately after previous lesson ends)
    const previousEndTime = this.timeToMinutes(previousLesson.scheduledStartTime) + previousLesson.duration;
    const currentStartTime = this.timeToMinutes(lesson.scheduledStartTime);
    const gapMinutes = currentStartTime - previousEndTime;

    if (gapMinutes > 0) {
      // Reset timeAdjustment and calculate the exact adjustment needed
      lesson.timeAdjustment = 0;
      
      // Calculate what the original scheduled start time would be without any adjustments
      const originalStartTime = this.findOriginalScheduledTime(lessonIndex);
      
      // Calculate the adjustment needed to place it exactly after previous lesson
      const targetStartTime = this.minutesToTime(previousEndTime);
      const adjustmentNeeded = previousEndTime - this.timeToMinutes(originalStartTime);
      
      // Set the precise time adjustment
      lesson.timeAdjustment = adjustmentNeeded;
      
      // Move all subsequent lessons by the same gap amount to maintain spacing
      for (let i = lessonIndex + 1; i < this.lessonQueue.length; i++) {
        const subsequentLesson = this.lessonQueue[i];
        if (!subsequentLesson.timeAdjustment) {
          subsequentLesson.timeAdjustment = 0;
        }
        subsequentLesson.timeAdjustment -= gapMinutes;
      }
      
      // Recalculate to apply changes
      this.recalculateQueueSchedule(this.queueStartTime);
    }
  }

  // Helper method to find original scheduled time without adjustments
  private findOriginalScheduledTime(lessonIndex: number): string {
    // Temporarily remove adjustments and recalculate to get base time
    const originalAdjustments = this.lessonQueue.map(q => q.timeAdjustment || 0);
    
    // Clear all adjustments
    this.lessonQueue.forEach(q => { q.timeAdjustment = 0; q.gapClosureAdjustment = 0; });
    
    // Recalculate to get base scheduled times
    this.recalculateQueueSchedule(this.queueStartTime);
    
    // Get the base time for the target lesson
    const baseTime = this.lessonQueue[lessonIndex].scheduledStartTime || '09:00';
    
    // Restore original adjustments
    this.lessonQueue.forEach((q, i) => { q.timeAdjustment = originalAdjustments[i]; });
    
    return baseTime;
  }

  // Find next available time considering controller submit time
  private findNextAvailableTime(preferredStartTime?: string): number {
    const existingEvents = this.getStoredNodes().filter(node => node.type === 'event');
    
    if (existingEvents.length === 0) {
      // No existing events, use preferred time or 9 AM
      return preferredStartTime ? this.timeToMinutes(preferredStartTime) : 9 * 60;
    }

    // Find the latest event end time
    const latestEndTime = Math.max(...existingEvents.map(event => 
      this.timeToMinutes(event.startTime) + event.duration
    ));

    const preferredTime = preferredStartTime ? this.timeToMinutes(preferredStartTime) : 9 * 60;
    
    // Return the later of preferred time or after latest event (no gap)
    return Math.max(preferredTime, latestEndTime);
  }

  // Check if there's a conflict at a specific time
  private hasConflictAtTime(startTimeMinutes: number, duration: number): boolean {
    const existingEvents = this.getStoredNodes().filter(node => node.type === 'event');
    const proposedEnd = startTimeMinutes + duration;

    return existingEvents.some(event => {
      const eventStart = this.timeToMinutes(event.startTime);
      const eventEnd = eventStart + event.duration;
      
      return startTimeMinutes < eventEnd && proposedEnd > eventStart;
    });
  }

  // Get total queue duration
  getQueueTotalDuration(): number {
    return this.lessonQueue.reduce((total, lesson) => total + lesson.duration, 0);
  }

  // Check if queue can be scheduled - always allow scheduling
  canScheduleQueue(): boolean {
    // Always return true - let the user schedule and handle conflicts in the actual scheduling
    return this.lessonQueue.length > 0;
  }

  // Create events from queue
  createEventsFromQueue(location: string, selectedDate: string): Array<{
    lessonId: string;
    teacherId: string;
    startTime: string;
    duration: number;
    location: string;
    studentCount: number;
    students: string[];
    date: string;
  }> {
    if (!this.canScheduleQueue()) {
      return [];
    }

    const events = this.lessonQueue.map(queuedLesson => ({
      lessonId: queuedLesson.lessonId,
      teacherId: this.schedule.teacherId,
      startTime: queuedLesson.scheduledStartTime || '09:00',
      duration: queuedLesson.duration,
      location,
      studentCount: queuedLesson.students.length,
      students: queuedLesson.students,
      date: selectedDate
    }));

    return events;
  }

  /**
   * Get the earliest time from both scheduled events and queued lessons
   * @returns The earliest time in HH:MM format, or null if no events/lessons
   */
  getEarliestTime(): string | null {
    const scheduleNodes = this.getStoredNodes();
    const eventNodes = scheduleNodes.filter(node => node.type === 'event');
    const queuedLessons = this.getLessonQueue();
    
    const allTimes: string[] = [];
    
    // Add existing event times
    eventNodes.forEach(node => {
      allTimes.push(node.startTime);
    });
    
    // Add queued lesson times
    queuedLessons.forEach(lesson => {
      if (lesson.scheduledStartTime) {
        allTimes.push(lesson.scheduledStartTime);
      }
    });
    
    if (allTimes.length === 0) return null;
    
    // Use existing utility to find earliest time
    const timeMinutes = allTimes.map(time => timeToMinutes(time));
    const earliest = Math.min(...timeMinutes);
    
    return minutesToTime(earliest);
  }

  /**
   * Analyze gaps in any array of schedule nodes using ScheduleUtils
   * @param scheduleNodes - Array of schedule nodes to analyze
   * @returns Array of nodes with gap information added
   */
  analyzeScheduleGaps(scheduleNodes: ScheduleNode[]): Array<ScheduleNode & { hasGap?: boolean; gapDuration?: number }> {
    const eventNodes = scheduleNodes.filter(node => node.type === 'event');
    
    if (eventNodes.length <= 1) {
      return eventNodes.map(node => ({ ...node, hasGap: false }));
    }

    // Map back to original nodes with gap information
    return eventNodes.map((node, index) => {
      if (index === 0) {
        return { ...node, hasGap: false };
      }

      const previousNode = eventNodes[index - 1];
      const previousEndTime = this.timeToMinutes(previousNode.startTime) + previousNode.duration;
      const currentStartTime = this.timeToMinutes(node.startTime);
      const gapMinutes = currentStartTime - previousEndTime;

      return {
        ...node,
        hasGap: gapMinutes > 0,
        gapDuration: gapMinutes > 0 ? gapMinutes : undefined
      };
    });
  }

  calculateTeacherStats(): TeacherStats {
    let totalHours = 0;
    let totalEvents = 0;
    let totalEarnings = 0;
    let schoolRevenue = 0;

    const plannedLessons = this.lessons.filter(l => l.status === 'planned');
    const totalLessons = plannedLessons.length;

    plannedLessons.forEach(lesson => {
      const lessonEvents = lesson.events || [];
      
      const totalMinutes = lessonEvents.reduce((sum, event) => sum + (event.duration || 0), 0);
      const hours = totalMinutes / 60;
      
      totalHours += hours;
      totalEvents += lessonEvents.length;

      if (lesson.commission?.price_per_hour) {
        const earnings = hours * lesson.commission.price_per_hour;
        totalEarnings += earnings;
      }

      const lessonSchoolRevenue = lessonEvents.reduce((sum, event) => {
        const packagePrice = lesson.booking?.package?.price_per_student || 0;
        const studentCount = lesson.booking?.students?.length || 0;
        return sum + (packagePrice * studentCount);
      }, 0);
      schoolRevenue += lessonSchoolRevenue;
    });

    return {
      totalHours,
      totalEvents,
      totalEarnings,
      schoolRevenue,
      totalLessons
    };
  }
}