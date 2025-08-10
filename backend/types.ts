import { type InferSelectModel } from "drizzle-orm";
import {
  PackageStudent,
  Booking,
  Lesson,
  Event,
  KiteEvent,
  Kite,
  user_wallet,
  Student,
  BookingStudent,
  Teacher,
} from "@/drizzle/migrations/schema";
import { WhiteboardClass, type LessonData } from '@/backend/WhiteboardClass';
import { type Location } from '@/lib/constants';

export type PackageStudent = InferSelectModel<typeof PackageStudent>;

// Event Controller interface for whiteboard event management
export interface EventController {
  flag: boolean; // Whether controller is enabled/visible  
  location: Location; // Selected location for events
  durationCapOne: number; // Duration for single student lessons (minutes)
  durationCapTwo: number; // Duration for 2+ student lessons (minutes)
  durationCapThree: number; // Duration for large group lessons (minutes)
  submitTime: string; // Start time for events (HH:MM format)
}

// Re-export teacher schedule types
export type {
  ScheduleItemType,
  BaseScheduleItem,
  EventScheduleItem,
  GapScheduleItem,
  ScheduleItem,
  TeacherDaySchedule,
  AvailableSlot,
  ConflictInfo
} from './TeacherSchedule';

export { TeacherSchedule } from './TeacherSchedule';
export { TeacherScheduleManager } from './TeacherScheduleManager';

export type BookingWithRelations = InferSelectModel<typeof Booking> & {
  lessons: (InferSelectModel<typeof Lesson> & {
    events: (InferSelectModel<typeof Event> & {
      kites: (InferSelectModel<typeof KiteEvent> & { kite: InferSelectModel<typeof Kite> })[];
    })[];
    teacher: InferSelectModel<typeof Teacher>;
    totalKiteEventDuration?: number; // Add this line
  })[];
  package: InferSelectModel<typeof PackageStudent>;
  reference: (InferSelectModel<typeof user_wallet> & { teacher: InferSelectModel<typeof Teacher> | null }) | null;
  students: (InferSelectModel<typeof BookingStudent> & { student: InferSelectModel<typeof Student> })[];
  lessonCount: number;
};

// Teacher grouping types
export interface TeacherLessons {
  teacherId: string;
  teacherName: string;
  lessons: Array<{
    lesson: LessonData;
    bookingClass: WhiteboardClass;
  }>;
}

export interface TeacherEvents {
  teacherId: string;
  teacherName: string;
  events: Array<{
    event: any;
    lesson: LessonData;
    booking: any;
  }>;
}