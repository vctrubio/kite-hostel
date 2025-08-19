/**
 * WhiteboardClass - Business Logic Controller for Kite Hostel Bookings
 * 
 * This class encapsulates all business rules and logic for managing:
 * - Bookings (date ranges, students, packages)
 * - Lessons (teachers, status progression)
 * - Events (kite sessions, duration tracking)
 * - Progress tracking and completion workflows
 */

import { 
  BookingStatus, 
  LessonStatus, 
  EventStatus, 
  COMPLETED_EVENT_STATUSES,
  PLANNED_EVENT_STATUSES
} from '@/lib/constants';
import { 
  type BookingData,
  type LessonData,
  type EventData,
  type StudentData
} from '@/backend/types';

/**
 * WhiteboardClass - Main business logic controller
 * 
 * Each instance represents a single booking with all its associated
 * lessons and events. Provides methods for safe manipulation and
 * progress tracking while enforcing business rules.
 */
export class WhiteboardClass {
  private booking: BookingData;

  constructor(bookingData: BookingData) {
    this.booking = { ...bookingData };
  }

  // ================================
  // CORE GETTERS - Used by UI
  // ================================

  /**
   * Get the booking ID
   */
  getId(): string {
    return this.booking.id;
  }

  /**
   * Get current booking status
   */
  getStatus(): string {
    return this.booking.status;
  }

  /**
   * Get all students assigned to this booking
   */
  getStudents(): StudentData[] {
    return this.booking.students?.map(bs => bs.student) || [];
  }

  /**
   * Get package information
   */
  getPackage() {
    return this.booking.package;
  }

  /**
   * Get all lessons for this booking
   */
  getLessons(): LessonData[] {
    return this.booking.lessons || [];
  }

  // ================================
  // PROGRESS CALCULATION
  // ================================

  /**
   * Calculate total minutes used from completed events
   */
  getUsedMinutes(): number {
    const allEvents = this.getLessons().flatMap(lesson => lesson.events || []);
    const completedEvents = allEvents.filter(event => COMPLETED_EVENT_STATUSES.includes(event.status));
    return completedEvents.reduce(
      (total, event) => total + (event.duration || 0),
      0
    );
  }

  /**
   * Calculate planned minutes from planned/TBC events
   */
  getPlannedMinutes(): number {
    const allEvents = this.getLessons().flatMap(lesson => lesson.events || []);
    const plannedEvents = allEvents.filter(event => PLANNED_EVENT_STATUSES.includes(event.status));
    return plannedEvents.reduce(
      (total, event) => total + (event.duration || 0),
      0
    );
  }

  /**
   * Calculate minutes by event status for detailed progress tracking
   * Returns breakdown of minutes for different event statuses
   */
  calculateBookingLessonEventMinutes(): {
    completed: number;
    planned: number;
    tbc: number;
    cancelled: number;
    total: number;
  } {
    const allEvents = this.getLessons().flatMap(lesson => lesson.events || []);
    
    const completedMinutes = allEvents
      .filter(event => event.status === 'completed')
      .reduce((total, event) => total + (event.duration || 0), 0);
    
    const plannedMinutes = allEvents
      .filter(event => event.status === 'planned')
      .reduce((total, event) => total + (event.duration || 0), 0);
    
    const tbcMinutes = allEvents
      .filter(event => event.status === 'tbc')
      .reduce((total, event) => total + (event.duration || 0), 0);
    
    const cancelledMinutes = allEvents
      .filter(event => event.status === 'cancelled')
      .reduce((total, event) => total + (event.duration || 0), 0);
    
    return {
      completed: completedMinutes,
      planned: plannedMinutes,
      tbc: tbcMinutes,
      cancelled: cancelledMinutes,
      total: completedMinutes + plannedMinutes + tbcMinutes + cancelledMinutes
    };
  }

  /**
   * Get total package duration in minutes
   */
  getTotalMinutes(): number {
    return this.booking.package?.duration || 0;
  }

  /**
   * Calculate completion percentage (0-100)
   */
  getCompletionPercentage(): number {
    const total = this.getTotalMinutes();
    if (total === 0) return 0;
    
    return Math.min((this.getUsedMinutes() / total) * 100, 100);
  }

