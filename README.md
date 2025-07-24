# Kite Hostel Management App

A user app that tracks the lesson, and events inside a kite school.

## Entities

A sql database schema with different tables, desribed below

### AUTH

provided by supabase, users can log in via email, or twillio.
extract name, email and phone, as pass it down to student

### Student

- a student profile (name, size, languages, country +auth)

### Teacher

- unique name (for slug), login (via name, email or phone?) and password,
- teach teacher has **_ two comission rates _**, normal and prenium, this is passed down to each lesson contract
- teacher responsibility is to confirm kite events

### Booking

- students create booking buy purchasing a package.
- one booking can have many stuydents booking.package.capacity

### Lesson

- teacher is what links the teacher to booking model, even though one booking can have many lessons, one booking can only have one active lesson]
- has status [active, rest, cancelled, delegated]

### Event

- the kite event for the lesson, has a duration to subract from booking.package.duration vs lesson.event[x].duration
- has location, via whiteboard_planning component
- status [planned, locked, tbc, completed]

### Kites

- equipment for kite event
- one teacher has many kites for lessons, ownership controlled by admin (many_to_many relationship)

### Package

- has price, hours, capacity, description, kites (for linking to kites model on kite event)

### Payments

- aimed at teacher, to substract the comission rates from lessons
