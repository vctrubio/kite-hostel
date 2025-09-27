/**
 * TeacherQueue - Manages a linked list of events for a teacher on a specific date
 * Handles time adjustments, duration changes, and event reordering
 * Uses BillboardClass for data access and lesson IDs for identification
 */

import { BillboardClass } from "./BillboardClass";
import {
  parseTimeToMinutes,
  formatMinutesToTime,
} from "@/components/formatters/DateTime";
import { EventStatus, Location } from "@/lib/constants";
import { createEvent, deleteEvent, updateEvent } from "@/actions/event-actions";

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

  // Remove from queue with cascade - deletes event from DB and shifts remaining events
  async removeFromQueueWithCascade(lessonId: string): Promise<{ success: boolean; error?: string }> {
    if (!this.head) return { success: false, error: "Queue is empty" };

    // Find the node to remove and capture its start time
    let nodeToRemove: EventNode | null = null;
    let previousNode: EventNode | null = null;
    let current = this.head;

    while (current) {
      if (current.lessonId === lessonId) {
        nodeToRemove = current;
        break;
      }
      previousNode = current;
      current = current.next;
    }

    if (!nodeToRemove) {
      return { success: false, error: "Event not found in queue" };
    }

    const removedStartTimeMinutes = this.getStartTimeMinutes(nodeToRemove);

    // Delete the event from the database if it has an ID
    if (nodeToRemove.eventData.id) {
      const deleteResult = await deleteEvent(nodeToRemove.eventData.id);
      if (!deleteResult.success) {
        return { success: false, error: `Failed to delete event from database: ${deleteResult.error}` };
      }
    }

    // Remove the node from the linked list
    if (previousNode) {
      previousNode.next = nodeToRemove.next;
    } else {
      // Removing head
      this.head = nodeToRemove.next;
    }

    // If there are events after the removed one, shift them to fill the gap
    const eventsToShift = [];
    current = nodeToRemove.next;
    while (current) {
      eventsToShift.push(current);
      current = current.next;
    }

    if (eventsToShift.length > 0) {
      // Update the start times of all following events to shift them to the removed event's position
      let newStartTimeMinutes = removedStartTimeMinutes;

      for (const event of eventsToShift) {
        // Update the event's start time
        const [datePart] = event.eventData.date.split('T');
        const newHours = Math.floor(newStartTimeMinutes / 60);
        const newMinutes = newStartTimeMinutes % 60;
        const newTime = `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
        const newDateTimeString = `${datePart}T${newTime}:00`;
        
        event.eventData.date = newDateTimeString;

        // Update in database if the event has an ID
        if (event.eventData.id) {
          const updateResult = await updateEvent(event.eventData.id, {
            date: newDateTimeString,
          });
          
          if (!updateResult.success) {
            console.error(`Failed to update event ${event.eventData.id} in database:`, updateResult.error);
          }
        }

        // Calculate start time for next event
        newStartTimeMinutes += event.eventData.duration;
      }
    }

    return { success: true };
  }

  // Get comprehensive teacher statistics
  getTeacherStats() {
    const eventNodes = this.getAllEvents();
    let totalDuration = 0;
    let teacherEarnings = 0;
    let schoolRevenue = 0;
    let eventCount = 0;

    // Calculate totals for all events
    eventNodes.forEach((eventNode) => {
      try {
        totalDuration += eventNode.eventData.duration;
        eventCount++;

        // Calculate total revenue first
        const pkg = eventNode.billboardClass?.booking.package;
        let eventTotalRevenue = 0;
        if (pkg?.price_per_student && pkg?.capacity_students && pkg?.duration) {
          const packageHours = pkg.duration / 60;
          const eventHours = eventNode.eventData.duration / 60;
          const pricePerHourPerStudent = pkg.price_per_student / packageHours;
          eventTotalRevenue = pricePerHourPerStudent * pkg.capacity_students * eventHours;
        }

        // Teacher earnings for this specific event
        const lesson = eventNode.billboardClass.lessons?.find(
          (l) => l.id === eventNode.lessonId,
        );
        let eventTeacherEarning = 0;
        if ((lesson as any)?.commission?.price_per_hour) {
          const hours = eventNode.eventData.duration / 60;
          eventTeacherEarning = (lesson as any).commission.price_per_hour * hours;
          teacherEarnings += eventTeacherEarning;
        }

        // School revenue = Total revenue - Teacher earnings for this event
        schoolRevenue += Math.max(0, eventTotalRevenue - eventTeacherEarning);
      } catch (error) {
        // Skip events with missing data
        console.warn(
          `Skipping event ${eventNode.lessonId} due to missing data:`,
          error,
        );
      }
    });

    return {
      eventCount,
      totalDuration, // in minutes
      totalHours: Math.round((totalDuration / 60) * 10) / 10, // rounded to 1 decimal
      earnings: {
        teacher: teacherEarnings,
        school: schoolRevenue,
        total: teacherEarnings + schoolRevenue,
      },
    };
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

  // Get start time from event node
  getStartTime(eventNode: EventNode): string {
    const eventDate = new Date(eventNode.eventData.date);
    const hours = eventDate.getHours();
    const minutes = eventDate.getMinutes();
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  }

  // Get start time in minutes from event node
  getStartTimeMinutes(eventNode: EventNode): number {
    const eventDate = new Date(eventNode.eventData.date);
    return eventDate.getHours() * 60 + eventDate.getMinutes();
  }

  // Helper method to update event time from datetime string
  private updateEventDateTime(eventNode: EventNode, changeMinutes: number): void {
    const currentDateTime = eventNode.eventData.date;
    if (currentDateTime.includes("T")) {
      const [datePart, timePart] = currentDateTime.split("T");
      const [hours, minutes] = timePart.split(":").map(Number);

      const totalMinutes = hours * 60 + minutes + changeMinutes;
      const newHours = Math.floor(totalMinutes / 60);
      const newMinutes = totalMinutes % 60;

      const newTime = `${newHours.toString().padStart(2, "0")}:${newMinutes.toString().padStart(2, "0")}`;
      eventNode.eventData.date = `${datePart}T${newTime}:00`;
    }
  }

  // Cascade time adjustment through the linked list - affects ALL subsequent nodes
  private cascadeTimeAdjustment(
    startNode: EventNode | null,
    changeMinutes: number,
  ): void {
    let current = startNode;
    while (current) {
      this.updateEventDateTime(current, changeMinutes);
      current = current.next;
    }
  }

  // Restore queue state from a backup
  restoreState(originalEvents: EventNode[]): void {
    this.head = null;
    originalEvents.forEach((event) => {
      const restoredEvent: EventNode = {
        ...event,
        eventData: { ...event.eventData },
        next: null,
      };
      this.addToQueue(restoredEvent);
    });
  }

  // Remove gap by moving the current node earlier to close the gap
  removeGap(lessonId: string): void {
    let current = this.head;
    let previous: EventNode | null = null;

    // Find the target lesson and its previous node
    while (current) {
      if (current.lessonId === lessonId) {
        break;
      }
      previous = current;
      current = current.next;
    }

    if (!current || !previous) {
      // No gap to remove if it's the first node or not found
      return;
    }

    // Calculate the gap
    const previousEndTime =
      this.getStartTimeMinutes(previous) + previous.eventData.duration;
    const currentStartTime = this.getStartTimeMinutes(current);
    const gapMinutes = currentStartTime - previousEndTime;

    if (gapMinutes <= 0) {
      // No gap to remove
      return;
    }

    // Move the current node earlier to close the gap
    this.updateEventDateTime(current, -gapMinutes);

    // Check if we need to cascade the change to maintain the chain
    if (current.next) {
      const newCurrentEndTime =
        this.getStartTimeMinutes(current) + current.eventData.duration;
      const nextStartTime = this.getStartTimeMinutes(current.next);

      // If no gap to next node, cascade the time change
      if (newCurrentEndTime === nextStartTime) {
        this.cascadeTimeAdjustment(current.next, -gapMinutes);
      }
    }
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

  // Move lesson in queue (up/down) - consolidated method
  moveLessonUp(lessonId: string): void {
    this.moveLessonInQueue(lessonId, "up");
  }

  moveLessonDown(lessonId: string): void {
    this.moveLessonInQueue(lessonId, "down");
  }

  // Check if lesson can move earlier without overlap
  canMoveEarlier(lessonId: string): boolean {
    const events = this.getAllEvents();
    const currentIndex = events.findIndex(
      (event) => event.lessonId === lessonId,
    );

    if (currentIndex < 0) return false; // Not found
    if (currentIndex === 0) return true; // First lesson can always move earlier

    const currentEvent = events[currentIndex];
    const previousEvent = events[currentIndex - 1];

    // Calculate if moving 30 minutes earlier would overlap with previous lesson
    const currentStartMinutes = this.getStartTimeMinutes(currentEvent);
    const proposedStartMinutes = currentStartMinutes - 30;
    const previousEndMinutes = this.getStartTimeMinutes(previousEvent) + previousEvent.eventData.duration;

    // Check if moving 30 minutes earlier would overlap with previous lesson
    return proposedStartMinutes >= previousEndMinutes;
  }

  // Check if lesson can move later (time bounds check)
  canMoveLater(lessonId: string): boolean {
    const events = this.getAllEvents();
    const currentEvent = events.find(event => event.lessonId === lessonId);
    
    if (!currentEvent) return false;
    
    const currentTimeMinutes = this.getStartTimeMinutes(currentEvent);
    return currentTimeMinutes < 1380; // Before 23:00
  }

  // Get nodes for schedule manipulation (similar to TeacherSchedule.getNodes())
  getNodes(): any[] {
    const nodes: any[] = [];
    let current = this.head;

    while (current) {
      nodes.push({
        id: current.id,
        type: "event",
        startTime: this.getStartTime(current),
        duration: current.eventData.duration,
        eventData: {
          lessonId: current.lessonId,
        },
      });
      current = current.next;
    }

    return nodes;
  }


  // Adjust lesson duration
  adjustLessonDuration(lessonId: string, increment: boolean): void {
    let current = this.head;
    while (current) {
      if (current.lessonId === lessonId) {
        const change = increment ? 30 : -30;
        const oldDuration = current.eventData.duration;

        // Make the duration change
        current.eventData.duration = Math.max(
          30,
          current.eventData.duration + change,
        );
        const actualChange = current.eventData.duration - oldDuration;

        // If duration actually changed, cascade to ALL subsequent events
        if (actualChange !== 0 && current.next) {
          this.cascadeTimeAdjustment(current.next, actualChange);
        }
        break;
      }
      current = current.next;
    }
  }

  // Adjust lesson time
  adjustLessonTime(lessonId: string, increment: boolean): void {
    let current = this.head;
    while (current) {
      if (current.lessonId === lessonId) {
        const change = increment ? 30 : -30;

        // Adjust the lesson's start time
        this.updateEventDateTime(current, change);

        // Always cascade the time change to ALL subsequent events
        if (current.next) {
          this.cascadeTimeAdjustment(current.next, change);
        }
        break;
      }
      current = current.next;
    }
  }

  // Move lesson in queue
  moveLessonInQueue(lessonId: string, direction: "up" | "down"): void {
    const events = this.getAllEvents();
    const currentIndex = events.findIndex(
      (event) => event.lessonId === lessonId,
    );

    if (currentIndex === -1) return;

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= events.length) return;

    // Store the start time of the earlier position (the one that will keep its time)
    const earlierIndex = Math.min(currentIndex, newIndex);
    const earlierEvent = events[earlierIndex];
    const preservedStartTimeMinutes = this.getStartTimeMinutes(earlierEvent);

    // Swap events
    [events[currentIndex], events[newIndex]] = [
      events[newIndex],
      events[currentIndex],
    ];

    // Rebuild the linked list
    this.head = null;
    events.forEach((event) => {
      event.next = null;
      this.addToQueue(event);
    });

    // Recalculate start times starting from the preserved time
    this.recalculateStartTimesFromPosition(
      earlierIndex,
      preservedStartTimeMinutes,
    );
  }

  // Recalculate start times from a specific position with a given start time
  private recalculateStartTimesFromPosition(
    startIndex: number,
    startTimeMinutes: number,
  ): void {
    const events = this.getAllEvents();
    let currentTimeMinutes = startTimeMinutes;

    for (let i = startIndex; i < events.length; i++) {
      const event = events[i];

      // Update event's start time
      const [datePart] = event.eventData.date.split("T");
      const newHours = Math.floor(currentTimeMinutes / 60);
      const newMinutes = currentTimeMinutes % 60;
      const newTime = `${newHours.toString().padStart(2, "0")}:${newMinutes.toString().padStart(2, "0")}`;
      event.eventData.date = `${datePart}T${newTime}:00`;

      // Calculate start time for next event (current start + current duration)
      currentTimeMinutes += event.eventData.duration;
    }
  }

  // Get schedule info
  getSchedule() {
    return {
      teacherId: this.teacher.id,
      teacherName: this.teacher.name,
    };
  }

  // Add event action - creates event and adds to queue
  async addEventAction(
    billboardClass: BillboardClass,
    controller: {
      submitTime: string;
      location: Location;
      durationCapOne: number;
      durationCapTwo: number;
      durationCapThree: number;
    },
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Find a lesson with teacher assignment from the billboard class
      const lessonWithTeacher = billboardClass.lessons.find(
        (lesson) => lesson.teacher?.id === this.teacher.id,
      );
      if (!lessonWithTeacher) {
        return {
          success: false,
          error: `No lesson found with teacher assignment for teacher: ${this.teacher.name}`,
        };
      }

      // Determine start time based on queue state
      let eventTime: string;
      const lastEvent = this.getLastEvent();

      if (!lastEvent) {
        // Use controller submit time if queue is empty
        eventTime = controller.submitTime;
      } else {
        // Find the next available slot after the last event
        const lastEventStart = this.getStartTime(lastEvent);
        const lastEventStartMinutes = parseTimeToMinutes(lastEventStart);
        const lastEventEndMinutes =
          lastEventStartMinutes + lastEvent.eventData.duration;
        eventTime = formatMinutesToTime(lastEventEndMinutes);
      }

      // Determine duration based on package student capacity
      const studentCapacity = billboardClass.booking.package.capacity_students;
      let eventDuration: number;

      if (studentCapacity === 1) {
        eventDuration = controller.durationCapOne;
      } else if (studentCapacity === 2) {
        eventDuration = controller.durationCapTwo;
      } else {
        eventDuration = controller.durationCapThree;
      }

      // Create the event
      const result = await createEvent({
        lessonId: lessonWithTeacher.id,
        date: this.date,
        startTime: eventTime,
        durationMinutes: eventDuration,
        location: controller.location,
        status: "planned",
      });

      if (result.success) {
        console.log("Event created successfully:", result.data);
        return { success: true };
      } else {
        console.error("Failed to create event:", result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error("Error in addEventAction:", error);
      return { success: false, error: "Failed to create event" };
    }
  }
}
