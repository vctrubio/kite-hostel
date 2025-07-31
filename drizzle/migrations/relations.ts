import { relations } from "drizzle-orm/relations";
import {
  users,
  Student,
  Teacher,
  Commission,
  TeacherKite,
  Kite,
  Event,
  KiteEvent,
  user_wallet,
  PackageStudent,
  Booking,
  BookingStudent,
  Lesson,
  Payment,
} from "./schema";

// user_wallet relations
export const userWalletRelations = relations(user_wallet, ({ one }) => ({
  user: one(users, {
    fields: [user_wallet.sk],
    references: [users.id],
  }),
  teacher: one(Teacher, {
    fields: [user_wallet.pk],
    references: [Teacher.id],
  }),
}));

// users (auth) relations
export const usersRelations = relations(users, ({ many }) => ({
  userWallets: many(user_wallet),
}));

// Student relations
export const studentRelations = relations(Student, ({ many }) => ({
  bookings: many(BookingStudent),
}));

// Teacher relations
export const teacherRelations = relations(Teacher, ({ many, one }) => ({
  commissions: many(Commission),
  kites: many(TeacherKite),
  payments: many(Payment),
  wallet: many(user_wallet),
}));

// Commission relations
export const commissionRelations = relations(Commission, ({ one, many }) => ({
  teacher: one(Teacher, {
    fields: [Commission.teacher_id],
    references: [Teacher.id],
  }),
  bookings: many(Booking),
}));

// TeacherKite relations (many-to-many)
export const teacherKiteRelations = relations(TeacherKite, ({ one }) => ({
  teacher: one(Teacher, {
    fields: [TeacherKite.teacher_id],
    references: [Teacher.id],
  }),
  kite: one(Kite, {
    fields: [TeacherKite.kite_id],
    references: [Kite.id],
  }),
}));

// Kite relations
export const kiteRelations = relations(Kite, ({ many }) => ({
  teachers: many(TeacherKite),
  events: many(KiteEvent),
}));

// Event relations
export const eventRelations = relations(Event, ({ one, many }) => ({
  lesson: one(Lesson, {
    fields: [Event.lesson_id],
    references: [Lesson.id],
  }),
  kites: many(KiteEvent),
}));

// KiteEvent relations (join table for event <-> kite)
export const kiteEventRelations = relations(KiteEvent, ({ one }) => ({
  event: one(Event, {
    fields: [KiteEvent.event_id],
    references: [Event.id],
  }),
  kite: one(Kite, {
    fields: [KiteEvent.kite_id],
    references: [Kite.id],
  }),
}));

// PackageStudent relations
export const packageStudentRelations = relations(PackageStudent, ({ many }) => ({
  bookings: many(Booking),
}));

// Booking relations
export const bookingRelations = relations(Booking, ({ one, many }) => ({
  package: one(PackageStudent, {
    fields: [Booking.package_id],
    references: [PackageStudent.id],
  }),
  commission: one(Commission, {
    fields: [Booking.commission_id],
    references: [Commission.id],
  }),
  reference: one(user_wallet, {
    fields: [Booking.reference_id],
    references: [user_wallet.id],
  }),
  students: many(BookingStudent),
  lessons: many(Lesson),
}));

// BookingStudent relations
export const bookingStudentRelations = relations(BookingStudent, ({ one }) => ({
  booking: one(Booking, {
    fields: [BookingStudent.booking_id],
    references: [Booking.id],
  }),
  student: one(Student, {
    fields: [BookingStudent.student_id],
    references: [Student.id],
  }),
}));

// Lesson relations
export const lessonRelations = relations(Lesson, ({ one, many }) => ({
  teacher: one(Teacher, {
    fields: [Lesson.teacher_id],
    references: [Teacher.id],
  }),
  booking: one(Booking, {
    fields: [Lesson.booking_id],
    references: [Booking.id],
  }),
  events: many(Event),
}));

// Payment relations
export const paymentRelations = relations(Payment, ({ one }) => ({
  teacher: one(Teacher, {
    fields: [Payment.teacher_id],
    references: [Teacher.id],
  }),
}));
