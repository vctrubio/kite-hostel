# Teacher Column Group Architecture Documentation

## Overview

The Billboard application's teacher management system is organized around a hierarchical component structure that manages teacher scheduling, drag-and-drop operations, and time adjustments. This document outlines the responsibilities and relationships between components within the BillboardClient.

## Component Hierarchy

```
BillboardClient
├── BillboardHeader (Stats, Settings, Actions)
├── TeacherColumn (Manages multiple teachers)
│   ├── TeacherColumnRow (Individual teacher logic)
│   │   └── TeacherGrouping (UI wrapper)
│   │       ├── TeacherLeftColumn (Teacher info & controls)
│   │       └── TeacherRightContent (Event cards & queue editor)
│   │           ├── EventCards (when viewMode = "event")
│   │           └── TeacherQueueEditor (when viewMode = "queue")
└── StudentBookingColumn (Drag source for bookings)
```

## Core Responsibilities

### 1. BillboardClient
**Primary Role**: Application orchestrator and state management hub

**Responsibilities**:
- **Date Management**: Handles selectedDate state and localStorage persistence
- **Data Processing**: Creates TeacherQueues from BillboardClasses using billboardUtils
- **Export Operations**: Manages CSV, Excel, WhatsApp, and print exports via BillboardExportUtils
- **Drag & Drop Coordination**: Manages draggedBooking state between StudentBookingColumn and TeacherColumn
- **Action Handling**: Processes "No Wind" cancellations and other billboard-wide actions
- **Statistics Calculation**: Aggregates global stats (events, hours, earnings) from all teacher queues

**Key State**:
- `selectedDate`: Current date filter
- `controller`: Event controller settings (duration, location)
- `draggedBooking`: Currently dragged BillboardClass
- `exportDebugMode`: Debug mode for export functions

### 2. BillboardHeader
**Primary Role**: Dashboard and control center

**Responsibilities**:
- **Statistics Display**: Shows aggregated teacher count, student count, event statistics
- **Event Status Management**: Bulk operations (confirm all, plan all, set TBC, delete events)
- **Date Selection**: Single date picker for filtering
- **Controller Settings**: Event duration, location, and equipment settings
- **Export Controls**: Debug mode toggle and action buttons
- **No Wind Operations**: Emergency cancellation interface with confirmation

**Key Features**:
- Responsive stats grid with color-coded metrics
- Dropdown actions for bulk event management
- Toggle switches for debug and no-wind modes

### 3. TeacherColumn
**Primary Role**: Multi-teacher coordination and global time management

**Responsibilities**:
- **Parent Time Adjustment**: Coordinates global time changes across all teachers
- **Teacher State Orchestration**: Manages pending updates and teacher synchronization
- **Global Flag Time**: Calculates earliest lesson time across all teachers
- **Teacher Queue Management**: Creates TeacherColumnRow instances for each teacher
- **Drag & Drop Integration**: Passes draggedBooking to individual teacher components

**Key State**:
- `parentTimeAdjustmentMode`: Global time adjustment mode
- `parentGlobalTime`: Synchronized time across all teachers
- `pendingParentUpdateTeachers`: Set of teachers waiting for global updates

**Parent Time Object**:
```typescript
interface ParentTime {
  adjustmentMode: boolean;           // Global time adjustment active
  globalTime: string | null;         // Synchronized time display
  onAdjustment: (offset: number) => void;    // Global time adjustment handler
  onAccept: () => void;              // Accept global changes
  onCancel: () => void;              // Cancel global changes
  onFlagClick: () => void;           // Toggle global adjustment mode
}
```

### 4. TeacherColumnRow (formerly TeacherQueueGroup)
**Primary Role**: Individual teacher logic and state management

**Responsibilities**:
- **View Mode Management**: Toggles between "event" and "queue" views
- **Time Adjustment Logic**: Individual teacher time adjustments
- **Queue State Management**: Handles editable vs original schedule nodes
- **Database Operations**: Event creation, updates, and deletions
- **Reset/Cancel Logic**: Manages undo operations and state restoration
- **Parent Integration**: Coordinates with global time adjustment system

**Key State**:
- `viewMode`: "event" | "queue" - determines UI display
- `timeAdjustmentMode`: Individual time adjustment active
- `globalTimeOffset`: Current time offset for this teacher
- `editableScheduleNodes`: Modified schedule data for queue editing
- `originalQueueState`: Backup for reset operations

**View Modes**:
- **Event Mode**: Displays EventCards with drag-and-drop capabilities
- **Queue Mode**: Shows TeacherQueueEditor for detailed schedule management

### 5. TeacherGrouping
**Primary Role**: UI layout wrapper and drag-and-drop handler

**Responsibilities**:
- **Layout Structure**: Two-column layout (teacher info + content area)
- **Drag Compatibility**: Validates dragged bookings against teacher assignments
- **Drop Handling**: Processes booking drops and creates events
- **Visual Feedback**: Provides drag-over visual states (compatible/incompatible)
- **Content Rendering**: Renders children (EventCards or TeacherQueueEditor)

**Drag States**:
- `compatible`: Teacher is assigned to the dragged booking's lesson
- `incompatible`: Teacher not assigned to the lesson
- `null`: No active drag operation

### 6. TeacherLeftColumn
**Primary Role**: Teacher information and control interface

