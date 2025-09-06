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
    return eventMinutes.planned - eventMinutes.completed;
  }

  // Package calculations
  getPackageMinutes() {
    const eventMinutes = this.getEventMinutes();
    const packageDuration = this.package?.duration || 0;
    const pricePerStudent = this.package?.price_per_student || 0;
    const studentCount = this.getStudentCount();
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
}

export function createBillboardClasses(bookingsData: BookingData[]): BillboardClass[] {
  return bookingsData.map(booking => new BillboardClass(booking));
}
