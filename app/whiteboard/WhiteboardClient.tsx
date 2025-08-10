'use client';

import { useState, useEffect, useMemo } from 'react';
import WhiteboardNav from './WhiteboardNav';
import WhiteboardBookings from './WhiteboardBookings';
import WhiteboardLessons from './WhiteboardLessons';
import WhiteboardEvents from './WhiteboardEvents';
import WhiteboardEventController from './WhiteboardEventController';
import WhiteboardStatus from './WhiteboardStatus';
import { WhiteboardData } from '@/actions/whiteboard-actions';
import { getStoredDate, setStoredDate, getTodayDateString } from '@/components/formatters/DateTime';
import { type EventController } from '@/backend/types';
import { LOCATION_ENUM_VALUES } from '@/lib/constants';
export type { EventController };

const STORAGE_KEY = 'whiteboard-selected-date';

const WHITEBOARD_SECTIONS = [
  { id: 'bookings', name: 'Bookings', description: 'See all available bookings' },
  { id: 'lessons', name: 'Lessons', description: 'See all teachers with lessons' },
  { id: 'events', name: 'Events', description: 'See all ongoing lessons' },
  { id: 'controller', name: 'Controller', description: 'Event creation settings' },
  { id: 'status', name: 'Status', description: 'See all stats & more...' },
] as const;

interface WhiteboardClientProps {
  data: WhiteboardData;
}

