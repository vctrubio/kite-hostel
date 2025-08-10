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

// Event Controller for whiteboard management
export interface EventController {
  flag: boolean;
  location: Location;
  durationCapOne: number;
  durationCapTwo: number;
  durationCapThree: number;
  submitTime: string;
}

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