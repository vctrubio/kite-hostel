# Claude Code Configuration

This is a kite school management application built with Next.js, focusing on lesson scheduling and whiteboard management.

## Project Overview

A Next.js development MVP for managing kiteboarding lessons with two main user types:
- **Admins**: Set lesson schedules and manage the whiteboard
- **Teachers**: Track hours and confirm kite events

## Architecture

- **Backend**: Drizzle ORM with Supabase database
- **Frontend**: Next.js App Router with server-first approach
- **Core Route**: `/app/whiteboard/` - Main admin interface for daily lesson management
- **Development Mode**: Fast iteration for immediate teacher/admin use

## Key Conventions

- Server components by default, add `'use client'` only when needed
- No background colors unless specified
- Follow Rails MVC pattern: models in drizzle/, views in components/, controllers in actions/
- All logic declared at top of functions for readability
- Use existing utilities from `components/formatters/TimeZone.ts` for all time operations

## Main Classes

### WHITEBOARD
The core application route (`/app/whiteboard/`) provides an optimized daily interface for managing kiteboarding lessons and events. All entities are handled within a master table/row system.

### TEACHER_SCHEDULING  
Implements a linked list-based scheduling system (`backend/TeacherSchedule.ts`) for managing teacher daily schedules with conflict detection and gap analysis.

## File Structure

- `actions/` - API calls using Drizzle ORM
- `app/whiteboard/` - Core admin whiteboard interface
- `components/` - Organized by purpose (cards, forms, modals, etc.)
- `backend/` - Business logic classes
- `drizzle/` - ORM configuration and migrations

## Entity Relationships

### Core Flow: Student → Booking → Lesson → Event
- **Student** purchases a **Package** creating a **Booking**
- **Booking** generates **Lessons** (one booking can have multiple lessons)
- **Lessons** create **Events** (actual scheduled activities)
- **Events** use **Kites** (equipment) assigned by **Teachers**

### Detailed Relationships

**Student**
- Has many **Bookings** (via BookingStudent join table)
- Profile includes: name, size, languages, country, passport, phone
- Soft delete support

**Teacher** 
- Has many **Kites** (via TeacherKite join table)
- Has many **Commissions** (different rates for different periods)
- Links to **UserWallet** (auth system)
- Can be assigned to **Lessons**

**Booking**
- Belongs to a **Package** (defines price, duration, capacity)
- Has many **Students** (via BookingStudent)
- Has many **Lessons** (but only one active at a time)
- References a **Commission** (locked rate at booking time)
- Has status: active, cancelled, completed

**Lesson**
- Belongs to one **Booking**
- Assigned to one **Teacher**
- Generates one **Event** 
- Has status: active, rest, delegated, completed, cancelled

**Event**
- Belongs to one **Lesson** OR standalone event
- Has many **Kites** (via KiteEvent join table)
- Contains schedule info: date, time, location
- Chain to get package info: `event.lesson.booking.package`

**Kite**
- Equipment with serial_id, model, size
- Belongs to many **Teachers** (via TeacherKite)
- Used in many **Events** (via KiteEvent)

### Auth & Roles
**UserWallet** manages authentication and roles:
- Roles: guest, teacher, admin, teacherAdmin, reference
- Links auth users via `sk` (auth user id)
- Optional `pk` links to Teacher.id for teacher users

## Development Notes

- MVP focused on immediate usability
- No testing framework - direct deployment for teacher/admin feedback
- Rapid iteration cycle for real-world validation