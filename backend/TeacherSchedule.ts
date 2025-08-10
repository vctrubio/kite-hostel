/**
 * TeacherSchedule - Simple linked list for teacher daily schedules
 */

import { addMinutesToTime, timeToMinutes, minutesToTime } from '@/components/formatters/TimeZone';
import { format } from 'date-fns';

export type ScheduleItemType = 'event' | 'gap';

export interface ScheduleNode {
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
    
    lessons.forEach(lesson => {
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
        lesson.events?.forEach((event: any) => {
          if (event.date && TeacherSchedule.isSameDate(event.date, date)) {
            // Convert UTC timestamp to local time using the same method as EventCard
            const localTime = format(new Date(event.date), 'HH:mm');
            
            // Debug: Check the lesson structure
            console.log('🔍 DEBUG lesson structure:', {
              hasBooking: !!lesson.booking,
              hasBookingStudents: !!lesson.booking?.students,
              bookingStudentsLength: lesson.booking?.students?.length,
              firstBookingStudent: lesson.booking?.students?.[0]
            });
            
            // Extract student names from booking.students (BookingStudent relations)
            let studentNames: string[] = [];
            if (lesson.booking?.students && Array.isArray(lesson.booking.students)) {
              studentNames = lesson.booking.students.map((bookingStudent: any) => 
                bookingStudent.student?.name || bookingStudent.student?.first_name || 'Unknown'
              );
            }
            
            console.log('🔍 DEBUG extracted studentNames:', studentNames);
            
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
   * Add a gap to the linked list (sorted by start time)
   */
  addGap(startTime: string, duration: number): ScheduleNode {
    const node: ScheduleNode = {
      id: `gap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'gap',
      startTime,
      duration,
      next: null
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
   * Get available time slots
   */
  getAvailableSlots(minimumDuration: number = 60): AvailableSlot[] {
    const slots: AvailableSlot[] = [];

    if (!this.schedule.head) {
      // No events scheduled, return empty slots (let UI handle time constraints)
      return slots;
    }

    // Check gaps between events
    let current = this.schedule.head;
    while (current.next) {
      const currentEnd = this.timeToMinutes(current.startTime) + current.duration;
      const nextStart = this.timeToMinutes(current.next.startTime);
      const gapDuration = nextStart - currentEnd;

      if (gapDuration >= minimumDuration) {
        slots.push({
          startTime: this.minutesToTime(currentEnd),
          endTime: current.next.startTime,
          duration: gapDuration
        });
      }

      current = current.next;
    }

    return slots;
  }

  /**
   * Calculate the next possible slot after existing events
   */
  calculatePossibleSlot(requestedDuration: number): AvailableSlot | null {
    // If no events scheduled, suggest starting at a reasonable time
    if (!this.schedule.head) {
      return {
        startTime: '10:00',
        endTime: this.minutesToTime(this.timeToMinutes('10:00') + requestedDuration),
        duration: requestedDuration
      };
    }

    // Find the latest end time among all events
    let latestEndTime = 0;
    let current = this.schedule.head;
    
    while (current) {
      const eventStartMinutes = this.timeToMinutes(current.startTime);
      const eventEndMinutes = eventStartMinutes + current.duration;
      
      if (eventEndMinutes > latestEndTime) {
        latestEndTime = eventEndMinutes;
      }
      current = current.next;
    }

    // Calculate next possible start time (after the latest event ends)
    const nextPossibleStart = latestEndTime;
    const nextPossibleEnd = nextPossibleStart + requestedDuration;

    return {
      startTime: this.minutesToTime(nextPossibleStart),
      endTime: this.minutesToTime(nextPossibleEnd),
      duration: requestedDuration
    };
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
      // Use the more accurate calculatePossibleSlot method
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
   * Get all nodes as array
   */
  getNodes(): ScheduleNode[] {
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
}
