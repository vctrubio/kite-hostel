/**
 * TeacherQueue - Manages a linked list of events for a teacher on a specific date
 * Handles time adjustments, duration changes, and event reordering
 * Uses BillboardClass for data access and lesson IDs for identification
 */

import { addMinutes } from 'date-fns';
import { BillboardClass } from './BillboardClass';
import { formatTime } from '@/components/formatters/DateTime';
import { EventStatus, Location } from '@/lib/constants';

export interface EventData {
  id?: string; // Event ID if it exists, undefined if dragged from StudentBookingColumn
  date: string; // ISO timestamp
  duration: number; // Duration in minutes
  location: Location; // Location enum value
  status: EventStatus;
}

export interface EventNode {
  id: string | null; // Unique node ID for React keys, null for dragged bookings
  lessonId: string; // Always exists from BillboardClass
  billboardClass: BillboardClass; // Reference for calculations
  eventData: EventData;
  hasGap?: boolean;
  timeAdjustment?: number; // Manual time adjustment in minutes
  next: EventNode | null;
}

export interface TeacherInfo {
  id: string;
  name: string;
}

export class TeacherQueue {
  private head: EventNode | null = null;
  public teacher: TeacherInfo;
  
  constructor(
    teacher: TeacherInfo,
    private date: string,
  ) {
    this.teacher = teacher;
  }

  
  // Getter methods using EventNode
  getStudents(eventNode: EventNode): string[] {
    return eventNode.billboardClass.getStudentNames();
  }
  
  // Get start time from eventData
  getStartTime(eventNode: EventNode): string {
    if (!eventNode.eventData.date) {
      throw new Error(`date is required for lesson ${eventNode.lessonId}`);
    }
    const date = new Date(eventNode.eventData.date);
    return date.toTimeString().substring(0, 5); // Extract HH:MM
  }

  getRemainingMinutes(eventNode: EventNode): number {
    if (!eventNode.billboardClass?.booking.package) {
      throw new Error(`package information is required for lesson ${eventNode.lessonId}`);
    }
    return eventNode.billboardClass.booking.package.duration;
  }

  getLocation(eventNode: EventNode): Location {
    if (!eventNode.eventData.location) {
      throw new Error(`location is required for lesson ${eventNode.lessonId}`);
    }
    return eventNode.eventData.location;
  }

  // Get comprehensive teacher statistics
  getTeacherStats() {
    const eventNodes = this.getEventNodes();
    let totalDuration = 0;
    let teacherEarnings = 0;
    let schoolRevenue = 0;
    let eventCount = 0;
    
    // Calculate totals for all events
    eventNodes.forEach(eventNode => {
      try {
        totalDuration += eventNode.eventData.duration;
        eventCount++;
        
        // Teacher earnings
        const lesson = eventNode.billboardClass.lessons?.find(l => l.id === eventNode.lessonId);
        if (lesson?.commission?.price_per_hour) {
          const hours = eventNode.eventData.duration / 60;
          teacherEarnings += lesson.commission.price_per_hour * hours;
        }
        
        // School revenue
        const pkg = eventNode.billboardClass?.booking.package;
        if (pkg?.price_per_student && pkg?.capacity_students && pkg?.duration) {
          const packageHours = pkg.duration / 60;
          const eventHours = eventNode.eventData.duration / 60;
          const pricePerHourPerStudent = pkg.price_per_student / packageHours;
          schoolRevenue += pricePerHourPerStudent * pkg.capacity_students * eventHours;
        }
      } catch (error) {
        // Skip events with missing data
        console.warn(`Skipping event ${eventNode.lessonId} due to missing data:`, error);
      }
    });
    
    return {
      eventCount,
      totalDuration, // in minutes
      totalHours: Math.round(totalDuration / 60 * 10) / 10, // rounded to 1 decimal
      earnings: {
        teacher: teacherEarnings,
        school: schoolRevenue,
        total: teacherEarnings + schoolRevenue
      }
    };
  }
  
  // Individual event financial calculations (for detailed views)
  getEventEarnings(eventNode: EventNode) {
    let teacherEarnings = 0;
    let schoolRevenue = 0;
    
    try {
      // Teacher earnings
      const lesson = eventNode.billboardClass.lessons?.find(l => l.id === eventNode.lessonId);
      if (lesson?.commission?.price_per_hour) {
        const hours = eventNode.eventData.duration / 60;
        teacherEarnings = lesson.commission.price_per_hour * hours;
      }
      
      // School revenue
      const pkg = eventNode.billboardClass?.booking.package;
      if (pkg?.price_per_student && pkg?.capacity_students && pkg?.duration) {
        const packageHours = pkg.duration / 60;
        const eventHours = eventNode.eventData.duration / 60;
        const pricePerHourPerStudent = pkg.price_per_student / packageHours;
        schoolRevenue = pricePerHourPerStudent * pkg.capacity_students * eventHours;
      }
    } catch (error) {
      console.warn(`Error calculating earnings for event ${eventNode.lessonId}:`, error);
    }
    
    return {
      teacher: teacherEarnings,
      school: schoolRevenue,
      total: teacherEarnings + schoolRevenue
    };
  }
  // Add event node to end of queue
  addEventNode(eventNode: EventNode): void {
    if (!this.head) {
      this.head = eventNode;
    } else {
      // Find the last node
      let current = this.head;
      while (current.next) {
        current = current.next;
      }
      current.next = eventNode;
    }

    this.recalculateTimes();
  }

