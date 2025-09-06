/**
 * TeacherQueue - Manages a linked list of lessons for a teacher on a specific date
 * Handles time adjustments, duration changes, and lesson reordering
 * Uses BillboardClass for data access and booking/lesson IDs for identification
 */

import { addMinutes, format } from 'date-fns';
import { BillboardClass } from './BillboardClass';
import { formatTime } from '@/components/formatters/DateTime';

export interface QueuedLesson {
  id: string | null; // Event ID if it exists, null if dragged from StudentBookingColumn
  lesson: {
    id: string;
    bookingId: string;
    duration: number;
    status: "planned" | "completed" | "tbc" | "cancelled";
    teacher?: any;
    booking?: any;
    commission?: any;
  };
  event: {
    id?: string;
    duration: number;
    scheduledDateTime?: string; // ISO string
    location?: string;
    status?: "planned" | "completed" | "tbc" | "cancelled";
  };
  hasGap?: boolean;
  timeAdjustment?: number; // Manual time adjustment in minutes
  gapClosureAdjustment?: number;
  billboardClass?: BillboardClass; // Reference to original data
}

export interface QueueNode {
  id: string;
  lesson: QueuedLesson;
  next: QueueNode | null;
}

export class TeacherQueue {
  private head: QueueNode | null = null;
  
  constructor(
    private date: string,
  ) {}

  // Create queue from billboard classes for a specific teacher
  static fromBillboardClasses(
    billboardClasses: BillboardClass[], 
    teacherId: string, 
    date: string
  ): TeacherQueue {
    const queue = new TeacherQueue(date);
    
    // Get all events for this teacher on this date
    const teacherEvents: any[] = [];
    billboardClasses.forEach(bc => {
      const events = bc.getEventsForTeacherAndDate(teacherId, date);
      teacherEvents.push(...events.map(event => ({ event, billboardClass: bc })));
    });

    // Sort events by time
    const sortedEvents = teacherEvents.sort((a, b) => {
      const timeA = new Date(a.event.date).getTime();
      const timeB = new Date(b.event.date).getTime();
      return timeA - timeB;
    });

    // Add each event to the queue
    sortedEvents.forEach(({ event, billboardClass }) => {
      const queuedLesson: QueuedLesson = {
        id: event.id || null,
        lesson: {
          id: event.lesson?.id || event.id,
          bookingId: billboardClass.booking.id,
          duration: event.duration || 120,
          status: event.lesson?.status || "planned",
          teacher: event.lesson?.teacher,
          booking: event.lesson?.booking,
          commission: event.lesson?.commission
        },
        event: {
          id: event.id,
          duration: event.duration || 120,
          scheduledDateTime: event.date,
          location: event.location,
          status: event.status || "planned"
        },
        timeAdjustment: 0,
        billboardClass: billboardClass
      };
      queue.addLesson(queuedLesson);
    });

    return queue;
  }

  // Getter methods using BillboardClass
  getStudents(lesson: QueuedLesson): string[] {
    if (!lesson.billboardClass) return [];
    return lesson.billboardClass.booking.students?.map(s => s.student.name || 'Student') || [];
  }

  // Get start time from scheduledDateTime
  getStartTime(lesson: QueuedLesson): string {
    if (!lesson.event.scheduledDateTime) {
      throw new Error(`scheduledDateTime is required for lesson ${lesson.lesson.id}`);
    }
    const date = new Date(lesson.event.scheduledDateTime);
    return date.toTimeString().substring(0, 5); // Extract HH:MM
  }

  getRemainingMinutes(lesson: QueuedLesson): number {
    if (!lesson.billboardClass?.booking.package) return lesson.event.duration;
    return lesson.billboardClass.booking.package.duration || lesson.event.duration;
  }

  getLocation(lesson: QueuedLesson): string {
    if (!lesson.event.location) {
      throw new Error(`location is required for lesson ${lesson.lesson.id}`);
    }
    return lesson.event.location;
  }

