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
 
  // Get start time from eventData
  getStartTime(eventNode: EventNode): string {
    if (!eventNode.eventData.date) {
      throw new Error(`date is required for lesson ${eventNode.lessonId}`);
    }
    const date = new Date(eventNode.eventData.date);
    return date.toTimeString().substring(0, 5); // Extract HH:MM
  }

  // Add event to queue (simple - just add to end)
  addToQueue(eventNode: EventNode): void {
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
  }

  // Remove from queue by lesson ID
  removeFromQueue(lessonId: string): void {
    if (!this.head) return;

    // If head is the node to remove
    if (this.head.lessonId === lessonId) {
      this.head = this.head.next;
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
    }
  }

  // Get comprehensive teacher statistics
  getTeacherStats() {
    const eventNodes = this.getAllEvents();
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

  // Check if queue is empty
  isEmpty(): boolean {
    return this.head === null;
  }

  // Get the last event in the queue
  getLastEvent(): EventNode | null {
    if (!this.head) return null;
    
    let current = this.head;
    while (current.next) {
      current = current.next;
    }
    
    return current;
  }

  // Get all events for display (simplified version of getEventNodes)
  getAllEvents(): EventNode[] {
    const events: EventNode[] = [];
    let current = this.head;
    
    while (current) {
      events.push(current);
      current = current.next;
    }
    
    return events;
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
}