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
    if (!lesson.event.scheduledDateTime) return "09:00";
    const date = new Date(lesson.event.scheduledDateTime);
    return date.toTimeString().substring(0, 5); // Extract HH:MM
  }

  getRemainingMinutes(lesson: QueuedLesson): number {
    if (!lesson.billboardClass?.booking.package) return lesson.event.duration;
    return lesson.billboardClass.booking.package.duration || lesson.event.duration;
  }

  getLocation(lesson: QueuedLesson): string {
    return lesson.event.location || "Main Beach";
  }

  getTeacherEarnings(lesson: QueuedLesson): number {
    const event = this.getEventFromLesson(lesson);
    if (!event?.lesson?.commission?.price_per_hour) return 0;
    
    const hours = lesson.duration / 60;
    return event.lesson.commission.price_per_hour * hours;
  }

  getSchoolRevenue(lesson: QueuedLesson): number {
    if (!lesson.billboardClass?.booking.package) return 0;
    
    const pkg = lesson.billboardClass.booking.package;
    const pricePerStudent = pkg.price_per_student || 0;
    const capacityStudents = pkg.capacity_students || 0;
    const packageHours = (pkg.duration || 0) / 60;
    const eventHours = lesson.duration / 60;
    
    if (packageHours > 0) {
      const pricePerHourPerStudent = pricePerStudent / packageHours;
      return pricePerHourPerStudent * capacityStudents * eventHours;
    }
    return 0;
  }

  private getEventFromLesson(lesson: QueuedLesson): any {
    if (!lesson.billboardClass) return null;
    const lessons = lesson.billboardClass.booking.lessons || [];
    for (const lessonData of lessons) {
      const event = lessonData.events?.find(e => (e.lesson_id || e.id) === lesson.lessonId);
      if (event) {
        return { ...event, lesson: lessonData };
      }
    }
    return null;
  }

  // Add lesson to end of queue
  addLesson(lesson: QueuedLesson): void {
    const node: QueueNode = {
      id: lesson.lessonId,
      lesson,
      next: null,
      prev: null
    };

    if (!this.head) {
      this.head = node;
      this.tail = node;
    } else {
      node.prev = this.tail;
      this.tail!.next = node;
      this.tail = node;
    }

    this.nodeMap.set(lesson.lessonId, node);
    this.recalculateTimes();
  }

  // Remove lesson from queue
  removeLesson(lessonId: string): void {
    const node = this.nodeMap.get(lessonId);
    if (!node) return;

    if (node.prev) {
      node.prev.next = node.next;
    } else {
      this.head = node.next;
    }

    if (node.next) {
      node.next.prev = node.prev;
    } else {
      this.tail = node.prev;
    }

    this.nodeMap.delete(lessonId);
    this.recalculateTimes();
  }

  // Move lesson up in queue (earlier)
  moveUp(lessonId: string): void {
    const node = this.nodeMap.get(lessonId);
    if (!node || !node.prev) return;

    const prevNode = node.prev;
    
    // Update connections
    if (prevNode.prev) {
      prevNode.prev.next = node;
    } else {
      this.head = node;
    }
    
    if (node.next) {
      node.next.prev = prevNode;
    } else {
      this.tail = prevNode;
    }

    // Swap positions
    node.prev = prevNode.prev;
    prevNode.next = node.next;
    node.next = prevNode;
    prevNode.prev = node;

    this.recalculateTimes();
  }

  // Move lesson down in queue (later)
  moveDown(lessonId: string): void {
    const node = this.nodeMap.get(lessonId);
    if (!node || !node.next) return;

    const nextNode = node.next;
    
    // Update connections
    if (node.prev) {
      node.prev.next = nextNode;
    } else {
      this.head = nextNode;
    }
    
    if (nextNode.next) {
      nextNode.next.prev = node;
    } else {
      this.tail = node;
    }

    // Swap positions
    nextNode.prev = node.prev;
    node.next = nextNode.next;
    node.prev = nextNode;
    nextNode.next = node;

    this.recalculateTimes();
  }

  // Adjust lesson duration
  adjustDuration(lessonId: string, increment: boolean): void {
    const node = this.nodeMap.get(lessonId);
    if (!node) return;

    const adjustment = increment ? 15 : -15; // 15-minute increments
    const newDuration = Math.max(15, node.lesson.duration + adjustment);
    
    // Don't exceed remaining minutes
    const remainingMinutes = this.getRemainingMinutes(node.lesson);
    if (newDuration <= remainingMinutes) {
      node.lesson.duration = newDuration;
      this.recalculateTimes();
    }
  }

  // Adjust lesson start time
  adjustTime(lessonId: string, increment: boolean): void {
    const node = this.nodeMap.get(lessonId);
    if (!node) return;

    const adjustment = increment ? 15 : -15; // 15-minute increments
    node.lesson.timeAdjustment = (node.lesson.timeAdjustment || 0) + adjustment;
    this.recalculateTimes();
  }

  // Recalculate all lesson times based on queue order
  private recalculateTimes(): void {
    let currentNode = this.head;

    while (currentNode) {
      // For the first node, use the original event time
      if (!currentNode.prev) {
        // Get original time from the scheduled datetime
        if (currentNode.lesson.scheduledDateTime) {
          const originalTime = formatTime(currentNode.lesson.scheduledDateTime);
          const originalTimeMinutes = this.parseTime(originalTime);
          const adjustedTime = originalTimeMinutes + (currentNode.lesson.timeAdjustment || 0);
          
          currentNode.lesson.scheduledStartTime = this.formatTime(adjustedTime);
          currentNode.lesson.scheduledDateTime = this.createDateTime(adjustedTime);
        }
        currentNode.lesson.hasGap = false;
      } else {
        // For subsequent nodes, calculate based on previous node's end time
        const prevNode = currentNode.prev;
        const prevEndTime = this.parseTime(prevNode.lesson.scheduledStartTime!) + prevNode.lesson.duration;
        const adjustedTime = prevEndTime + (currentNode.lesson.timeAdjustment || 0);
        
        // Set scheduled times
        currentNode.lesson.scheduledStartTime = this.formatTime(adjustedTime);
        currentNode.lesson.scheduledDateTime = this.createDateTime(adjustedTime);
        
        // Check for gaps
        currentNode.lesson.hasGap = adjustedTime > prevEndTime;
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
    const node = this.nodeMap.get(lessonId);
    return node ? node.lesson : null;
  }

  // Check if lesson can move up
  canMoveUp(lessonId: string): boolean {
    const node = this.nodeMap.get(lessonId);
    return node ? node.prev !== null : false;
  }

  // Check if lesson can move down
  canMoveDown(lessonId: string): boolean {
    const node = this.nodeMap.get(lessonId);
    return node ? node.next !== null : false;
  }

  // Get flag time for debugging - returns actual head time or debug indicator
  getFlagTime(): string {
    return this.head?.lesson.scheduledStartTime || "11:11";
  }

  // Get total duration
  getTotalDuration(): number {
    let total = 0;
    let current = this.head;
    
    while (current) {
      total += current.lesson.duration;
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
    return this.tail?.id === lessonId;
  }
}