  getTeacherEarnings(lesson: QueuedLesson): number {
    if (!lesson.lesson.commission?.price_per_hour) {
      throw new Error(`commission price_per_hour is required for lesson ${lesson.lesson.id}`);
    }
    
    const hours = lesson.event.duration / 60;
    return lesson.lesson.commission.price_per_hour * hours;
  }

  getSchoolRevenue(lesson: QueuedLesson): number {
    if (!lesson.billboardClass?.booking.package) {
      throw new Error(`package information is required for lesson ${lesson.lesson.id}`);
    }
    
    const pkg = lesson.billboardClass.booking.package;
    if (!pkg.price_per_student || !pkg.capacity_students || !pkg.duration) {
      throw new Error(`complete package information (price_per_student, capacity_students, duration) is required for lesson ${lesson.lesson.id}`);
    }
    
    const packageHours = pkg.duration / 60;
    const eventHours = lesson.event.duration / 60;
    const pricePerHourPerStudent = pkg.price_per_student / packageHours;
    
    return pricePerHourPerStudent * pkg.capacity_students * eventHours;
  }


  // Add lesson to end of queue
  addLesson(lesson: QueuedLesson): void {
    const node: QueueNode = {
      id: lesson.lesson.id,
      lesson,
      next: null
    };

    if (!this.head) {
      this.head = node;
    } else {
      // Find the last node
      let current = this.head;
      while (current.next) {
        current = current.next;
      }
      current.next = node;
    }

    this.recalculateTimes();
  }

  // Remove lesson from queue
  removeLesson(lessonId: string): void {
    if (!this.head) return;

    // If head is the node to remove
    if (this.head.id === lessonId) {
      this.head = this.head.next;
      this.recalculateTimes();
      return;
    }

    // Find the node before the one to remove
    let current = this.head;
    while (current.next && current.next.id !== lessonId) {
      current = current.next;
    }

    // If found, remove it
    if (current.next) {
      current.next = current.next.next;
      this.recalculateTimes();
    }
  }

  // Move lesson up in queue (earlier)
  moveUp(lessonId: string): void {
    if (!this.head) return;

    // Can't move head up
    if (this.head.id === lessonId) return;

    // Find the node before the one we want to move up
    let beforePrev: QueueNode | null = null;
    let prev = this.head;
    
    while (prev.next && prev.next.id !== lessonId) {
      beforePrev = prev;
      prev = prev.next;
    }
    
    const current = prev.next;
    if (!current) return; // Node not found
    
    // Remove current from its position
    prev.next = current.next;
    
    // Insert current before prev
    if (!beforePrev) {
      // prev is head, so current becomes new head
      current.next = prev;
      this.head = current;
    } else {
      // Insert current between beforePrev and prev
      beforePrev.next = current;
      current.next = prev;
    }
    
    this.recalculateTimes();
  }

  // Move lesson down in queue (later)
  moveDown(lessonId: string): void {
    if (!this.head) return;
    
    let prev: QueueNode | null = null;
    let current = this.head;
    
    // Find the node to move down
    while (current && current.id !== lessonId) {
      prev = current;
      current = current.next;
    }
    
    if (!current || !current.next) return; // Node not found or is last
    
    const next = current.next;
    const afterNext = next.next;
    
    // Remove current from its position
    if (prev) {
      prev.next = next;
    } else {
      this.head = next;
    }
    
    // Insert current after next
    next.next = current;
    current.next = afterNext;
    
    this.recalculateTimes();
  }

  // Adjust lesson duration
  adjustDuration(lessonId: string, increment: boolean): void {
    const node = this.findNodeById(lessonId);
    if (!node) return;

    const adjustment = increment ? 15 : -15; // 15-minute increments
    const newDuration = Math.max(15, node.lesson.event.duration + adjustment);
    
    // Don't exceed remaining minutes
    const remainingMinutes = this.getRemainingMinutes(node.lesson);
    if (newDuration <= remainingMinutes) {
      node.lesson.event.duration = newDuration;
      this.recalculateTimes();
    }
  }

  // Adjust lesson start time
  adjustTime(lessonId: string, increment: boolean): void {
    const node = this.findNodeById(lessonId);
    if (!node) return;

    const adjustment = increment ? 15 : -15; // 15-minute increments
    node.lesson.timeAdjustment = (node.lesson.timeAdjustment || 0) + adjustment;
    this.recalculateTimes();
  }

