import {
  pgTable,
  foreignKey,
  unique,
  uuid,
  text,
  timestamp,
  integer,
  pgEnum,
  index,
  pgSchema,
} from "drizzle-orm/pg-core";

// Reference to Supabase's auth schema users table
const authSchema = pgSchema("auth");
export const users = authSchema.table("users", {
  id: uuid("id").primaryKey(),
  // We don't need to define all columns, just the one we're referencing
});

// ENUMS
export const languagesEnum = pgEnum("languages", [
  "Spanish",
  "French",
  "English",
  "German",
  "Italian",
]);

export const lessonStatusEnum = pgEnum("lesson_status", [
  "planned",
  "rest",
  "delegated", //lesson delegated means another lesson can be created. else acts as a mutex
  "completed", //will self appear to tick by admin to confimr lesson ahs been completed if hours have been met
  "cancelled", //cancel and remove from teh whiteboard
]);

export const EventStatusEnum = pgEnum("kite_event_status", [
  "planned",
  "completed",
  "tbc",
  "cancelled",
]);

export const locationEnum = pgEnum("location", [
  "Los Lances",
  "Valdevaqueros",
  "Palmones",
]);

export const bookingStatusEnum = pgEnum("booking_status", [
  "active",
  "cancelled",
  "completed",
]);

export const userRole = pgEnum("user_role", [
  "admin",
  "teacher",
  "teacherAdmin",
  "locked",
  "reference",
]);

// MAIN TABLES
export const Student = pgTable(
  "student",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: text().notNull(),
    languages: languagesEnum().array().notNull(),
    passport_number: text(),
    country: text(),
    phone: text(),
    size: text(),
    desc: text(),
    created_at: timestamp({ mode: "string" }).defaultNow(),
    deleted_at: timestamp({ mode: "string" }),
  },
  (table) => [index("student_id_idx").on(table.id)],
);

export const Teacher = pgTable(
  "teacher",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: text().notNull().unique(),
    languages: languagesEnum().array().notNull(),
    passport_number: text(),
    country: text(),
    phone: text(),
    created_at: timestamp({ mode: "string" }).defaultNow(),
    deleted_at: timestamp({ mode: "string" }),
  },
  (table) => [index("teacher_id_idx").on(table.id)],
);

export const Commission = pgTable(
  "commission",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    teacher_id: uuid().notNull(),
    price_per_hour: integer().notNull(),
    desc: text(),
    deleted_at: timestamp({ mode: "string" }),
    created_at: timestamp({ mode: "string" }).defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.teacher_id],
      foreignColumns: [Teacher.id],
      name: "commission_teacher_id_fk",
    }),
    index("commission_teacher_id_idx").on(table.teacher_id),
  ],
);

export const Kite = pgTable(
  "kite",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    serial_id: text().notNull().unique(),
    model: text().notNull(),
    size: integer().notNull(),
    created_at: timestamp({ mode: "string" }).defaultNow(),
    updated_at: timestamp({ mode: "string" }).defaultNow(),
  },
  (table) => [index("equipment_serial_id_idx").on(table.serial_id)],
);

export const TeacherKite = pgTable(
  "teacher_kite",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    teacher_id: uuid().notNull(),
    kite_id: uuid().notNull(),
    created_at: timestamp({ mode: "string" }).defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.teacher_id],
      foreignColumns: [Teacher.id],
      name: "teacher_kite_teacher_id_fk",
    }),
    foreignKey({
      columns: [table.kite_id],
      foreignColumns: [Kite.id],
      name: "teacher_kite_kite_id_fk",
    }),
    unique("teacher_kite_unique").on(table.teacher_id, table.kite_id),
    index("teacher_kite_teacher_id_idx").on(table.teacher_id),
    index("teacher_kite_kite_id_idx").on(table.kite_id),
  ],
);

// USER WALLET -- for user (admin and teacher app management)
export const user_wallet = pgTable(
  "user_wallet",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    role: userRole().notNull(),
    sk: uuid().unique(), // Now nullable
    pk: uuid().unique(), // Now nullable
    note: text(),
    created_at: timestamp({ mode: "string" }).defaultNow(),
    updated_at: timestamp({ mode: "string" }).defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.sk],
      foreignColumns: [users.id],
      name: "user_wallet_sk_users_id_fk",
    }),
    foreignKey({
      columns: [table.pk],
      foreignColumns: [Teacher.id],
      name: "user_wallet_pk_teacher_id_fk",
    }),
  ],
);

