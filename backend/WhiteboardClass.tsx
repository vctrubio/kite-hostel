/**
 * WhiteboardClass - Business Logic Controller for Kite Hostel Bookings
 * 
 * This class encapsulates all business rules and logic for managing:
 * - Bookings (date ranges, students, packages)
 * - Lessons (teachers, status progression)
 * - Events (kite sessions, duration tracking)
 * - Progress tracking and completion workflows
 * 
 * Key Business Rules:
 * 1. One active lesson per booking at a time
 * 2. Events can only be added to active lessons
 * 3. Booking completion requires all package hours to be used
 * 4. No modifications allowed on completed bookings
 * 
 * Status Flow:
 * Booking: planned → active → completed
 * Lesson: planned → rest → completed → delegated
 * Event: planned → tbc → completed → cancelled
 */

import { 
  BookingStatus, 
  LessonStatus, 
  EventStatus, 
  getBookingStatusColor,
  PROGRESS_BAR_DEFAULTS,
  ACTIVE_LESSON_STATUSES,
  COMPLETED_EVENT_STATUSES,
  PLANNED_EVENT_STATUSES
} from '@/lib/constants';
import { 
  type BookingData,
  type LessonData,
  type EventData,
  type StudentData,
  type TeacherData,
  type ValidationResult,
  type TeacherEvents
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
  // GETTERS - Safe data access
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
   * Get booking date range
   */
  getDateRange(): { start: string; end: string } {
    return {
      start: this.booking.date_start,
      end: this.booking.date_end,
    };
  }

  /**
   * Get all students assigned to this booking (direct access via relations)
   */
  getStudents(): StudentData[] {
    return this.booking.students?.map(bs => bs.student) || [];
  }

  /**
   * Get student names as comma-separated string
   */
  getStudentNames(): string {
    return this.getStudents().map(student => student.name).join(', ') || 'No students';
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

  /**
   * Get the currently active lesson (planned or rest status)
   * Business Rule: Only one lesson can be active at a time
   */
  getActiveLesson(): LessonData | null {
    const activeLessons = this.getLessons().filter(
      lesson => ACTIVE_LESSON_STATUSES.includes(lesson.status)
    );
    
    // Return first active lesson (there should only be one)
    return activeLessons[0] || null;
  }

  /**
   * Get all events across all lessons
   */
  getAllEvents(): EventData[] {
    return this.getLessons().flatMap(lesson => lesson.events || []);
  }

  /**
   * Get only completed events (for progress calculation)
   */
  getCompletedEvents(): EventData[] {
    return this.getAllEvents().filter(event => COMPLETED_EVENT_STATUSES.includes(event.status));
  }

  /**
   * Get planned or TBC events (for progress preview)
   */
  getPlannedEvents(): EventData[] {
    return this.getAllEvents().filter(
      event => PLANNED_EVENT_STATUSES.includes(event.status)
    );
  }

  // ================================
  // PROGRESS CALCULATION
  // ================================

  /**
   * Calculate total minutes used from completed events
   */
  getUsedMinutes(): number {
    return this.getCompletedEvents().reduce(
      (total, event) => total + (event.duration || 0),
      0
    );
  }

  /**
   * Calculate planned minutes from planned/TBC events
   */
  getPlannedMinutes(): number {
    return this.getPlannedEvents().reduce(
      (total, event) => total + (event.duration || 0),
      0
    );
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
   * Check if booking has used all package hours
   */
  isProgressComplete(): boolean {
    return this.getUsedMinutes() >= this.getTotalMinutes() && this.getTotalMinutes() > 0;
  }

  /**
   * Check if booking is ready for completion
   * (progress complete but status not yet completed)
   */
  isReadyForCompletion(): boolean {
    return this.isProgressComplete() && this.booking.status !== 'completed';
  }

  /**
   * Get remaining minutes for the booking
   */
  getRemainingMinutes(): number {
    return this.getTotalMinutes() - this.getUsedMinutes();
  }

  /**
   * Extract teacher info safely from active lesson
   */
  getTeacherInfo(): {id: string; name: string} | null {
    const activeLesson = this.getActiveLesson();
    if (!activeLesson?.teacher) return null;
    
    return {
      id: activeLesson.teacher.id,
      name: activeLesson.teacher.name
    };
  }

  /**
   * Check if lesson has event for specific date
   */
  hasEventForDate(lessonId: string, selectedDate: string): boolean {
    const lesson = this.getLessons().find(l => l.id === lessonId);
    if (!lesson) return false;

    const selectedDateObj = new Date(selectedDate);
    selectedDateObj.setHours(0, 0, 0, 0);
    
    const events = lesson.events || [];
    return events.some((event: any) => {
      if (!event.date) return true; // Events without date are considered active
      
      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate.getTime() === selectedDateObj.getTime();
    });
  }

  /**
   * Get earliest event time from all events
   */
  getEarliestEventTime(): string | null {
    const events = this.getAllEvents();
    const eventTimes = events
      .map(event => event.date)
      .filter(Boolean)
      .sort();
    
    if (eventTimes.length === 0) return null;
    
    try {
      const date = new Date(eventTimes[0]);
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    } catch {
      return eventTimes[0];
    }
  }

  // ================================
  // VALIDATION METHODS
  // ================================

  /**
   * Validate if a new lesson can be added
   * Rules:
   * - Booking must not be completed
   * - No existing active lessons (planned/rest)
   * - Must have package assigned
   */
  canAddLesson(): ValidationResult {
    if (this.booking.status === 'completed') {
      return {
        isValid: false,
        message: 'Cannot add lesson to completed booking',
        code: 'BOOKING_COMPLETED'
      };
    }

    if (!this.booking.package) {
      return {
        isValid: false,
        message: 'Cannot add lesson: no package assigned',
        code: 'NO_PACKAGE'
      };
    }

    const activeLesson = this.getActiveLesson();
    if (activeLesson) {
      return {
        isValid: false,
        message: `Cannot add lesson: existing lesson ${activeLesson.id} is still ${activeLesson.status}`,
        code: 'ACTIVE_LESSON_EXISTS'
      };
    }

    return {
      isValid: true,
      message: 'Can add lesson'
    };
  }

  /**
   * Validate if an event can be added to a lesson
   * Rules:
   * - Lesson must exist and be active (planned/rest)
   * - Booking must not be completed
   * - Must not exceed package hours
   */
  canAddEvent(lessonId: string, eventDuration: number = 0): ValidationResult {
    if (this.booking.status === 'completed') {
      return {
        isValid: false,
        message: 'Cannot add event to completed booking',
        code: 'BOOKING_COMPLETED'
      };
    }

    const lesson = this.getLessons().find(l => l.id === lessonId);
    if (!lesson) {
      return {
        isValid: false,
        message: 'Lesson not found',
        code: 'LESSON_NOT_FOUND'
      };
    }

    if (!ACTIVE_LESSON_STATUSES.includes(lesson.status)) {
      return {
        isValid: false,
        message: `Cannot add event: lesson is ${lesson.status}`,
        code: 'LESSON_NOT_ACTIVE'
      };
    }

    // Check if adding this event would exceed package duration
    const totalUsed = this.getUsedMinutes() + this.getPlannedMinutes() + eventDuration;
    const packageDuration = this.getTotalMinutes();
    
    if (packageDuration > 0 && totalUsed > packageDuration) {
      return {
        isValid: false,
        message: `Cannot add event: would exceed package limit by ${totalUsed - packageDuration} minutes`,
        code: 'EXCEEDS_PACKAGE_LIMIT'
      };
    }

    return {
      isValid: true,
      message: 'Can add event'
    };
  }

  /**
   * Validate if booking can be marked as complete
   * Rules:
   * - All package hours must be used
   * - Must not already be completed
   * - Must have at least one completed event
   */
  canCompleteBooking(): ValidationResult {
    if (this.booking.status === 'completed') {
      return {
        isValid: false,
        message: 'Booking is already completed',
        code: 'ALREADY_COMPLETED'
      };
    }

    if (!this.isProgressComplete()) {
      const remaining = this.getTotalMinutes() - this.getUsedMinutes();
      return {
        isValid: false,
        message: `Cannot complete: ${remaining} minutes remaining`,
        code: 'PROGRESS_INCOMPLETE'
      };
    }

    if (this.getCompletedEvents().length === 0) {
      return {
        isValid: false,
        message: 'Cannot complete: no completed events',
        code: 'NO_COMPLETED_EVENTS'
      };
    }

    return {
      isValid: true,
      message: 'Booking can be completed'
    };
  }

  // ================================
  // ACTION METHODS
  // ================================

  /**
   * Add a new lesson to the booking
   * Note: In production, this should call server actions to update the database
   */
  addLesson(teacherId: string): ValidationResult & { lesson?: Partial<LessonData> } {
    const validation = this.canAddLesson();
    if (!validation.isValid) {
      return validation;
    }

    // This should be a server action in production
    console.log(`Would add lesson with teacher ${teacherId} to booking ${this.booking.id}`);

    return {
      isValid: true,
      message: 'Lesson would be added (server action needed)',
      lesson: {
        id: `lesson_${Date.now()}`,
        status: 'planned' as LessonStatus,
        events: []
      }
    };
  }

  /**
   * Add an event to a specific lesson
   * Note: In production, this should call server actions to update the database
   */
  addEventToLesson(
    lessonId: string, 
    eventData: Partial<EventData>
  ): ValidationResult & { event?: Partial<EventData> } {
    const validation = this.canAddEvent(lessonId, eventData.duration || 0);
    if (!validation.isValid) {
      return validation;
    }

    const lesson = this.booking.lessons?.find(l => l.id === lessonId);
    if (!lesson) {
      return {
        isValid: false,
        message: 'Lesson not found'
      };
    }

    // This should be a server action in production
    console.log(`Would add event to lesson ${lessonId}:`, eventData);

    return {
      isValid: true,
      message: 'Event would be added (server action needed)',
      event: {
        id: `event_${Date.now()}`,
        ...eventData
      }
    };
  }

  /**
   * Complete the booking and all its lessons
   * This is the main completion workflow
   */
  async completeBookingAndLessons(): Promise<ValidationResult> {
    const validation = this.canCompleteBooking();
    if (!validation.isValid) {
      return validation;
    }

    try {
      // In real implementation, this would be server actions:
      // 1. Update booking status to 'completed'
      // 2. Update all lesson statuses to 'completed'
      // 3. Trigger any completion workflows (payments, notifications, etc.)
      
      // For now, update local state
      this.booking.status = 'completed';
      this.booking.lessons?.forEach(lesson => {
        if (lesson.status !== 'delegated') {
          lesson.status = 'completed';
        }
      });

      return {
        isValid: true,
        message: 'Booking and lessons completed successfully'
      };
    } catch (error) {
      return {
        isValid: false,
        message: `Failed to complete booking: ${error}`,
        code: 'COMPLETION_ERROR'
      };
    }
  }

  // ================================
  // UTILITY METHODS
  // ================================

  /**
   * Get a summary of the booking for display
   */
  getSummary() {
    return {
      id: this.getId(),
      status: this.getStatus(),
      students: this.getStudents(),
      package: this.getPackage(),
      progress: {
        usedMinutes: this.getUsedMinutes(),
        plannedMinutes: this.getPlannedMinutes(),
        totalMinutes: this.getTotalMinutes(),
        percentage: this.getCompletionPercentage(),
        isComplete: this.isProgressComplete(),
        readyForCompletion: this.isReadyForCompletion()
      },
      lessons: {
        total: this.getLessons().length,
        active: this.getActiveLesson(),
      },
      events: {
        total: this.getAllEvents().length,
        completed: this.getCompletedEvents().length,
        planned: this.getPlannedEvents().length,
      }
    };
  }

  /**
   * Get progress bar data for UI display
   */
  getProgressBarData() {
    const total = this.getTotalMinutes();
    const used = this.getUsedMinutes();
    const planned = this.getPlannedMinutes();
    
    if (total === 0) {
      return PROGRESS_BAR_DEFAULTS;
    }

    const usedPercentage = Math.min((used / total) * 100, 100);
    const totalScheduled = used + planned;
    const isOverBooked = totalScheduled > total;
    
    if (isOverBooked) {
      return {
        usedPercentage,
        plannedPercentage: Math.min(((total - used) / total) * 100, 100 - usedPercentage),
        remainingPercentage: 0,
        isOverBooked: true,
        overBookedPercentage: ((totalScheduled - total) / total) * 100
      };
    }

    const plannedPercentage = (planned / total) * 100;
    const remainingPercentage = Math.max(100 - usedPercentage - plannedPercentage, 0);

    return {
      usedPercentage,
      plannedPercentage,
      remainingPercentage,
      isOverBooked: false,
      overBookedPercentage: 0
    };
  }

  /**
   * Get status color based on booking state
   */
  getStatusColor(): string {
    return getBookingStatusColor(this.booking.status);
  }

  /**
   * Check if booking needs attention (over-booked, missing teacher, etc.)
   */
  needsAttention(): { hasIssues: boolean; issues: string[] } {
    const issues: string[] = [];
    
    // Check for over-booking
    const totalScheduled = this.getUsedMinutes() + this.getPlannedMinutes();
    if (totalScheduled > this.getTotalMinutes()) {
      const overBy = totalScheduled - this.getTotalMinutes();
      issues.push(`Over-booked by ${overBy} minutes`);
      console.log(`🔍 Booking ${this.getId()}: Over-booked by ${overBy}min (used: ${this.getUsedMinutes()}, planned: ${this.getPlannedMinutes()}, total: ${this.getTotalMinutes()})`);
    }
    
    // Check for active lessons without teachers
    const activeLesson = this.getActiveLesson();
    if (activeLesson && !activeLesson.teacher) {
      issues.push('Active lesson missing teacher assignment');
      console.log(`🔍 Booking ${this.getId()}: Active lesson ${activeLesson.id} missing teacher`);
    }
    
    // Check for ready completion
    if (this.isReadyForCompletion()) {
      issues.push('Ready for completion but status not updated');
      console.log(`🔍 Booking ${this.getId()}: Ready for completion (${this.getCompletionPercentage()}% complete, status: ${this.getStatus()})`);
    }
    


    // Debug log when issues are found
    if (issues.length > 0) {
      console.log(`⚠️ Booking ${this.getId()} needs attention:`, issues);
    }

    return {
      hasIssues: issues.length > 0,
      issues
    };
  }

  /**
   * Debug helper: Get detailed information about why this booking needs attention
   */
  getAttentionDetails(): { needsAttention: boolean; details: any } {
    const totalScheduled = this.getUsedMinutes() + this.getPlannedMinutes();
    const activeLesson = this.getActiveLesson();
    
    const details = {
      bookingId: this.getId(),
      status: this.getStatus(),
      isOverBooked: totalScheduled > this.getTotalMinutes(),
      overBookedBy: Math.max(0, totalScheduled - this.getTotalMinutes()),
      usedMinutes: this.getUsedMinutes(),
      plannedMinutes: this.getPlannedMinutes(),
      totalMinutes: this.getTotalMinutes(),
      completionPercentage: this.getCompletionPercentage(),
      isReadyForCompletion: this.isReadyForCompletion(),
      hasActiveLessonWithoutTeacher: activeLesson && !activeLesson.teacher,
      activeLessonId: activeLesson?.id,
      activeLessonTeacher: activeLesson?.teacher?.name,
      completedEventsCount: this.getCompletedEvents().length,
      totalEventsCount: this.getAllEvents().length,
      activeLesson: this.getActiveLesson(),
      issues: this.needsAttention().issues
    };
    
    return {
      needsAttention: this.needsAttention().hasIssues,
      details
    };
  }

  /**
   * Export current booking data
   */
  toJSON(): BookingData {
    return { ...this.booking };
  }

  /**
   * Create a new instance from updated data
   */
  static fromBookingData(data: BookingData): WhiteboardClass {
    return new WhiteboardClass(data);
  }
}

// ================================
// STATIC UTILITY METHODS
// ================================

/**
 * Group events by teacher for display purposes
 */
export function groupEventsByTeacher(events: any[]): any[] {
  return events.reduce((acc: any[], event: any) => {
    const teacherId = event.lesson?.teacher?.id || 'unassigned';
    const teacherName = event.lesson?.teacher?.name || 'Unassigned';
    
    let teacherGroup = acc.find(group => group.teacherId === teacherId);
    
    if (!teacherGroup) {
      teacherGroup = {
        teacherId,
        teacherName,
        events: []
      };
      acc.push(teacherGroup);
    }
    
    teacherGroup.events.push({
      event,
      lesson: event.lesson,
      booking: event.booking
    });
    
    return acc;
  }, []);
}

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
 * Calculate simple statistics for events
 */
export function calculateEventStats(events: any[]) {
  const totalEvents = events.length;
  const completedEvents = events.filter((event: any) => 
    ['completed', 'confirmed'].includes(event.status)
  ).length;
  const plannedEvents = events.filter((event: any) => 
    ['planned', 'tbc'].includes(event.status)
  ).length;
  
  return {
    totalEvents,
    completedEvents,
    plannedEvents
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

/**
 * Extract teacher info safely
 */
export function extractTeacherInfo(lesson: any): {id: string; name: string} {
  return {
    id: lesson?.teacher?.id || 'unassigned',
    name: lesson?.teacher?.name || 'Unassigned'
  };
}

/**
 * Format earliest event time from events array
 */
export function getEarliestEventTime(events: any[]): string {
  const eventTimes = events
    .map(event => event.event?.date || event.date)
    .filter(Boolean)
    .sort();
  
  if (eventTimes.length === 0) return 'No time';
  
  try {
    const date = new Date(eventTimes[0]);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  } catch {
    return eventTimes[0];
  }
}

// ================================
// FACTORY FUNCTIONS
// ================================

/**
 * Factory function to create WhiteboardClass instances from API data
 * This would be used in the whiteboard-actions.ts
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

// ================================
// STATIC ANALYSIS METHODS
// ================================

/**
 * Calculate enhanced statistics across multiple booking classes
 */
export function calculateEnhancedStats(bookingClasses: WhiteboardClass[]) {
  const activeBookings = bookingClasses.filter(booking => booking.getStatus() === 'active').length;
  const completableBookings = bookingClasses.filter(booking => booking.isReadyForCompletion()).length;
  const completedBookings = bookingClasses.filter(booking => booking.getStatus() === 'completed').length;
  
  // Total progress across all bookings
  const totalProgress = bookingClasses.reduce((sum, booking) => {
    return sum + booking.getCompletionPercentage();
  }, 0);
  const averageProgress = bookingClasses.length > 0 ? totalProgress / bookingClasses.length : 0;
  
  // Total minutes used vs total minutes available
  const totalUsedMinutes = bookingClasses.reduce((sum, booking) => sum + booking.getUsedMinutes(), 0);
  const totalAvailableMinutes = bookingClasses.reduce((sum, booking) => sum + booking.getTotalMinutes(), 0);
  
  return {
    activeBookings,
    completableBookings,
    completedBookings,
    averageProgress: Math.round(averageProgress),
    totalUsedMinutes,
    totalAvailableMinutes,
    utilizationRate: totalAvailableMinutes > 0 ? Math.round((totalUsedMinutes / totalAvailableMinutes) * 100) : 0
  };
}