export default function WhiteboardClient({ data }: WhiteboardClientProps) {
  const [activeSection, setActiveSection] = useState('bookings');
  const [selectedDate, setSelectedDate] = useState(() => getTodayDateString()); // Use consistent default

  // Event Controller State
  const [controller, setController] = useState<EventController>({
    flag: false, // Will be set based on whether there are events for this date
    location: LOCATION_ENUM_VALUES[0], // Default to first location from enum
    durationCapOne: 120, // Duration for single student lessons (1:30hrs)
    durationCapTwo: 180, // Duration for 2+ student lessons (2:00hrs)  
    durationCapThree: 240, // Duration for large group lessons (3:00hrs)
    submitTime: '11:00', // Default start time for events
  });

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setStoredDate(STORAGE_KEY, date);
  };

  // Load stored date after mount to avoid hydration issues
  useEffect(() => {
    const storedDate = getStoredDate(STORAGE_KEY);
    setSelectedDate(storedDate);
  }, []);

  // Initialize controller with current time if today is selected
  useEffect(() => {
    const now = new Date();
    const isToday = selectedDate === getTodayDateString();
    
    if (isToday) {
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      // Round up to next 30-minute interval
      let roundedMinute = currentMinute <= 30 ? 30 : 60;
      let roundedHour = currentHour;
      
      if (roundedMinute === 60) {
        roundedHour += 1;
        roundedMinute = 0;
      }
      
      const timeString = `${roundedHour.toString().padStart(2, '0')}:${roundedMinute.toString().padStart(2, '0')}`;
      
      setController(prev => ({
        ...prev,
        submitTime: timeString
      }));
    } else {
      // Reset to default time for future dates
      setController(prev => ({
        ...prev,
        submitTime: '11:00'
      }));
    }
  }, [selectedDate]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && WHITEBOARD_SECTIONS.some(section => section.id === hash)) {
        setActiveSection(hash);
      }
    };

    // Set initial state from URL hash
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Filter data based on selected date
  const filteredData = useMemo(() => {
    const filterDate = new Date(selectedDate);
    filterDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(filterDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Filter bookings by date - check if the selected date falls within booking date range
    const filteredBookings = data.rawBookings.filter(booking => {
      const bookingStart = new Date(booking.date_start);
      const bookingEnd = new Date(booking.date_end);
      bookingStart.setHours(0, 0, 0, 0);
      bookingEnd.setHours(23, 59, 59, 999);
      
      // Check if selected date falls within booking date range
      return filterDate >= bookingStart && filterDate <= bookingEnd;
    });

    // Filter lessons from filtered bookings - keep original events and filter events for selected date
    const filteredLessons = filteredBookings.flatMap(booking => 
      booking.lessons?.map((lesson: any) => {
        // Keep all original events for border logic
        const originalEvents = lesson.events || [];
        
        // Filter events for the selected date (for the Events section)
        const eventsForSelectedDate = lesson.events?.filter((event: any) => {
          // If event has no date, include it (it's part of the lesson/booking period)
          if (!event.date) {
            return true;
          }
          
          // If event has a date, check if it matches the selected date
          const eventDate = new Date(event.date);
          eventDate.setHours(0, 0, 0, 0);
          return eventDate.getTime() === filterDate.getTime();
        }) || [];

        return {
          ...lesson,
          // Keep original events for checking if lesson has events for selected date
          originalEvents: originalEvents,
          // Filtered events for the selected date (used in Events section)
          events: eventsForSelectedDate,
          // Pass the selected date for border logic
          selectedDate: selectedDate,
          booking: {
            id: booking.id,
            package: booking.package,
            students: booking.students,
            date_start: booking.date_start,
            date_end: booking.date_end,
            status: booking.status,
          }
        };
      }) || []
    );

    // Create events array from filtered lessons (events are already filtered by selected date in filteredLessons)
    const filteredEvents = filteredLessons.flatMap(lesson => 
      lesson.events?.map((event: any) => ({
        ...event,
        lesson: {
          id: lesson.id,
          teacher: lesson.teacher,
          status: lesson.status,
        },
        booking: lesson.booking,
      })) || []
    );

    // Calculate status data for filtered results
    const activeBookings = filteredBookings.filter(booking => booking.status === 'active').length;

    return {
      bookings: filteredBookings,
      lessons: filteredLessons,
      events: filteredEvents,
      status: {
        totalBookings: filteredBookings.length,
        totalLessons: filteredLessons.length,
        totalEvents: filteredEvents.length,
        activeBookings,
      },
    };
  }, [data, selectedDate]);

  // Update controller flag based on whether there are events for the selected date
  useEffect(() => {
    const hasEvents = filteredData.events.length > 0;
    setController(prev => ({
      ...prev,
      flag: hasEvents
    }));
  }, [filteredData.events]);

  const handleSectionClick = (sectionId: string) => {
    setActiveSection(sectionId);
    window.location.hash = sectionId;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="grid grid-cols-1 xl:grid-cols-4 2xl:grid-cols-5 w-full px-4">
        {/* Sidebar */}
        <div className="xl:col-span-1 order-2 xl:order-1">
          <div className="xl:sticky xl:top-4 p-4">
            <WhiteboardNav
              activeSection={activeSection}
              onSectionClick={handleSectionClick}
              sections={WHITEBOARD_SECTIONS}
              selectedDate={selectedDate}
              onDateChange={handleDateChange}
              controller={controller}
              onControllerChange={setController}
              events={filteredData.events}
            />
          </div>
        </div>

        {/* Content */}
        <div className="xl:col-span-3 2xl:col-span-4 order-1 xl:order-2 pt-4">
          <div className="bg-card">
            <div className="p-4">
              <div className="w-full">
                {activeSection === 'bookings' && (
                  <WhiteboardBookings bookings={filteredData.bookings} />
                )}

                {activeSection === 'lessons' && (
                  <WhiteboardLessons 
                    lessons={filteredData.lessons} 
                    controller={controller}
                    selectedDate={selectedDate}
                  />
                )}

                {activeSection === 'events' && (
                  <WhiteboardEvents events={filteredData.events} />
                )}

                {activeSection === 'controller' && (
                  <WhiteboardEventController 
                    controller={controller}
                    onControllerChange={setController}
                    events={filteredData.events}
                  />
                )}

                {activeSection === 'status' && (
                  <WhiteboardStatus 
                    bookings={filteredData.bookings}
                    lessons={filteredData.lessons}
                    events={filteredData.events}
                    kites={data.kites}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
