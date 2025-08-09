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
import { type TeacherLessons, type TeacherEvents } from '@/backend/types';

export interface BookingData {
  id: string;
  date_start: string;
  date_end: string;
  status: BookingStatus;
  package?: {
    id: string;
    duration: number; // total minutes
    price_per_student: number;
    capacity_kites: number;
    description?: string;
  };
  students?: Array<{
    student: {
      id: string;
      name: string;
    };
  }>;
  lessons?: LessonData[];
  reference?: {
    id: string;
    teacher: {
      id: string;
      name: string;
    } | null;
    amount?: number;
    status?: string;
    role?: string;
    note?: string;
  } | null;
}

export interface LessonData {
  id: string;
  status: LessonStatus;
  teacher?: {
    id: string;
    name: string;
  };
  events?: EventData[];
}

export interface EventData {
  id: string;
  date?: string;
  duration: number; // minutes
  status: EventStatus;
  location?: string;
  kites?: Array<{
    kite: {
      id: string;
      model: string;
    };
  }>;
}

export interface ValidationResult {
  isValid: boolean;
  message: string;
  code?: string;
}

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
   * Get all students assigned to this booking
   */
  getStudents(): Array<{ id: string; name: string }> {
    return this.booking.students?.map(s => s.student) || [];
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
   * Returns updated lesson data if successful
   */
  addLesson(teacherId: string): ValidationResult & { lesson?: LessonData } {
    const validation = this.canAddLesson();
    if (!validation.isValid) {
      return validation;
    }

    // In real implementation, this would call server action
    const newLesson: LessonData = {
      id: `lesson_${Date.now()}`, // Would be generated by DB
      status: 'planned',
      teacher: {
        id: teacherId,
        name: 'Teacher Name' // Would be fetched from DB
      },
      events: []
    };

    // Add to local state (in real app, would update DB and revalidate)
    if (!this.booking.lessons) {
      this.booking.lessons = [];
    }
    this.booking.lessons.push(newLesson);

    return {
      isValid: true,
      message: 'Lesson added successfully',
      lesson: newLesson
    };
  }

  /**
   * Add an event to a specific lesson
   */
  addEventToLesson(
    lessonId: string, 
    eventData: Omit<EventData, 'id'>
  ): ValidationResult & { event?: EventData } {
    const validation = this.canAddEvent(lessonId, eventData.duration);
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

    // Create new event
    const newEvent: EventData = {
      id: `event_${Date.now()}`, // Would be generated by DB
      ...eventData
    };

    // Add to lesson
    if (!lesson.events) {
      lesson.events = [];
    }
    lesson.events.push(newEvent);

    return {
      isValid: true,
      message: 'Event added successfully',
      event: newEvent
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
      issues.push(`Over-booked by ${totalScheduled - this.getTotalMinutes()} minutes`);
    }
    
    // Check for active lessons without teachers
    const activeLesson = this.getActiveLesson();
    if (activeLesson && !activeLesson.teacher) {
      issues.push('Active lesson missing teacher assignment');
    }
    
    // Check for ready completion
    if (this.isReadyForCompletion()) {
      issues.push('Ready for completion but status not updated');
    }
    
    // Check for stale bookings (active but no recent events)
    if (this.booking.status === 'active' && this.getCompletedEvents().length === 0) {
      issues.push('Active booking with no completed events');
    }

    return {
      hasIssues: issues.length > 0,
      issues
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

  // ================================
  // STATIC TEACHER GROUPING METHODS
  // ================================

  /**
   * Group lessons by teacher
   */
  static groupLessonsByTeacher(lessons: any[]): TeacherLessons[] {
    return lessons.reduce((acc: TeacherLessons[], lesson: any) => {
      const teacherId = lesson.teacher?.id || 'unassigned';
      const teacherName = lesson.teacher?.name || 'Unassigned';
      
      // Create WhiteboardClass instance from booking data
      const bookingClass = lesson.booking ? new WhiteboardClass(lesson.booking) : null;
      
      let teacherGroup = acc.find(group => group.teacherId === teacherId);
      
      if (!teacherGroup) {
        teacherGroup = {
          teacherId,
          teacherName,
          lessons: []
        };
        acc.push(teacherGroup);
      }
      
      if (bookingClass) {
        teacherGroup.lessons.push({
          lesson,
          bookingClass
        });
      }
      
      return acc;
    }, []);
  }

  /**
   * Group events by teacher
   */
  static groupEventsByTeacher(events: any[]): TeacherEvents[] {
    return events.reduce((acc: TeacherEvents[], event: any) => {
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
   * Calculate lesson statistics for a teacher group
   */
  static calculateLessonStats(teacherGroup: TeacherLessons) {
    const availableLessons = teacherGroup.lessons.filter(({ lesson }) => lesson.status === 'planned').length;
    const lessonsWithEvents = teacherGroup.lessons.filter(({ lesson }) => 
      lesson.status === 'planned' && lesson.events && lesson.events.length > 0
    ).length;
    
    return {
      availableLessons,
      lessonsWithEvents
    };
  }

  /**
   * Calculate event statistics for a teacher group
   */
  static calculateEventStats(teacherGroup: TeacherEvents) {
    const totalEvents = teacherGroup.events.length;
    const completedEvents = teacherGroup.events.filter(({ event }) => COMPLETED_EVENT_STATUSES.includes(event.status)).length;
    const plannedEvents = teacherGroup.events.filter(({ event }) => PLANNED_EVENT_STATUSES.includes(event.status)).length;
    
    return {
      totalEvents,
      completedEvents,
      plannedEvents
    };
  }
}

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