**Responsibilities**:
- **Teacher Identity**: Name display with headset icon
- **Time Flag Display**: Shows/edits individual teacher start times
- **Statistics Panel**: Events, duration, teacher earnings, school earnings
- **Action Buttons**: Context-sensitive controls based on current mode
- **Time Adjustment Controls**: Chevron buttons for time modifications

**Button Contexts**:
- **Event Mode**: "Edit Schedule" button
- **Queue Mode**: "Submit", "Reset", "Cancel" buttons
- **Time Adjustment Mode**: Chevron controls for time shifting

### 7. TeacherRightContent
**Primary Role**: Dynamic content area with drag-and-drop capabilities

**Responsibilities**:
- **Content Switching**: Renders EventCards or TeacherQueueEditor based on view mode
- **Drag Zone Management**: Handles drag events for the entire content area
- **Visual Feedback**: Border color changes during drag operations
- **Layout Container**: Provides consistent spacing and layout for content

### 8. TeacherQueueEditor
**Primary Role**: Detailed schedule editing interface

**Responsibilities**:
- **Schedule Node Rendering**: Displays editable lesson queue
- **Gap Detection**: Identifies and allows removal of time gaps
- **Lesson Management**: Direct integration with TeacherQueue methods
- **Position Controls**: Move lessons up/down in the queue
- **Duration Adjustments**: Modify lesson durations
- **Time Modifications**: Adjust individual lesson start times
- **Removal Operations**: Delete lessons with cascade effects

**Direct TeacherQueue Integration**:
- Uses `teacherQueue.adjustLessonDuration()` directly
- Uses `teacherQueue.adjustLessonTime()` directly  
- Uses `teacherQueue.moveLessonUp/Down()` directly
- Uses `teacherQueue.removeGap()` for gap removal

### 9. StudentBookingColumn
**Primary Role**: Booking source and drag initiation

**Responsibilities**:
- **Booking Filtering**: Available, All, Completed states with counts
- **Drag Source**: Initiates drag operations for valid bookings
- **Booking Display**: Shows booking cards with teacher assignment validation
- **Filter Management**: Dynamic filtering with count display in buttons

**Filter Logic**:
- **Available**: Bookings without events for selected date
- **All**: Non-completed bookings
- **Completed**: Bookings with completed status

## Data Flow

### 1. Initial Load
```
BillboardActions → BillboardData → BillboardClient
                                ↓
                        createTeacherQueuesFromBillboardClasses
                                ↓
                        TeacherQueue instances → TeacherColumn
```

### 2. Drag & Drop Flow
```
StudentBookingColumn (drag start) → BillboardClient (draggedBooking state)
                                ↓
                        TeacherColumn → TeacherColumnRow → TeacherGrouping
                                ↓
                        Drop validation → TeacherQueue.addEventAction()
```

### 3. Time Adjustment Flow
```
TeacherColumn (parent mode) → TeacherColumnRow (individual mode)
                          ↓
                    TeacherGrouping → TeacherLeftColumn (UI controls)
                          ↓
                    TeacherQueue time methods → Database updates
```

### 4. Queue Editing Flow
```
TeacherColumnRow (queue mode) → TeacherQueueEditor
                            ↓
                    Direct TeacherQueue method calls
                            ↓
                    Database updates → UI refresh
```

## Key Design Patterns

### 1. Prop Drilling Elimination
- **Parent Time Object**: Consolidated 6 individual props into single object
- **Direct Method Calls**: TeacherQueueEditor uses TeacherQueue methods directly
- **Ref Forwarding**: TeacherColumnRow exposes submit method via useImperativeHandle

### 2. State Management
- **Local State**: Component-specific UI states (view modes, edit states)
- **Lifted State**: Shared states managed at appropriate levels
- **Ref Management**: Direct component method access where needed

### 3. Separation of Concerns
- **UI Components**: Focus on presentation and user interaction
- **Business Logic**: Concentrated in TeacherQueue and BillboardClass
- **Data Operations**: Handled by dedicated action functions

### 4. Performance Optimization
- **useMemo**: Expensive calculations cached appropriately
- **useCallback**: Event handlers memoized to prevent re-renders
- **Direct Integration**: Reduced prop passing for frequently used operations

## Backend Integration

### TeacherQueue Class
- **Event Management**: addEventAction, removeFromQueueWithCascade
- **Time Operations**: adjustLessonTime, adjustLessonDuration
- **Queue Operations**: moveLessonUp, moveLessonDown, removeGap
- **State Access**: getNodes, getAllEvents, getSchedule, getTeacherStats

### BillboardClass
- **Booking Data**: Wraps booking information for billboard calculations
- **Teacher Validation**: hasTeacher method for drag compatibility
- **Student Information**: getStudentNames, getStudents
- **Time Calculations**: getRemainingMinutes, duration calculations

## Export System

The export system is centralized in BillboardExportUtils and supports:
- **CSV Export**: Event data in spreadsheet format
- **Excel Export**: Rich formatting with multiple sheets
- **WhatsApp Integration**: Formatted message generation and sharing
- **Print Output**: HTML generation for printing schedules
- **Medical Emails**: Automated medical emergency notifications

All exports extract data from TeacherQueues using `extractShareDataFromTeacherQueues()` utility.