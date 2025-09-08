import { type BookingData } from '@/backend/types';

export class BillboardClass {
  public booking: BookingData;
  public package: BookingData['package'];
  public lessons: BookingData['lessons'];

  constructor(bookingData: BookingData) {
    this.booking = { ...bookingData };
    this.package = this.booking.package;
    this.lessons = this.booking.lessons || [];
  }

  getEventMinutes() {
    const allEvents = this.lessons.flatMap(lesson => lesson.events || []);
    
    return {
      planned: allEvents
        .filter(event => event.status === 'planned')
        .reduce((total, event) => total + (event.duration || 0), 0),
      
      completed: allEvents
        .filter(event => event.status === 'completed')
        .reduce((total, event) => total + (event.duration || 0), 0),
      
      tbc: allEvents
        .filter(event => event.status === 'tbc')
        .reduce((total, event) => total + (event.duration || 0), 0),
      
      cancelled: allEvents
        .filter(event => event.status === 'cancelled')
        .reduce((total, event) => total + (event.duration || 0), 0),
    };
  }

  getRemainingMinutes(): number {
    const eventMinutes = this.getEventMinutes();
    const packageDuration = this.package?.duration || 0;
    const usedMinutes = eventMinutes.planned + eventMinutes.completed + eventMinutes.tbc;
    return packageDuration - usedMinutes;
  }

  // Package calculations
  getPackageMinutes() {
    const eventMinutes = this.getEventMinutes();
    const packageDuration = this.package?.duration || 0;
    const pricePerStudent = this.package?.price_per_student || 0;
    const studentCount = this.booking.students?.length || 0;
    const packageHours = packageDuration / 60;
    const pricePerHourPerStudent = packageHours > 0 ? pricePerStudent / packageHours : 0;
    
    return {
      expected: {
        total: packageDuration,
        totalPrice: pricePerStudent * studentCount,
        pricePerStudent: pricePerStudent,
        pricePerHourPerStudent: pricePerHourPerStudent
      },
      spent: {
        total: eventMinutes.completed,
        totalPrice: (eventMinutes.completed / 60) * pricePerHourPerStudent * studentCount,
        pricePerStudent: (eventMinutes.completed / 60) * pricePerHourPerStudent
      }
    };
  }

  // Student utilities
  getStudentCount(): number {
    return this.booking.students?.length || 0;
  }

  getStudentNames(): string[] {
    return this.booking.students?.map(bs => bs.student.name) || [];
  }

  getStudents() {
    return this.booking.students?.map(bs => bs.student) || [];
  }

  // Teacher utilities
  getTeachers() {
    const teachers = this.lessons
      .map(lesson => lesson.teacher)
      .filter(Boolean);
    // Remove duplicates by teacher ID
    const uniqueTeachers = teachers.filter((teacher, index, self) => 
      index === self.findIndex(t => t?.id === teacher?.id)
    );
    return uniqueTeachers;
  }

  getTeacherIds(): string[] {
    return this.getTeachers().map(teacher => teacher!.id);
  }

  hasTeacher(teacherId: string): boolean {
    return this.getTeacherIds().includes(teacherId);
  }

  // Event utilities for specific teacher and date
  getEventsForTeacherAndDate(teacherId: string, selectedDate: string) {
    const filterDate = new Date(selectedDate);
    filterDate.setHours(0, 0, 0, 0);

    return this.lessons
      .filter(lesson => lesson.teacher?.id === teacherId)
      .flatMap(lesson => {
        const events = lesson.events || [];
        return events
          .filter(event => {
            if (!event.date) return false;
            const eventDate = new Date(event.date);
            eventDate.setHours(0, 0, 0, 0);
            return eventDate.getTime() === filterDate.getTime();
          })
          .map(event => ({
            ...event,
            lesson,
            booking: this.booking,
            students: this.getStudentNames()
          }));
      });
  }

  // Check if booking needs teacher assignment
  needsTeacherAssignment(): boolean {
    return this.lessons.length === 0 || this.lessons.some(lesson => !lesson.teacher);
  }

  static extractStudents(booking: BookingData) {
    return booking.students?.map(bs => bs.student) || [];
  }
}