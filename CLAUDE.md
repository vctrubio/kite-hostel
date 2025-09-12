# Claude Code Configuration

This is a comprehensive kite school management application built with Next.js, designed for wind-dependent scheduling operations.

## Project Overview

A Next.js production application for managing kiteboarding lessons with multiple user interfaces:
- **Admins**: Comprehensive lesson scheduling via dual interfaces (Whiteboard + Billboard)
- **Teachers**: Hour tracking, event confirmation, and portal access
- **Students**: Booking management and lesson tracking

## Architecture

- **Backend**: Drizzle ORM with Supabase PostgreSQL database
- **Frontend**: Next.js 14 App Router with server-first approach
- **Core Routes**: 
  - `/app/whiteboard/` - Mobile-first admin interface for daily operations
  - `/app/billboard/` - Drag-and-drop desktop interface for complex scheduling
- **Production Status**: Live deployment with real-world usage

## Key Conventions

- Server components by default, add `'use client'` only when needed
- No background colors unless specified
- Follow Rails MVC pattern: models in drizzle/, views in components/, controllers in actions/
- All logic declared at top of functions for readability
- Use existing utilities from `components/formatters/TimeZone.ts` for all time operations

## Main Applications

### WHITEBOARD (`/app/whiteboard/`)
Mobile-first admin interface using **WhiteboardClass** and **TeacherSchedule**:

**Core Classes Used**:
- **WhiteboardClass** - Wraps booking data for whiteboard-specific calculations
- **TeacherSchedule** - Original schedule management with time/gap analysis
- **ShareUtils** - Handles exports (WhatsApp, CSV, PDF, medical emails)

**Features**:
- Section-based navigation (Bookings, Lessons, Events)
- Real-time date filtering with booking status filters
- Quick lesson creation and status management
- Teacher assignment and equipment tracking
- Mobile-optimized responsive design

### BILLBOARD (`/app/billboard/`)  
Desktop drag-and-drop interface using **BillboardClass** and **TeacherQueue**:

**Core Classes Used**:
- **BillboardClass** - Enhanced booking calculations for drag-and-drop operations
- **TeacherQueue** - Linked-list queue system for drag-and-drop event management
- **BillboardExportUtils** - Specialized export utilities (CSV, Excel, WhatsApp, Print)
- **billboardUtils** - Creates TeacherQueues from BillboardClasses

**Features**:
- Visual teacher column layout with drag-and-drop
- StudentBookingColumn as drag source
- Dynamic duration adjustments and conflict resolution
- Real-time calculations during drag operations
- Complex event reordering and queue management

### BACKEND CLASSES

#### WHITEBOARD CLASSES

**TeacherSchedule** (`backend/TeacherSchedule.ts`):
- **Used by**: Whiteboard interface
- **Purpose**: Original linked list-based scheduling with time/gap analysis
- **Features**: Static schedule viewing, conflict detection, gap analysis
- **Data Structure**: Simple linked list for time slots

**WhiteboardClass** (`backend/WhiteboardClass.tsx`):
- **Used by**: Whiteboard interface  
- **Purpose**: Booking data wrapper for whiteboard calculations
- **Features**: Basic booking stats and status management

#### BILLBOARD CLASSES

**TeacherQueue** (`backend/TeacherQueue.ts`):
- **Used by**: Billboard interface
- **Purpose**: Dynamic linked list queue system for drag-and-drop operations
- **Features**: Event node management, reordering, database integration
- **Data Structure**: Event nodes with BillboardClass references and lesson IDs

**BillboardClass** (`backend/BillboardClass.tsx`):
- **Used by**: Billboard interface and TeacherQueue nodes
- **Purpose**: Enhanced booking calculations for real-time drag-and-drop
- **Features**: Event minutes tracking, package calculations, remaining time analysis
- **Integration**: Powers real-time calculations during drag operations

## File Structure

- `actions/` - Server-side API calls using Drizzle ORM
- `app/whiteboard/` - Mobile-first admin whiteboard interface
- `app/billboard/` - Drag-and-drop desktop scheduling interface
- `components/` - Organized by purpose:
  - `billboard/` - Billboard-specific UI components and export utilities
  - `cards/` - Entity display components
  - `forms/` - Creation and editing forms
  - `formatters/` - Date/time utilities (UTC-based TimeZone.ts)
  - `modals/` - Pop-up interfaces
  - `tables/` - Data table components
  - `ui/` - Generic UI elements (shadcn/ui)
- `backend/` - Business logic classes (TeacherQueue, BillboardClass, TeacherSchedule)
- `drizzle/` - ORM configuration, schema, and migrations
- `lib/` - Utility functions and configurations
- `provider/` - React Context providers for global state

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
- Roles: admin, teacher, teacherAdmin, locked, reference
- Links auth users via `sk` (auth user id)
- Optional `pk` links to Teacher.id for teacher users

## Development Notes

- **Production Application**: Live deployment at https://kite-hostel.vercel.app/
- **Wind-Responsive Design**: Built specifically for kiteboarding's weather-dependent nature
- **Real-Time Operations**: Synchronous updates across interfaces, APIs, PDFs, and Excel exports
- **Mobile-First Approach**: Whiteboard optimized for on-the-go teacher/admin use
- **Advanced Scheduling**: Billboard provides desktop drag-and-drop for complex rescheduling
- **Linked-List Architecture**: Custom queue management for optimal teacher scheduling
- **UTC Timezone Safety**: All time operations use `components/formatters/TimeZone.ts` utilities

## Key Features

- **Dual Interface Strategy**: Mobile (Whiteboard) + Desktop (Billboard) approaches
- **Equipment Management**: Kite assignment and tracking via TeacherKite relationships
- **Commission System**: Locked rates at booking time with flexible teacher pricing
- **Export Integration**: Multi-format data export (API, PDF, Excel)
- **Role-Based Access**: Granular permissions for different user types
- **Soft Delete Support**: Data preservation with recovery capabilities