# Project Structure

This document outlines the directory structure of the project in a tree format.

```
/
├─── actions/ # Contains server-side functions for making API calls to the database using Drizzle ORM.
├─── app/ # Defines the application's routes and pages, following Next.js App Router conventions.
├─── whiteboard/ # Core application feature for admins to manage daily kite lessons and events. (INSIDE THE APP DIR/ROUTE)
├─── components/
│    ├─── cards/ # Components for displaying entity information in a card format.
│    ├─── views/ # Components for displaying entity
│    ├─── forms/ # Form components used for creating and editing entities.
│    ├─── formatters/ # Components to format data for display (e.g., dates, durations).
│    │    ├─── DateTime.tsx # Legacy date/time formatting utilities (being phased out)
│    │    └─── TimeZone.ts # **NEW**: UTC-based timezone-safe date/time utilities
│    ├─── label/ # Components that make api calls
│    ├─── modals/ # Pop up, to create
│    ├─── pickers/ # Date and time picker components.
│    ├─── supabase-init/ # UI components related to Supabase authentication.
│    ├─── ui/ # Generic, low-level UI elements (Button, Card, etc.).
│    └─── users/ # Components specifically for user information and management.
├─── drizzle/ # Holds Drizzle ORM configuration, schema, and migration files.
├─── backend/ # **NEW**: Backend utilities and business logic classes
│    ├─── types.ts # TypeScript interfaces for backend entities
│    └─── TeacherSchedule.ts # Linked list implementation for teacher daily schedules
├─── lib/ # Utility functions and library configurations, including Supabase clients.
├─── provider/ # React Context providers for managing global state (e.g., UserWalletProvider).
├─── public/ # Static assets like images and logos that are served directly.
├─── seed/ # Components and forms for seeding the database with test data during development.
└─── svgs/ # SVG icons used throughout the application.
```

## Entity Page Architecture

Each primary entity (e.g., Students, Teachers, Bookings) follows a consistent architectural pattern.

- **Data Flow**: Data is fetched on the server and passed to a client-side page component.
- **Filtering**: The page component provides filtering options (e.g., by month, last 3 months, last 6 months, all).
- **Stats Bar**: Each entity page uses the `@components/StatsBar.tsx` component, which updates based on the selected filter.
- **Table Structure**: Each entity page has a dedicated `...Table.tsx` and `...Row.tsx` component to display data.
- **Add New Form**: A form for creating a new entity is included, with its visibility toggled via a `useState` and `useEffect` hook.
- **Master Dashboard (kPlanned)**: All entity pages will inherit from a common `MasterDashboard` component to ensure a consistent layout and shared logic.

### Conventions

- **`components/tables`**: This convention is for components that define the headers and columns for data tables.
- **`components/rows`**: This is for components that render the individual rows of data within the tables.
- **`components/links`**: This is for UI components like dropdowns that trigger API interactions.

## Core Architecture Components

### TimeZone Utilities (`components/formatters/TimeZone.ts`)

A comprehensive timezone-safe utility module that prevents timezone conversion issues across the application:

- **`createUTCDateTime(date, time)`**: Creates UTC Date from date/time strings
- **`toUTCString(date)`**: Converts Date to UTC ISO string  
- **`extractTimeFromUTC(isoString)`**: Extracts HH:MM from UTC ISO string
- **`addMinutesToTime(time, minutes)`**: Adds minutes to time string
- **`timeToMinutes()` / `minutesToTime()`**: Converts between time formats
- **`getCurrentUTCDate()` / `getCurrentUTCTime()`**: Gets current UTC values

**Usage**: Import specific functions instead of using native Date operations to ensure consistent timezone handling.

### Teacher Schedule System (`backend/TeacherSchedule.ts`)

A linked list implementation for managing teacher daily schedules:

- **Linked List Structure**: Each schedule node contains time, duration, and type (event/gap)
- **Static Utilities**: Helper methods for time manipulation and schedule creation
- **Conflict Detection**: Identifies scheduling conflicts and suggests alternatives
- **Gap Analysis**: Finds available time slots between events

**Architecture**: Pure linked list with no external dependencies, using TimeZone utilities for all time operations.

### Whiteboard Application (`app/whiteboard/`)

The core admin interface for managing daily kite lessons and events:

- **WhiteboardClient.tsx**: Main container component that renders sub-components based on active section
- **Section Components**: Bookings, Lessons, Events, Controller, Status - each handling specific data views
- **Real-time Filtering**: Filters all data by selected date with live updates
- **Event Controller**: Manages event creation settings and real-time schedule coordination

**Data Flow**: Server-side data fetching → Client filtering → Component rendering → User interactions

## TODO List

### High Priority
- [ ] Create searchbar component
- [ ] Create layout for tables  
- [ ] Create teacher portal
- [ ] Finish whiteboard admin playbook

### Schema Updates
- [ ] Migrate schema - add user last name field
- [ ] Make structure editable constants for easy maintenance

### Development Tasks
- [ ] Implement user invitation system
- [ ] Enhance navigation dropdown functionality
- [ ] Optimize form validation and error handling