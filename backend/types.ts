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

export type PackageStudent = InferSelectModel<typeof PackageStudent>;

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