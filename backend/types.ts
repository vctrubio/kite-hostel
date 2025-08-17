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
import { 
  type Location,
  type BookingStatusFilter,
  type LessonStatusFilter,
  type EventStatusFilter
} from '@/lib/constants';

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

// Database relation types
export type BookingWithRelations = InferSelectModel<typeof Booking> & {
  lessons: (InferSelectModel<typeof Lesson> & {
    events: (InferSelectModel<typeof Event> & {
      kites: (InferSelectModel<typeof KiteEvent> & { kite: InferSelectModel<typeof Kite> })[];
    })[];
    teacher: InferSelectModel<typeof Teacher>;
    totalKiteEventDuration?: number;
  })[];
  package: InferSelectModel<typeof PackageStudent>;
  reference: (InferSelectModel<typeof user_wallet> & { teacher: InferSelectModel<typeof Teacher> | null }) | null;
  students: (InferSelectModel<typeof BookingStudent> & { student: InferSelectModel<typeof Student> })[];
  lessonCount: number;
};

// Simple teacher grouping types (UI display only)
export interface TeacherEvents {
  teacherId: string;
  teacherName: string;
  events: Array<{
    event: any;
    lesson: any;
    booking: any;
  }>;
}

// WhiteboardClass types - cleaner data structures
export type BookingData = BookingWithRelations;
export type LessonData = BookingData['lessons'][0];
export type EventData = LessonData['events'][0];
export type StudentData = BookingData['students'][0]['student'];
export type TeacherData = LessonData['teacher'];

export interface ValidationResult {
  isValid: boolean;
  message: string;
  code?: string;
}

export interface TeacherStats {
  totalHours: number;
  totalEvents: number;
  totalEarnings: number;
  schoolRevenue: number;
  totalLessons: number;
}

// MiniNav Controller interface for centralized navigation and filter state
export interface MiniNavController {
  activeSection: string;
  selectedDate: string;
  filters: {
    bookings: BookingStatusFilter;
    lessons: LessonStatusFilter;
    events: EventStatusFilter;
  };
}
