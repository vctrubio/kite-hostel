# Kite Hostel Management App

A user app that tracks the lesson, and events inside a kite school.

## Entities

A sql database schema with different tables, described below

### AUTH

Provided by Supabase, users can log in via email, or Twilio.
Extract name, email and phone, and pass it down to student.

### User Wallet

- Links auth users to the system via `sk` (auth user id)
- Has role: guest, teacher, admin, teacherAdmin
- Optional `pk` field links to Teacher.id (for teachers)
- Tracks user authentication and role management

### Student

- A student profile (name, size, languages, country, passport_number, phone, desc)
- Soft delete support with deleted_at

### Teacher

- Unique name (for slug), login (via name, email or phone?) and password
- Each teacher has **two commission rates**: commission_a (required) and commission_b (optional) - price per hour per kite_event
- Teacher responsibility is to confirm kite events
- Soft delete support with deleted_at
- Many-to-many relationship with Kites via TeacherKite table

### Booking

- Students create booking by purchasing a package
- One booking can have many students (booking.package.capacity_students)
- Has status: active, cancelled, completed (default: active)
- Soft delete support with deleted_at

### Lesson

- Teacher links the teacher to booking model
- One booking can have many lessons, but only one active lesson at a time
- Has status: active, rest, delegated, completed, cancelled
- Soft delete support with deleted_at

### KiteEvent

- The kite event for the lesson, has a duration to subtract from booking.package.duration
- Has location (Los Lances, Valdevaqueros, Palmones) via whiteboard_planning component
- Status: active, completed, tbc
- Links to Lesson via lesson_id

### KiteEventEquipment

- Many-to-many relationship between KiteEvent and Kite
- Tracks which kites were used in each kite event

### Kites

- Equipment for kite event (serial_id, model, size)
- One teacher has many kites for lessons, ownership controlled by admin (many-to-many relationship via TeacherKite)

### PackageStudent

- Has price_per_student, duration (minutes), capacity_students, capacity_kites
- Optional description

### Payments

- Aimed at teacher, to subtract the commission rates from lessons
- Links to Teacher via teacher_id
- Tracks amount in euros

### Enums

- **Languages**: Spanish, French, English, German, Italian
- **Lesson Status**: active, rest, delegated, completed, cancelled
- **KiteEvent Status**: active, completed, tbc
- **Location**: Los Lances, Valdevaqueros, Palmones
- **Booking Status**: active, cancelled, completed
- **User Role**: guest, teacher, admin, teacherAdmin
