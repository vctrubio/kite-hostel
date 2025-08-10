# Teacher Event Scheduling System

This document outlines the new teacher event scheduling system implemented for the whiteboard application.

## Architecture Overview

The system is built around a linked list data structure to manage teacher schedules, allowing for efficient insertion, conflict detection, and gap management between lessons.

### Core Components

#### 1. TeacherSchedule Class (`/backend/TeacherSchedule.ts`)
- **Purpose**: Manages a single teacher's schedule for a specific date
- **Data Structure**: Linked list of schedule items (events and gaps)
- **Key Features**:
  - Chronological ordering of events
  - Automatic conflict detection
  - Available slot calculation
  - Gap management between lessons

#### 2. TeacherScheduleManager Class (`/backend/TeacherScheduleManager.ts`)
- **Purpose**: Manages all teacher schedules for a given date
- **Key Features**:
  - Cross-teacher scheduling operations
  - Schedule initialization from lesson data
  - Utilization tracking and analytics
  - Teacher availability lookup

#### 3. EventToTeacherModal Component (`/components/modals/EventToTeacherModal.tsx`)
- **Purpose**: UI for adding events to teacher schedules
- **Key Features**:
  - Pre-filled data from event controller
  - Real-time conflict detection
  - Alternative time suggestions
  - Gap management (before/after events)

## Data Models

### Schedule Items

```typescript
interface EventScheduleItem {
  type: 'event';
  startTime: string; // HH:MM format
  duration: number; // minutes
  lessonId: string;
  studentCount: number;
  status: 'planned' | 'active' | 'completed';
  location: string;
  students: Array<{ id: string; name: string }>;
}

interface GapScheduleItem {
  type: 'gap';
  startTime: string;
  duration: number;
  reason: 'break' | 'travel' | 'custom';
  description?: string;
}
```

### Schedule Management

```typescript
interface TeacherDaySchedule {
  teacherId: string;
  teacherName: string;
  date: string;
  items: ScheduleItem[]; // Linked list of events and gaps
  totalDuration: number;
  workingHours: { start: string; end: string };
}
```

## User Flow

### Adding an Event to a Teacher

1. **Click on Lesson Card**: User clicks on a lesson in the WhiteboardLessons component
2. **Modal Opens**: EventToTeacherModal opens with pre-filled data from EventController
3. **Configuration**: User can adjust:
   - Start time
   - Duration (auto-suggested based on student count)
   - Location
   - Gap before/after (for breaks, travel time)
4. **Conflict Detection**: Real-time checking for schedule conflicts
5. **Alternative Suggestions**: If conflicts exist, system suggests available time slots
6. **Confirmation**: Event is added to teacher's schedule with proper linking

### Conflict Resolution

When a conflict is detected:
- **Visual Warning**: Clear indication of conflicting items
- **Alternative Times**: Up to 3 suggested available slots
- **Selection Interface**: User can select an alternative time
- **Automatic Adjustment**: System adjusts the event time based on selection

## Key Features

### 1. Intelligent Duration Selection
- **Single Student**: 1:30hrs default
- **2-3 Students**: 2:00hrs default  
- **4+ Students**: 3:00hrs default
- **Manual Override**: User can adjust duration

### 2. Gap Management
- **Break Time**: Add gaps between lessons for teacher breaks
- **Travel Time**: Account for location changes
- **Custom Gaps**: Flexible gap configuration

### 3. Schedule Visualization
- **Chronological Order**: Events automatically ordered by time
- **Conflict Highlighting**: Visual indicators for scheduling conflicts
- **Utilization Metrics**: Teacher workload and schedule density

### 4. Data Integration
- **Event Controller**: Inherits settings from whiteboard event controller
- **Lesson Context**: Automatically pulls student information and lesson details
- **Date Awareness**: Integrates with selected date from whiteboard

## Technical Implementation

### Linked List Benefits
1. **Efficient Insertion**: O(n) insertion while maintaining chronological order
2. **Gap Calculation**: Easy to find available time slots between events
3. **Conflict Detection**: Simple overlap checking between adjacent items
4. **Dynamic Scheduling**: Flexible addition/removal of events and gaps

### State Management
- **WhiteboardLessons**: Manages modal state and event creation
- **TeacherScheduleManager**: Maintains schedule data and provides scheduling operations
- **EventController**: Provides default values and configuration

### Error Handling
- **Conflict Prevention**: Pre-validation before event creation
- **User Feedback**: Clear messaging for conflicts and resolutions
- **Graceful Degradation**: Fallback options when conflicts cannot be resolved

## Usage Examples

### Creating a Teacher Schedule
```typescript
const scheduleManager = TeacherScheduleManager.fromLessonsData(
  selectedDate, 
  lessons
);

const teacherSchedule = scheduleManager.getOrCreateTeacherSchedule(
  teacherId, 
  teacherName
);
```

### Adding an Event
```typescript
const result = scheduleManager.addEventToTeacher(teacherId, teacherName, {
  lessonId: 'lesson_123',
  startTime: '14:00',
  duration: 120,
  location: 'Los Lances',
  studentCount: 2,
  gapBefore: 15, // 15 min break before
  gapAfter: 0
});

if (result.success) {
  console.log('Event added successfully');
} else {
  console.log('Conflict detected:', result.conflict);
}
```

### Checking Availability
```typescript
const availableSlots = teacherSchedule.getAvailableSlots(120); // 2 hour minimum
const conflict = teacherSchedule.checkConflict('14:00', 120);
```

## Future Enhancements

1. **Drag & Drop**: Visual schedule editor with drag-and-drop
2. **Recurring Events**: Support for repeated lessons
3. **Multi-Day Scheduling**: Schedule across multiple days
4. **Resource Management**: Integration with kite and equipment availability
5. **Notifications**: Alerts for schedule changes and conflicts
6. **Export/Import**: Schedule data exchange formats

## Integration Points

- **WhiteboardClient**: Provides date context and event controller
- **WhiteboardLessons**: Displays lessons and triggers event creation
- **EventController**: Provides default scheduling parameters
- **Backend Actions**: API integration for persisting schedule data