//////////////////////////////////////
export const PackageStudent = pgTable("package_student", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  duration: integer().notNull(), // In minutes
  description: text(), // Optional description
  price_per_student: integer().notNull(), // In euros
  capacity_students: integer().notNull(), // Capacity of students
  capacity_kites: integer().notNull().default(1),
  created_at: timestamp({ mode: "string" }).defaultNow(),
});

export const Booking = pgTable(
  "booking",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    package_id: uuid().notNull(),
    date_start: timestamp({ mode: "string" }).notNull(),
    date_end: timestamp({ mode: "string" }).notNull(),
    status: bookingStatusEnum().notNull(),
    reference_id: uuid(), // FK to user_wallet
    created_at: timestamp({ mode: "string" }).defaultNow(),
    deleted_at: timestamp({ mode: "string" }),
  },
  (table) => [
    foreignKey({
      columns: [table.package_id],
      foreignColumns: [PackageStudent.id],
      name: "booking_package_id_fk",
    }),
    foreignKey({
      columns: [table.reference_id],
      foreignColumns: [user_wallet.id],
      name: "booking_reference_id_fk",
    }),
  ],
);

export const BookingStudent = pgTable(
  "booking_student",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    booking_id: uuid().notNull(),
    student_id: uuid().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.booking_id],
      foreignColumns: [Booking.id],
      name: "booking_student_booking_id_fk",
    }),
    foreignKey({
      columns: [table.student_id],
      foreignColumns: [Student.id],
      name: "booking_student_student_id_fk",
    }),
    unique("booking_student_unique").on(table.booking_id, table.student_id), // Keep this for business logic
    index("booking_student_booking_id_idx").on(table.booking_id),
    index("booking_student_student_id_idx").on(table.student_id),
  ],
);

export const Lesson = pgTable(
  "lesson",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    teacher_id: uuid().notNull(),
    booking_id: uuid().notNull(),
    commission_id: uuid().notNull(), // FK to commission (teacher) (locked at booking time)
    status: lessonStatusEnum().notNull(),
    created_at: timestamp({ mode: "string" }).defaultNow(),
    deleted_at: timestamp({ mode: "string" }),
  },
  (table) => [
    foreignKey({
      columns: [table.teacher_id],
      foreignColumns: [Teacher.id],
      name: "lesson_teacher_id_fk",
    }),
    foreignKey({
      columns: [table.booking_id],
      foreignColumns: [Booking.id],
      name: "lesson_booking_id_fk",
    }),
    foreignKey({
      columns: [table.commission_id],
      foreignColumns: [Commission.id],
      name: "lesson_commission_id_fk",
    }),
    index("lesson_teacher_booking_id_idx").on(
      table.teacher_id,
      table.booking_id,
    ),
  ],
);

export const Event = pgTable(
  "event",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    lesson_id: uuid().notNull(),
    date: timestamp({ mode: "string" }).notNull(), // when
    duration: integer().notNull(), // Duration in minutes
    location: locationEnum().notNull(),
    status: EventStatusEnum().notNull(),
    created_at: timestamp({ mode: "string" }).defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.lesson_id],
      foreignColumns: [Lesson.id],
      name: "event_lesson_id_fk",
    }),
    index("event_lesson_id_idx").on(table.lesson_id),
  ],
);

// A kite that was used in an event
export const KiteEvent = pgTable(
  "kite_event",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    event_id: uuid().notNull(),
    kite_id: uuid().notNull(),
    created_at: timestamp({ mode: "string" }).defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.event_id],
      foreignColumns: [Event.id],
      name: "kite_event_event_id_fk",
    }),
    foreignKey({
      columns: [table.kite_id],
      foreignColumns: [Kite.id],
      name: "kite_event_kite_id_fk",
    }),
    index("kite_event_event_id_idx").on(table.event_id),
    index("kite_event_kite_id_idx").on(table.kite_id),
  ],
);

export const Payment = pgTable(
  "payment",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    amount: integer().notNull(), // In euros
    teacher_id: uuid().notNull(), // Reference to teacher
    created_at: timestamp({ mode: "string" }).defaultNow(),
    updated_at: timestamp({ mode: "string" }).defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.teacher_id],
      foreignColumns: [Teacher.id],
      name: "payment_teacher_id_fk",
    }),
    index("payment_teacher_id_idx").on(table.teacher_id),
  ],
);
