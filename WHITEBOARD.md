# Whiteboard System Documentation

## Overview
The whiteboard system provides a daily view of bookings, lessons, and events filtered by a selected date. It uses localStorage for date persistence and provides real-time filtering of data.

## Architecture

### Components Structure
```
WhiteboardClient (Main container)
├── WhiteboardNav (Sidebar with date picker and actions)
├── WhiteboardBookings (Booking cards display)
├── WhiteboardLessons (Lesson cards display)  
├── WhiteboardEvents (Event cards display)
└── WhiteboardStatus (Status overview)
```

### Data Flow
```
Server Action (whiteboard-actions.ts)
    ↓
WhiteboardClient (filtering logic)
    ↓
Child Components (display filtered data)
```

## Data Filtering Logic

### 1. Booking Filtering
**Rule**: Show bookings where the selected date falls within the booking date range.

```typescript
const filteredBookings = data.bookings.filter(booking => {
  const bookingStart = new Date(booking.date_start);
  const bookingEnd = new Date(booking.date_end);
  bookingStart.setHours(0, 0, 0, 0);
  bookingEnd.setHours(23, 59, 59, 999);
  
  // Check if selected date falls within booking date range
  return filterDate >= bookingStart && filterDate <= bookingEnd;
});
```

**Example**: 
- Booking: Aug 1-15
- Selected Date: Aug 8
- Result: ✅ Included (Aug 8 is between Aug 1-15)

### 2. Lesson Filtering
**Rule**: Include all lessons from filtered bookings.

```typescript
const filteredLessons = filteredBookings.flatMap(booking => 
  booking.lessons?.map((lesson: any) => ({
    ...lesson,
    booking: { /* booking info */ }
  })) || []
);
```

**Logic**: If a booking is active on the selected date, all its lessons are relevant.

### 3. Event Filtering
**Rule**: Include events that either:
- Have no date (part of the lesson/booking period)
- Have a date that matches the selected date exactly

```typescript
const filteredEvents = filteredLessons.flatMap(lesson => {
  const allEvents = lesson.events || [];
  
  const filteredEventsForLesson = allEvents.filter((event: any) => {
    // If event has no date, include it
    if (!event.date) {
      return true;
    }
    
    // If event has a date, check if it matches the selected date
    const eventDate = new Date(event.date);
    eventDate.setHours(0, 0, 0, 0);
    return eventDate.getTime() === filterDate.getTime();
  });
  
  return filteredEventsForLesson.map(event => ({
    ...event,
    lesson: { /* lesson info */ },
    booking: { /* booking info */ }
  }));
});
```

**Examples**:
- Event with no date → ✅ Always included
- Event dated Aug 8, selected Aug 8 → ✅ Included
- Event dated Aug 9, selected Aug 8 → ❌ Excluded

## Common Issues & Debugging

### Issue: Events Missing
**Symptoms**: Booking shows 2 events, but Events section shows only 1.

**Debugging Steps**:
1. Check console logs for event filtering
2. Verify event dates format
3. Check timezone issues
4. Verify date comparison logic

**Debug Logging**:
```typescript
console.log(`Event ${event.id} date: ${event.date}, selected: ${selectedDate}, matches: ${matches}`);
console.log(`Lesson ${lesson.id} has ${allEvents.length} total events, ${filteredEventsForLesson.length} filtered events`);
```

### Issue: Hydration Errors
**Solution**: Use DateTime formatter components instead of native Date methods.

**Bad**:
```typescript
new Date(date).toLocaleDateString()
```

**Good**:
```typescript
<DateTime dateString={date} formatType="date" />
```

## State Management

### Date Selection
- **Storage**: localStorage with key `'whiteboard-selected-date'`
- **Fallback**: Today's date if no stored date
- **Format**: YYYY-MM-DD

### Section Navigation
- **Storage**: URL hash (#bookings, #lessons, etc.)
- **Default**: 'bookings'

## Data Structure

### Booking Object
```typescript
{
  id: string,
  date_start: string,
  date_end: string,
  status: 'active' | 'completed' | ...,
  package: { description: string },
  students: Array<{ student: { name: string } }>,
  lessons: Array<Lesson>
}
```

### Lesson Object
```typescript
{
  id: string,
  teacher: { name: string },
  status: 'planned' | 'completed' | 'rest',
  events: Array<Event>,
  booking: BookingInfo // injected by filtering
}
```

### Event Object
```typescript
{
  id: string,
  date?: string, // Optional - events without dates are always included
  location: string,
  duration: number, // in minutes
  status: 'planned' | 'completed' | 'tbc' | 'cancelled',
  lesson: LessonInfo, // injected by filtering
  booking: BookingInfo // injected by filtering
}
```

## Performance Considerations

### Memoization
- `filteredData` is memoized with dependencies: `[data, selectedDate]`
- Recalculates only when data or selected date changes

### Lazy Initialization
- Date state initialized with localStorage lookup
- No mounting state needed due to safe localStorage utilities

## Future Improvements

### Event Filtering Options
Consider adding filter modes:
- **Strict**: Only events on selected date (current)
- **Inclusive**: All events from active bookings
- **Range**: Events within booking date range

### Performance
- Add virtual scrolling for large datasets
- Implement data pagination
- Add search/filter capabilities

### UI Enhancements
- Add loading states
- Implement error boundaries
- Add data refresh capabilities