  /**
   * Check if booking is ready for completion
   * (progress complete but status not yet completed)
   */
  isReadyForCompletion(): boolean {
    const isProgressComplete = this.getUsedMinutes() >= this.getTotalMinutes() && this.getTotalMinutes() > 0;
    return isProgressComplete && this.booking.status !== 'completed';
  }

  /**
   * Get remaining minutes for the booking
   */
  getRemainingMinutes(): number {
    return this.getTotalMinutes() - this.getUsedMinutes();
  }

  // ================================
  // ATTENTION/VALIDATION METHODS
  // ================================

  /**
   * Check if booking needs attention (over-booked, ready for completion, etc.)
   */
  needsAttention(): { hasIssues: boolean; issues: string[] } {
    const issues: string[] = [];
    
    // Check for over-booking
    const totalScheduled = this.getUsedMinutes() + this.getPlannedMinutes();
    if (totalScheduled > this.getTotalMinutes()) {
      const overBy = totalScheduled - this.getTotalMinutes();
      issues.push(`Over-booked by ${overBy} minutes`);
    }
    
    // Check for ready completion
    if (this.isReadyForCompletion()) {
      issues.push('Ready for completion but status not updated');
    }

    return {
      hasIssues: issues.length > 0,
      issues
    };
  }
}

// ================================
// STATIC UTILITY FUNCTIONS - Used by UI
// ================================

/**
 * Group lessons by teacher for display purposes
 */
export function groupLessonsByTeacher(lessons: any[]) {
  return lessons.reduce((acc: any[], lesson: any) => {
    const teacherId = lesson.teacher?.id || 'unassigned';
    const teacherName = lesson.teacher?.name || 'Unassigned';
    
    let teacherGroup = acc.find(group => group.teacherId === teacherId);
    
    if (!teacherGroup) {
      teacherGroup = {
        teacherId,
        teacherName,
        lessons: []
      };
      acc.push(teacherGroup);
    }
    
    teacherGroup.lessons.push(lesson);
    
    return acc;
  }, []);
}

/**
 * Filter available lessons that don't have events for the selected date
 */
export function getAvailableLessons(lessons: any[], selectedDate: string) {
  return lessons.filter(lesson => {
    // Only show planned lessons
    if (lesson.status !== 'planned') return false;
    
    // Check if lesson already has event for selected date
    const hasEventForDate = lesson.events?.some((event: any) => {
      if (!event.date) return false;
      const eventDate = new Date(event.date);
      const filterDate = new Date(selectedDate);
      eventDate.setHours(0, 0, 0, 0);
      filterDate.setHours(0, 0, 0, 0);
      return eventDate.getTime() === filterDate.getTime();
    });
    
    return !hasEventForDate;
  });
}

/**
 * Calculate simple statistics for lessons
 */
export function calculateLessonStats(teacherLessons: any[]) {
  const availableLessons = teacherLessons.filter(lesson => lesson.status === 'planned').length;
  const lessonsWithEvents = teacherLessons.filter(lesson => 
    lesson.status === 'planned' && lesson.events && lesson.events.length > 0
  ).length;
  
  return {
    availableLessons,
    lessonsWithEvents
  };
}

/**
 * Extract student names from booking data - DRY utility
 */
export function extractStudentNames(booking: any): string {
  return booking?.students?.map((bs: any) => bs.student?.name).filter(Boolean).join(', ') || 'No students';
}

/**
 * Extract student objects from booking data - DRY utility
 */
export function extractStudents(booking: any): Array<{id: string; name: string}> {
  return booking?.students?.map((s: any) => ({
    id: s.student?.id || '',
    name: s.student?.name || 'Unknown'
  })) || [];
}

// ================================
// FACTORY FUNCTIONS
// ================================

/**
 * Factory function to create WhiteboardClass instances from API data
 * This is used in the whiteboard-actions.ts
 */
export function createBookingClasses(bookingsData: BookingData[]): WhiteboardClass[] {
  return bookingsData.map(booking => new WhiteboardClass(booking));
}

/**
 * Helper function to get a specific booking class by ID
 */
export function getBookingClassById(
  bookingClasses: WhiteboardClass[], 
  bookingId: string
): WhiteboardClass | null {
  return bookingClasses.find(booking => booking.getId() === bookingId) || null;
}