  // Remove event node from queue by lesson ID
  removeLesson(lessonId: string): void {
    if (!this.head) return;

    // If head is the node to remove
    if (this.head.lessonId === lessonId) {
      this.head = this.head.next;
      this.recalculateTimes();
      return;
    }

    // Find the node before the one to remove
    let current = this.head;
    while (current.next && current.next.lessonId !== lessonId) {
      current = current.next;
    }

    // If found, remove it
    if (current.next) {
      current.next = current.next.next;
      this.recalculateTimes();
    }
  }

  // Move event up in queue (earlier)
  moveUp(lessonId: string): void {
    if (!this.head) return;

    // Can't move head up
    if (this.head.lessonId === lessonId) return;

    // Find the node before the one we want to move up
    let beforePrev: EventNode | null = null;
    let prev = this.head;
    
    while (prev.next && prev.next.lessonId !== lessonId) {
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
    
    let prev: EventNode | null = null;
    let current = this.head;
    
    // Find the node to move down
    while (current && current.lessonId !== lessonId) {
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
    const node = this.findEventNodeByLessonId(lessonId);
    if (!node) return;

    const adjustment = increment ? 15 : -15; // 15-minute increments
    const newDuration = Math.max(15, node.eventData.duration + adjustment);
    
    // Don't exceed remaining minutes
    const remainingMinutes = this.getRemainingMinutes(node);
    if (newDuration <= remainingMinutes) {
      node.eventData.duration = newDuration;
      this.recalculateTimes();
    }
  }

  // Adjust lesson start time
  adjustTime(lessonId: string, increment: boolean): void {
    const node = this.findEventNodeByLessonId(lessonId);
    if (!node) return;

    const adjustment = increment ? 15 : -15; // 15-minute increments
    node.timeAdjustment = (node.timeAdjustment || 0) + adjustment;
    this.recalculateTimes();
  }

  // Recalculate all lesson times based on queue order
  private recalculateTimes(): void {
    let currentNode = this.head;

    while (currentNode) {
      const isFirst = currentNode === this.head;
      
      if (isFirst) {
        // For the first node, use the original event time
        if (currentNode.eventData.date) {
          const originalTime = formatTime(currentNode.eventData.date);
          const originalTimeMinutes = this.parseTime(originalTime);
          const adjustedTime = originalTimeMinutes + (currentNode.timeAdjustment || 0);
          
          currentNode.eventData.date = this.createDateTime(adjustedTime);
        }
        currentNode.hasGap = false;
      } else {
        // For subsequent nodes, calculate based on previous node's end time
        const prevNode = this.findPrevNode(currentNode);
        if (prevNode) {
          const prevStartTime = this.getStartTime(prevNode);
          const prevEndTime = this.parseTime(prevStartTime) + prevNode.eventData.duration;
          const adjustedTime = prevEndTime + (currentNode.timeAdjustment || 0);
          
          // Set scheduled times
          currentNode.eventData.date = this.createDateTime(adjustedTime);
          
          // Check for gaps
          currentNode.hasGap = adjustedTime > prevEndTime;
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

  // Get all event nodes as array
  getEventNodes(): EventNode[] {
    const nodes: EventNode[] = [];
    let current = this.head;
    
    while (current) {
      nodes.push(current);
      current = current.next;
    }
    
    return nodes;
  }

  // Get event node by lesson ID
  getEventNode(lessonId: string): EventNode | null {
    return this.findEventNodeByLessonId(lessonId);
  }
  
  // Helper: Find event node by lesson ID
  private findEventNodeByLessonId(lessonId: string): EventNode | null {
    let current = this.head;
    while (current) {
      if (current.lessonId === lessonId) return current;
      current = current.next;
    }
    return null;
  }
  
  // Helper: Find previous node
  private findPrevNode(targetNode: EventNode): EventNode | null {
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
    return this.head ? this.head.lessonId !== lessonId : false;
  }

  // Check if lesson can move down
  canMoveDown(lessonId: string): boolean {
    const node = this.findEventNodeByLessonId(lessonId);
    return node ? node.next !== null : false;
  }

  // Get flag time - returns actual head time or null if no events
  getFlagTime(): string | null {
    if (!this.head) return null;
    try {
      return this.getStartTime(this.head);
    } catch {
      return null;
    }
  }

  // Get total duration
  getTotalDuration(): number {
    let total = 0;
    let current = this.head;
    
    while (current) {
      total += current.eventData.duration;
      current = current.next;
    }
    
    return total;
  }

  // Check if lesson is first
  isFirst(lessonId: string): boolean {
    return this.head?.lessonId === lessonId;
  }

  // Check if lesson is last
  isLast(lessonId: string): boolean {
    const node = this.findEventNodeByLessonId(lessonId);
    return node ? node.next === null : false;
  }
}