  // Recalculate all lesson times based on queue order
  private recalculateTimes(): void {
    let currentNode = this.head;

    while (currentNode) {
      const isFirst = currentNode === this.head;
      
      if (isFirst) {
        // For the first node, use the original event time
        if (currentNode.lesson.event.scheduledDateTime) {
          const originalTime = formatTime(currentNode.lesson.event.scheduledDateTime);
          const originalTimeMinutes = this.parseTime(originalTime);
          const adjustedTime = originalTimeMinutes + (currentNode.lesson.timeAdjustment || 0);
          
          currentNode.lesson.event.scheduledDateTime = this.createDateTime(adjustedTime);
        }
        currentNode.lesson.hasGap = false;
      } else {
        // For subsequent nodes, calculate based on previous node's end time
        const prevNode = this.findPrevNode(currentNode);
        if (prevNode) {
          const prevStartTime = this.getStartTime(prevNode.lesson);
          const prevEndTime = this.parseTime(prevStartTime) + prevNode.lesson.event.duration;
          const adjustedTime = prevEndTime + (currentNode.lesson.timeAdjustment || 0);
          
          // Set scheduled times
          currentNode.lesson.event.scheduledDateTime = this.createDateTime(adjustedTime);
          
          // Check for gaps
          currentNode.lesson.hasGap = adjustedTime > prevEndTime;
        }
      }

      currentNode = currentNode.next;
    }
  }

  // Helper: Parse time string to minutes since midnight
  private parseTime(timeStr: string): number {
    if (!timeStr || typeof timeStr !== 'string') {
      console.error('Invalid timeStr passed to parseTime:', timeStr);
      return 0; // fallback to midnight
    }
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Helper: Format minutes to time string
  private formatTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  // Helper: Create ISO datetime string for given time
  private createDateTime(minutes: number): string {
    const timeStr = this.formatTime(minutes);
    return `${this.date}T${timeStr}:00`;
  }

  // Get all lessons as array
  getLessons(): QueuedLesson[] {
    const lessons: QueuedLesson[] = [];
    let current = this.head;
    
    while (current) {
      lessons.push(current.lesson);
      current = current.next;
    }
    
    return lessons;
  }

  // Get lesson by ID
  getLesson(lessonId: string): QueuedLesson | null {
    const node = this.findNodeById(lessonId);
    return node ? node.lesson : null;
  }
  
  // Helper: Find node by ID
  private findNodeById(lessonId: string): QueueNode | null {
    let current = this.head;
    while (current) {
      if (current.id === lessonId) return current;
      current = current.next;
    }
    return null;
  }
  
  // Helper: Find previous node
  private findPrevNode(targetNode: QueueNode): QueueNode | null {
    if (!this.head || this.head === targetNode) return null;
    
    let current = this.head;
    while (current.next) {
      if (current.next === targetNode) return current;
      current = current.next;
    }
    return null;
  }

  // Check if lesson can move up
  canMoveUp(lessonId: string): boolean {
    return this.head ? this.head.id !== lessonId : false;
  }

  // Check if lesson can move down
  canMoveDown(lessonId: string): boolean {
    const node = this.findNodeById(lessonId);
    return node ? node.next !== null : false;
  }

  // Get flag time for debugging - returns actual head time or debug indicator
  getFlagTime(): string {
    if (!this.head) return "11:11";
    try {
      return this.getStartTime(this.head.lesson);
    } catch {
      return "11:11";
    }
  }

  // Get total duration
  getTotalDuration(): number {
    let total = 0;
    let current = this.head;
    
    while (current) {
      total += current.lesson.event.duration;
      current = current.next;
    }
    
    return total;
  }

  // Check if lesson is first
  isFirst(lessonId: string): boolean {
    return this.head?.id === lessonId;
  }

  // Check if lesson is last
  isLast(lessonId: string): boolean {
    const node = this.findNodeById(lessonId);
    return node ? node.next === null : false;
  }
}
