import { type TeacherPortalData } from "@/actions/teacher-actions";

export interface TeacherPortalStats {
  lessonsCount: number;
  eventsCount: number;
  totalDuration: number; // in minutes
  totalEarnings: number; // in euros
}

export interface LessonWithDetails {
  lesson: TeacherPortalData['lessons'][0];
  packageInfo: TeacherPortalData['lessons'][0]['booking']['package'];
  students: TeacherPortalData['lessons'][0]['booking']['students'];
  events: TeacherPortalData['lessons'][0]['events'];
  totalDuration: number;
  totalEarnings: number;
}

export interface EventWithDetails {
  event: TeacherPortalData['lessons'][0]['events'][0];
  lesson: TeacherPortalData['lessons'][0];
  students: string[];
  studentDetails: TeacherPortalData['lessons'][0]['booking']['students'];
  packageInfo: TeacherPortalData['lessons'][0]['booking']['package'];
  earnings: number;
  kites: TeacherPortalData['lessons'][0]['events'][0]['kites'];
}

export class TeacherPortal {
  private teacher: TeacherPortalData;
  private stats: TeacherPortalStats;

  constructor(teacher: TeacherPortalData) {
    this.teacher = teacher;
    this.stats = this.calculateStats();
  }

  private calculateStats(): TeacherPortalStats {
    const completedEvents = this.teacher.lessons.flatMap(lesson => 
      lesson.events.filter(event => event.status === 'completed')
    );

    const totalDuration = completedEvents.reduce((sum, event) => sum + event.duration, 0);

    const totalEarnings = this.teacher.lessons.reduce((total, lesson) => {
      const lessonCompletedEvents = lesson.events.filter(event => event.status === 'completed');
      const lessonDuration = lessonCompletedEvents.reduce((sum, event) => sum + event.duration, 0);
      const commission = this.teacher.commissions.find(c => c.id === lesson.commission_id);
      return total + (commission ? (lessonDuration / 60) * commission.price_per_hour : 0);
    }, 0);

    return {
      lessonsCount: this.teacher.lessons.length,
      eventsCount: completedEvents.length,
      totalDuration,
      totalEarnings
    };
  }

  getTeacher(): TeacherPortalData {
    return this.teacher;
  }

  getStats(): TeacherPortalStats {
    return this.stats;
  }

  getName(): string {
    return this.teacher.name;
  }

  getTotalHours(): number {
    return this.stats.totalDuration / 60;
  }

  getAverageHourlyRate(): number {
    const totalHours = this.getTotalHours();
    return totalHours > 0 ? this.stats.totalEarnings / totalHours : 0;
  }

  getCompletedLessonsCount(): number {
    return this.teacher.lessons.filter(lesson => lesson.status === 'completed').length;
  }

  getActiveLessonsCount(): number {
    return this.teacher.lessons.filter(lesson => lesson.status === 'planned').length;
  }

  getAllEvents(): EventWithDetails[] {
    return this.teacher.lessons.flatMap(lesson => 
      lesson.events.map(event => {
        const commission = this.teacher.commissions.find(c => c.id === lesson.commission_id);
        const earnings = commission ? (event.duration / 60) * commission.price_per_hour : 0;
        const studentNames = lesson.booking.students.map(bs => bs.student.name);
        
        return {
          event,
          lesson,
          students: studentNames,
          studentDetails: lesson.booking.students,
          packageInfo: lesson.booking.package,
          earnings,
          kites: event.kites,
        };
      })
    );
  }

  getTodaysEvents(date: string): EventWithDetails[] {
    const today = new Date(date).toDateString();
    return this.getAllEvents().filter(eventDetail => {
      const eventDate = new Date(eventDetail.event.date).toDateString();
      return eventDate === today;
    });
  }

  getLessonsWithDetails(): LessonWithDetails[] {
    return this.teacher.lessons.map(lesson => {
      const completedEvents = lesson.events.filter(event => event.status === 'completed');
      const totalDuration = completedEvents.reduce((sum, event) => sum + event.duration, 0);
      const commission = this.teacher.commissions.find(c => c.id === lesson.commission_id);
      const totalEarnings = commission ? (totalDuration / 60) * commission.price_per_hour : 0;

      return {
        lesson,
        packageInfo: lesson.booking.package,
        students: lesson.booking.students,
        events: lesson.events,
        totalDuration,
        totalEarnings,
      };
    });
  }

  getEventsByStatus(status: 'planned' | 'completed' | 'tbc' | 'cancelled'): EventWithDetails[] {
    return this.getAllEvents().filter(eventDetail => eventDetail.event.status === status);
  }

  private formatDateForShare(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}`;
  }

  private formatDurationForShare(minutes: number): string {
    if (minutes >= 60 && minutes % 60 === 0) {
      return `*${minutes / 60}h*`;
    } else if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `*${hours}h${remainingMinutes}m*`;
    } else {
      return `*${minutes}m*`;
    }
  }

  generateShareMessage(selectedDate?: string): string {
    let eventsToShare: EventWithDetails[];

    if (selectedDate) {
      // Filter is ON - share events for selected date only
      eventsToShare = this.getTodaysEvents(selectedDate);
      
      if (eventsToShare.length === 0) {
        return `No events scheduled for ${this.formatDateForShare(new Date(selectedDate))}`;
      }

      // Sort by time
      const sortedEvents = eventsToShare.sort((a, b) => {
        return new Date(a.event.date).getTime() - new Date(b.event.date).getTime();
      });

      const dateFormatted = this.formatDateForShare(new Date(selectedDate));
      const eventMessages = sortedEvents.map(eventDetail => {
        const students = eventDetail.students.join(", ");
        const duration = this.formatDurationForShare(eventDetail.event.duration);
        
        return `- ${students}, ${duration}`;
      });

      return `${dateFormatted}\n\n${eventMessages.join('\n')}`;
    } else {
      // Filter is OFF - share ALL events grouped by date
      eventsToShare = this.getAllEvents();
      
      if (eventsToShare.length === 0) {
        return `No events scheduled`;
      }

      // Group events by date
      const eventsByDate: { [key: string]: EventWithDetails[] } = {};
      
      eventsToShare.forEach(eventDetail => {
        const eventDate = new Date(eventDetail.event.date);
        const dateKey = eventDate.toDateString();
        
        if (!eventsByDate[dateKey]) {
          eventsByDate[dateKey] = [];
        }
        eventsByDate[dateKey].push(eventDetail);
      });

      // Sort dates and create message
      const sortedDates = Object.keys(eventsByDate).sort((a, b) => {
        return new Date(a).getTime() - new Date(b).getTime();
      });

      const dateMessages = sortedDates.map(dateKey => {
        const date = new Date(dateKey);
        const dateFormatted = this.formatDateForShare(date);
        
        // Sort events by time for this date
        const dayEvents = eventsByDate[dateKey].sort((a, b) => {
          return new Date(a.event.date).getTime() - new Date(b.event.date).getTime();
        });

        const eventMessages = dayEvents.map(eventDetail => {
          const students = eventDetail.students.join(", ");
          const duration = this.formatDurationForShare(eventDetail.event.duration);
          
          return `- ${students}, ${duration}`;
        });

        return `${dateFormatted}\n${eventMessages.join('\n')}`;
      });

      return dateMessages.join('\n\n');
    }
  }

  shareEventsViaWhatsApp(selectedDate?: string): void {
    const message = this.generateShareMessage(selectedDate);
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  }
}