import { 
  COMPLETED_EVENT_STATUSES,
  PLANNED_EVENT_STATUSES
} from '@/lib/constants';
import { type BookingData, type LessonData } from '@/backend/types';

export class WhiteboardClass {
  private booking: BookingData;

  constructor(bookingData: BookingData) {
    this.booking = { ...bookingData };
  }

  getId(): string {
    return this.booking.id;
  }

  getStatus(): string {
    return this.booking.status;
  }

  getLessons(): LessonData[] {
    return this.booking.lessons || [];
  }

  getUsedMinutes(): number {
    const allEvents = this.getLessons().flatMap(lesson => lesson.events || []);
    const completedEvents = allEvents.filter(event => COMPLETED_EVENT_STATUSES.includes(event.status));
    return completedEvents.reduce(
      (total, event) => total + (event.duration || 0),
      0
    );
  }

  getPlannedMinutes(): number {
    const allEvents = this.getLessons().flatMap(lesson => lesson.events || []);
    const plannedEvents = allEvents.filter(event => PLANNED_EVENT_STATUSES.includes(event.status));
    return plannedEvents.reduce(
      (total, event) => total + (event.duration || 0),
      0
    );
  }

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

  getTotalMinutes(): number {
    return this.booking.package?.duration || 0;
  }

  getCompletionPercentage(): number {
    const total = this.getTotalMinutes();
    if (total === 0) return 0;
    
    return Math.min((this.getUsedMinutes() / total) * 100, 100);
  }

  isReadyForCompletion(): boolean {
    const isProgressComplete = this.getUsedMinutes() >= this.getTotalMinutes() && this.getTotalMinutes() > 0;
    return isProgressComplete && this.booking.status !== 'completed';
  }

  getRemainingMinutes(): number {
    return this.getTotalMinutes() - this.getUsedMinutes();
  }

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

export function extractStudentNames(booking: any): string {
  return booking?.students?.map((bs: any) => bs.student?.name).filter(Boolean).join(', ') || 'No students';
}

export function extractStudents(booking: any): Array<{id: string; name: string}> {
  return booking?.students?.map((s: any) => ({
    id: s.student?.id || '',
    name: s.student?.name || 'Unknown'
  })) || [];
}

export function createBookingClasses(bookingsData: BookingData[]): WhiteboardClass[] {
  return bookingsData.map(booking => new WhiteboardClass(booking));
}
