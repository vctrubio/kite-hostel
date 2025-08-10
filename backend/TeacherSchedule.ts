/**
 * TeacherSchedule - Simple linked list for teacher daily schedules
 */

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
            schedule.addEvent(
              TeacherSchedule.extractTimeFromDate(event.date),
              event.duration || 120,
              lesson.id,
              event.location || 'Los Lances',
              lesson.students?.length || 1
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
  addEvent(startTime: string, duration: number, lessonId: string, location: string, studentCount: number): ScheduleNode {
    const node: ScheduleNode = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'event',
      startTime,
      duration,
      next: null,
      eventData: {
        lessonId,
        location,
        studentCount
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
    const workingStart = '09:00';
    const workingEnd = '18:00';

    if (!this.schedule.head) {
      // No events scheduled, entire day available
      slots.push({
        startTime: workingStart,
        endTime: workingEnd,
        duration: this.timeToMinutes(workingEnd) - this.timeToMinutes(workingStart)
      });
      return slots;
    }

    // Check slot before first event
    const firstEventStart = this.timeToMinutes(this.schedule.head.startTime);
    const workingStartMinutes = this.timeToMinutes(workingStart);
    
    if (firstEventStart - workingStartMinutes >= minimumDuration) {
      slots.push({
        startTime: workingStart,
        endTime: this.schedule.head.startTime,
        duration: firstEventStart - workingStartMinutes
      });
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

    // Check slot after last event
    let lastNode = this.schedule.head;
    while (lastNode.next) {
      lastNode = lastNode.next;
    }

    const lastEventEnd = this.timeToMinutes(lastNode.startTime) + lastNode.duration;
    const workingEndMinutes = this.timeToMinutes(workingEnd);

    if (workingEndMinutes - lastEventEnd >= minimumDuration) {
      slots.push({
        startTime: this.minutesToTime(lastEventEnd),
        endTime: workingEnd,
        duration: workingEndMinutes - lastEventEnd
      });
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
    const suggestedAlternatives = hasConflict ? this.getAvailableSlots(duration) : [];

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
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  static isSameDate(date1: string, date2: string): boolean {
    return new Date(date1).toDateString() === new Date(date2).toDateString();
  }

  static extractTimeFromDate(dateString: string): string {
    const date = new Date(dateString);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }
}
