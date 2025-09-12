# Kite Hostel Management App

A comprehensive kite school management application for daily operations, built to handle the dynamic nature of kiteboarding where wind conditions constantly change schedules.

🌊 **Live Site**: [https://kite-hostel.vercel.app/](https://kite-hostel.vercel.app/)  
🏄‍♂️ **Developer**: [donkeydrills.com](https://donkeydrills.com)

## Overview

This Next.js application manages kiteboarding lessons with real-time scheduling capabilities designed for wind-dependent operations. When wind changes, schedules change - this app synchronizes those changes across APIs, PDFs, and Excel exports.

## Key Features

• **Wind-Responsive Scheduling** - Built for the dynamic nature of kiteboarding operations
• **Real-Time Updates** - Synchronous changes across all interfaces and exports
• **Dual Interface Approach**:
  - **Whiteboard** - Mobile-first approach for quick daily operations
  - **Billboard** - Desktop drag-and-drop interface for detailed lesson planning
• **Multi-Format Exports** - CSV, Excel, WhatsApp, PDF, and medical email exports
• **Teacher Portal** - Hour tracking and event confirmation system via UserWallet authentication
• **Admin Dashboard** - Comprehensive entity management system with configurable table views

## Architecture

• **Frontend**: Next.js 14 with App Router (server-first approach)
• **Backend**: Drizzle ORM with Supabase PostgreSQL database  
• **Authentication**: Supabase Auth with role-based access control
• **Styling**: Tailwind CSS with shadcn/ui components
• **Real-time**: Server-side rendering with optimistic updates

## Core Applications

### Whiteboard (`/app/whiteboard/`)
Mobile-friendly interface optimized for daily kite lesson management:
• Quick lesson creation and status updates
• Real-time filtering by date
• Teacher assignment and equipment tracking
• Weather-responsive scheduling adjustments

### Billboard (`/app/billboard/`)  
Advanced drag-and-drop scheduling interface:
• Visual teacher column layout
• Drag bookings from student queue to teacher schedules
• Dynamic duration adjustments
• Conflict resolution and queue management
• Real-time calculations with BillboardClass integration

## Entity Flow

The core business logic follows this relationship chain:

**Student** → **Booking** → **Lesson** → **Event**

• Students purchase packages creating bookings
• Bookings generate lessons (assigned to teachers)
• Lessons create events (actual scheduled activities)  
• Events use kites (equipment) and track completion

### Admin Dashboard System (`/app/(tables)/`)

A comprehensive entity management system providing CRUD operations for all database entities:

**Core Dashboard Component** (`components/dashboard/Dashboard.tsx`):
• Reusable table interface with sorting, filtering, and search functionality
• Dynamic stats calculation and month-based filtering
• Configurable column headers and export capabilities
• Entity-specific action buttons and dropdown forms

**Entity Configuration** (`components/dashboard/DashboardGetEntitiesUtils.ts`):
• Centralized entity configuration with icons, colors, and routing
• Custom filter logic for each entity type (active/inactive, status-based)
• Dynamic action button generation with entity-specific workflows
• Multi-format export function mapping (CSV, Excel, etc.)

**Database Entities Managed**:
• **Students** - Profile management with booking history and package selection
• **Teachers** - Instructor profiles with kite assignments and commission tracking
• **Bookings** - Package purchases with student assignments and status tracking
• **Lessons** - Individual lesson records with teacher and booking relationships
• **Events** - Scheduled activities with location, duration, and kite assignments
• **Packages** - Lesson packages with pricing and capacity configurations
• **Kites** - Equipment management with teacher assignments and usage tracking
• **Payments** - Financial records for teacher commissions and payouts

**Features**:
• Server-side data fetching with client-side filtering and sorting
• Entity-specific `/form` routes for creation and editing
• Bulk operations and selection capabilities (students → package assignment)
• Real-time stats with dynamic updates based on filtered data
• Month-based filtering with localStorage persistence

### UserWallet Authentication System

A Web3-inspired authentication architecture that bridges Supabase Auth with internal role management:

**UserWalletProvider** (`provider/UserWalletProvider.tsx`):
• React Context provider managing authentication state
• Session caching with user data transformation
• Links Supabase users to internal UserWallet records

**UserWallet Table Structure**:
• `sk` (Secret Key) - Links to Supabase auth user ID
• `pk` (Public Key) - Optional link to Teacher.id for instructor accounts
• `role` - System roles: admin, teacher, teacherAdmin, locked, reference
• `note` - Additional user information and context

**UserWallet Form** (`components/forms/UserWalletForm.tsx`):
• Admin interface for managing user roles and relationships
• Dynamic PK assignment for linking teachers to auth accounts
• Role-based field visibility and validation

**Role-Based Access**:
• **Admin** - Full system access, entity management
• **Teacher/TeacherAdmin** - Portal access with PK link to teacher profiles
• **Reference** - Limited access for booking reference purposes
• **Locked** - Restricted access status

## Tech Stack

• **Framework**: Next.js 14 with TypeScript
• **Database**: PostgreSQL (Supabase) with Drizzle ORM and Relations (`drizzle/migrations/relations.ts`)
• **Authentication**: Supabase Auth with UserWallet system (`provider/UserWalletProvider.tsx`)
• **Role Management**: Web3-inspired wallet system with `sk` (auth user id) and `pk` (teacher link) keys
• **UI Components**: shadcn/ui with Radix primitives
• **Styling**: Tailwind CSS
• **State Management**: Server components with React Context
• **Time Management**: Custom UTC-based timezone utilities
• **Queue System**: Linked-list data structures for teacher scheduling
• **Export System**: Multi-format exports via Billboard actions and Dashboard utilities

## Project Structure

```
app/
├── whiteboard/          # Mobile-first admin interface
├── billboard/           # Drag-and-drop scheduling interface  
├── (tables)/            # Entity management routes (students, teachers, bookings, etc.)
│   ├── [entity]/page.tsx   # Dashboard view for each entity
│   └── [entity]/form/      # Creation and editing forms
└── [auth-routes]/       # Authentication and user management

components/
├── dashboard/           # Reusable dashboard system with entity configuration
├── formatters/          # Date/time utilities (UTC-based)
├── forms/              # Entity creation and editing forms
├── labels/             # UI components with API calls
├── modals/             # Pop-up interfaces for entity operations
├── pickers/            # Date and time picker components
├── rows/               # Dashboard row components for entities
├── tables/             # Data table components
└── ui/                 # Generic UI components

backend/
├── TeacherQueue.ts        # Linked-list queue management
├── BillboardClass.tsx     # Core booking calculations
├── BillboardExportUtils.ts # Export utilities (CSV, Excel, WhatsApp, Print)
└── TeacherSchedule.ts     # Schedule conflict detection
```

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your Supabase credentials

# Run development server
npm run dev
```

## Environment Setup

Required environment variables:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Key Documentation

• **Entity Relationships**: See `ENTITIES.md` for complete database schema and relationships
• **Project Structure**: See `STRUCTURE.md` for detailed architecture overview
• **Development Notes**: See `CLAUDE.md` for development conventions and guidelines

## User Roles

• **Admin** - Full system access, manage all entities
• **Teacher** - Track hours, confirm events, manage assigned lessons  
• **TeacherAdmin** - Teacher permissions + student/booking management
• **Reference** - Limited access for booking references

## Wind-Responsive Design Philosophy

Kiteboarding is entirely wind-dependent. This application is built around the reality that:
• Schedules change constantly based on weather conditions
• Teachers need quick mobile access for on-the-go updates
• Admin staff need powerful drag-and-drop tools for complex rescheduling
• All changes must sync immediately across export formats
• Equipment and teacher availability must be tracked in real-time

---

*Built for the dynamic world of kiteboarding instruction where adaptability is everything.*