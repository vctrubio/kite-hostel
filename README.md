# Kite Hostel Management App

A user app that tracks the lesson, and events inside a kite school.

## Entities

A student profile (name, size, languages, country, passport_number, phone, desc)
Soft delete support with deleted_at
Has many bookings (via BookingStudent join table, accessed as `student.bookings`)

### AUTH

Many-to-many relationship with Kites via TeacherKite table (accessed as `teacher.kites`)
One-to-many relationship with Commission table
A teacher can have access to many kites, which they can later add to an event
Has many user_wallets (accessed as `teacher.wallet`)

### User Wallet

One booking can have many students (booking.package.capacity_students), accessed as `booking.students`

- Links auth users to the system via `sk` (auth user id), but `sk` and `pk` are now optional (nullable)
- Has role: guest, teacher, admin, teacherAdmin, reference (for including references in bookings)
  One teacher has many kites for lessons, ownership controlled by admin (many-to-many relationship via TeacherKite, accessed as `kite.teachers`)
  Each kite can be associated with many events (via KiteEvent, accessed as `kite.events`)
- `note` field can be used for extra info about the user
- Optional `pk` field links to Teacher.id (for teachers)
  Represents a general event (not tied to a lesson)
  Has name, description, date, location
  Used for organizing school-wide or public events
  Each event is linked to a lesson (accessed as `event.lesson`)
  Each event can have many kites (via KiteEvent, accessed as `event.kites`)

- A student profile (name, size, languages, country, passport_number, phone, desc)
  Links an Event to a Kite (many-to-many relationship)
  Has notes and created_at
  Used to track which kites are associated with which events

## Traversing Relations

To get the package (and its price/duration) for a given event:

1. Start from `Event`.
2. Use `event.lesson` to get the related lesson.
3. Use `lesson.booking` to get the related booking.
4. Use `booking.package` to get the related package (with price/duration).

So, the chain is: `event.lesson.booking.package`

This allows you to display package info for each event in the frontend.

### Teacher

- Unique name (for slug), login (via name, email or phone?) and password
- Teacher responsibility is to confirm kite events
- Soft delete support with deleted_at
- Many-to-many relationship with Kites via TeacherKite table
- One-to-many relationship with Commission table
- A teacher can have access to many kites, which they can later add to an event

### TeacherKite (Join Table)

- Represents the many-to-many relationship between teachers and kites
- Fields: teacher_id, kite_id, created_at
- Each teacher can have access to many kites, and each kite can belong to many teachers
- Used to control which kites a teacher can add to an event

### Commission

- Each commission belongs to a teacher (teacher_id)
- Fields: price_per_hour, desc, deleted_at, created_at
- Allows a teacher to have multiple commission rates (e.g. for different seasons or packages)
- Commissions can be soft-deleted (deleted_at)

### Booking

- Students create booking by purchasing a package
- One booking can have many students (booking.package.capacity_students)
- Has status: active, cancelled, completed (default: active)
- Soft delete support with deleted_at
- `reference_id` links to `user_wallet.id` (can be any user_wallet, including reference-only users)
- `commission_id` links to `commission.id` (the commission rate locked at the time of booking)
- When making a booking, if the reference pk = teacher id, you should also store the commission id in the booking. This ensures you always know which commission rate was agreed for that booking, even if the teacher's commission changes later.

### Lesson

- Teacher links the teacher to booking model
- One booking can have many lessons, but only one active lesson at a time
- Has status: active, rest, delegated, completed, cancelled
- Soft delete support with deleted_at

### Event

- Represents a general event (not tied to a lesson)
- Has name, description, date, location
- Used for organizing school-wide or public events

### KiteEvent

- Links an Event to a Kite (many-to-many relationship)
- Has notes and created_at
- Used to track which kites are associated with which events

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
- **Lesson Status**: planned, rest, delegated, completed, cancelled
- **Event Status**: planned, completed, tbc
- **Location**: Los Lances, Valdevaqueros, Palmones
- **Booking Status**: active, cancelled, completed
- **User Role**: guest, teacher, admin, teacherAdmin
