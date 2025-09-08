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
import { createEvent } from "@/actions/event-actions";

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

        // Teacher earnings
        const lesson = eventNode.billboardClass.lessons?.find(
          (l) => l.id === eventNode.lessonId,
        );
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
          schoolRevenue +=
            pricePerHourPerStudent * pkg.capacity_students * eventHours;
        }
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

  // Cascade time adjustment through the linked list
  private cascadeTimeAdjustment(
    startNode: EventNode | null,
    changeMinutes: number,
  ): void {
    let current = startNode;

    while (current) {
      // Adjust current node's start time using local datetime manipulation
      const currentDateTime = current.eventData.date;
      if (currentDateTime.includes("T")) {
        const [datePart, timePart] = currentDateTime.split("T");
        const [hours, minutes] = timePart.split(":").map(Number);

        const totalMinutes = hours * 60 + minutes + changeMinutes;
        const newHours = Math.floor(totalMinutes / 60);
        const newMinutes = totalMinutes % 60;

        const newTime = `${newHours.toString().padStart(2, "0")}:${newMinutes.toString().padStart(2, "0")}`;
        current.eventData.date = `${datePart}T${newTime}:00`;
      }

      // Check if we need to continue cascading
      if (current.next) {
        const currentEndTime =
          this.getStartTimeMinutes(current) + current.eventData.duration;
        const nextStartTime = this.getStartTimeMinutes(current.next);

        // If there's a gap, stop cascading
        if (currentEndTime !== nextStartTime) {
          break;
        }
      }

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

    // Move the current node earlier to close the gap using local datetime manipulation
    const currentDateTime = current.eventData.date;
    if (currentDateTime.includes("T")) {
      const [datePart, timePart] = currentDateTime.split("T");
      const [hours, minutes] = timePart.split(":").map(Number);

      const totalMinutes = hours * 60 + minutes - gapMinutes;
      const newHours = Math.floor(totalMinutes / 60);
      const newMinutes = totalMinutes % 60;

      const newTime = `${newHours.toString().padStart(2, "0")}:${newMinutes.toString().padStart(2, "0")}`;
      current.eventData.date = `${datePart}T${newTime}:00`;
    }

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

  // Apply global time offset to all events
  applyGlobalTimeOffset(offsetMinutes: number): EventNode[] {
    const updatedEvents: EventNode[] = [];
    let current = this.head;

    while (current) {
      const originalDate = new Date(current.eventData.date);
      const newDate = new Date(
        originalDate.getTime() + offsetMinutes * 60 * 1000,
      );

      const updatedEvent: EventNode = {
        ...current,
        eventData: {
          ...current.eventData,
          date: newDate.toISOString(),
        },
      };

      updatedEvents.push(updatedEvent);
      current = current.next;
    }

    return updatedEvents;
  }

  // Adjust lesson duration
  adjustLessonDuration(lessonId: string, increment: boolean): void {
    let current = this.head;
    while (current) {
      if (current.lessonId === lessonId) {
        const change = increment ? 30 : -30;
        const oldDuration = current.eventData.duration;

        // Check if there was a connection BEFORE the change
        let wasConnected = false;
        if (current.next) {
          const oldEndTime = this.getStartTimeMinutes(current) + oldDuration;
          const nextStartTime = this.getStartTimeMinutes(current.next);
          wasConnected = oldEndTime === nextStartTime;
        }

        // Make the duration change
        current.eventData.duration = Math.max(
          30,
          current.eventData.duration + change,
        );
        const actualChange = current.eventData.duration - oldDuration;

        // If there was a connection and duration actually changed, cascade the change
        if (actualChange !== 0 && wasConnected && current.next) {
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

        // Check if there was a connection BEFORE the change
        let wasConnected = false;
        if (current.next) {
          const oldEndTime =
            this.getStartTimeMinutes(current) + current.eventData.duration;
          const nextStartTime = this.getStartTimeMinutes(current.next);
          wasConnected = oldEndTime === nextStartTime;
        }

        // Work with local datetime string directly to avoid timezone conversion
        const currentDateTime = current.eventData.date;
        if (currentDateTime.includes("T")) {
          // Parse as local datetime: "2024-01-15T14:00:00"
          const [datePart, timePart] = currentDateTime.split("T");
          const [hours, minutes] = timePart.split(":").map(Number);

          const totalMinutes = hours * 60 + minutes + change;
          const newHours = Math.floor(totalMinutes / 60);
          const newMinutes = totalMinutes % 60;

          // Create new local datetime string
          const newTime = `${newHours.toString().padStart(2, "0")}:${newMinutes.toString().padStart(2, "0")}`;
          current.eventData.date = `${datePart}T${newTime}:00`;
        }

        // If there was a connection, cascade the time change to maintain it
        if (wasConnected && current.next) {
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
