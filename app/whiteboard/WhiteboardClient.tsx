"use client";

import { useState, useEffect, useMemo } from "react";
import WhiteboardMiniNav from "./WhiteboardMiniNav";
import WhiteboardBookings from "./WhiteboardBookings";
import WhiteboardLessons from "./WhiteboardLessons";
import WhiteboardEvents from "./WhiteboardEvents";
import WhiteboardStatus from "./WhiteboardStatus";
import WhiteboardWeather from "./WhiteboardWeather";
import { WhiteboardData } from "@/actions/whiteboard-actions";
import { WhiteboardClass } from "@/backend/WhiteboardClass";
import { TeacherSchedule } from "@/backend/TeacherSchedule";
import {
  getStoredDate,
  setStoredDate,
  getTodayDateString,
} from "@/components/formatters/DateTime";
import { type BookingStatusFilter, LOCATION_ENUM_VALUES } from "@/lib/constants";
import { type EventController, type WhiteboardActionHandler } from "@/backend/types";
import { ShareUtils } from "@/backend/ShareUtils";

const STORAGE_KEY = "whiteboard-selected-date";

const WHITEBOARD_SECTIONS = [
  {
    id: "bookings",
    name: "Bookings",
    description: "See all available bookings",
  },
  {
    id: "lessons",
    name: "Lessons",
    description: "See all teachers with lessons",
  },
  { id: "events", name: "Events", description: "See all ongoing lessons" },
  {
    id: "weather",
    name: "Weather",
    description: "See forecast at 3PM for planning",
  },
  { id: "status", name: "Status", description: "See all stats & more..." },
] as const;

interface WhiteboardClientProps {
  data: WhiteboardData;
}

export default function WhiteboardClient({ data }: WhiteboardClientProps) {
  const [activeSection, setActiveSection] = useState("bookings");
  const [selectedDate, setSelectedDate] = useState(() => getTodayDateString()); // Use consistent default
  
  // Filter state - simplified to only booking filter
  const [bookingFilter, setBookingFilter] = useState<BookingStatusFilter>("all");

  // Controller state for event creation (includes duration settings)
  const [controller, setController] = useState<EventController>({
    flag: false,
    location: LOCATION_ENUM_VALUES[0],
    submitTime: "11:00",
    durationCapOne: 120,     // Will be updated by DurationSettings component
    durationCapTwo: 180,     // Will be updated by DurationSettings component  
    durationCapThree: 240,   // Will be updated by DurationSettings component
  });


  const handleDateChange = (date: string) => {
    // Validate the date before setting it
    if (!date || isNaN(Date.parse(date))) {
      console.error("Invalid date provided to handleDateChange:", date);
      return;
    }
    
    setSelectedDate(date);
    setStoredDate(STORAGE_KEY, date);
  };

  const handleBookingFilterChange = (filter: BookingStatusFilter) => {
    setBookingFilter(filter);
  };

  const handleActionClick: WhiteboardActionHandler = async (actionId) => {
    try {
      const shareData = ShareUtils.extractShareData(
        selectedDate,
        filteredData.teacherSchedules,
        filteredData.events
      );
      
      switch (actionId) {
        case "share":
          const whatsappMessage = ShareUtils.generateWhatsAppMessage(shareData);
          ShareUtils.shareToWhatsApp(whatsappMessage);
          break;
          
        case "medical":
          const { subject, body } = ShareUtils.generateMedicalEmail(selectedDate, filteredData.events);
          ShareUtils.sendMedicalEmail(subject, body);
          break;
          
        case "csv":
          const csvData = ShareUtils.generateCSVData(shareData);
          const csvFilename = `kite-schedule-${selectedDate}.csv`;
          ShareUtils.downloadCSV(csvData, csvFilename);
          break;
          
        case "print":
          await ShareUtils.downloadPrintTable(shareData);
          break;
          
        default:
          console.warn(`Unknown action: ${actionId}`);
      }
    } catch (error) {
      console.error(`Error executing ${actionId} action:`, error);
    }
  };

  // Load stored date after mount to avoid hydration issues
  useEffect(() => {
    const storedDate = getStoredDate(STORAGE_KEY);
    
    // Validate the stored date
    const isValidDate = storedDate && !isNaN(Date.parse(storedDate));
    
    if (isValidDate) {
      setSelectedDate(storedDate);
    } else {
      // If stored date is invalid, use today's date and clear storage
      const today = getTodayDateString();
      setSelectedDate(today);
      setStoredDate(STORAGE_KEY, today);
    }
  }, []);


  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash && WHITEBOARD_SECTIONS.some((section) => section.id === hash)) {
        setActiveSection(hash);
      }
    };

    // Set initial state from URL hash
    handleHashChange();

    // Listen for hash changes
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Filter data based on selected date and booking status filter using useMemo
  const filteredData = useMemo(() => {
    // Validate selectedDate before processing
    if (!selectedDate || isNaN(Date.parse(selectedDate))) {
      return {
        bookings: [],
        bookingClasses: [],
        lessons: [],
        events: [],
        teacherSchedules: new Map(),
        status: {
          totalBookings: 0,
          totalLessons: 0,
          totalEvents: 0,
          activeBookings: 0,
          completableBookings: 0,
          averageProgress: 0,
          totalUsedMinutes: 0,
          totalAvailableMinutes: 0,
        },
      };
    }
    
    const filterDate = new Date(selectedDate);
    filterDate.setHours(0, 0, 0, 0);

    // Filter bookings by date - check if the selected date falls within booking date range
    const dateFilteredBookings = data.rawBookings.filter((booking) => {
      const bookingStart = new Date(booking.date_start);
      const bookingEnd = new Date(booking.date_end);
      bookingStart.setHours(0, 0, 0, 0);
      bookingEnd.setHours(23, 59, 59, 999);

      // Check if selected date falls within booking date range
      return filterDate >= bookingStart && filterDate <= bookingEnd;
    });

    // Apply booking status filter
    const statusFilteredBookings = bookingFilter === 'all' 
      ? dateFilteredBookings
      : dateFilteredBookings.filter(booking => booking.status === bookingFilter);

    // Create WhiteboardClass instances for enhanced business logic
    const bookingClasses = statusFilteredBookings.map(
      (booking) => new WhiteboardClass(booking),
    );

    // Enhanced filtering using business logic
    const activeBookingClasses = bookingClasses.filter(
      (bc) => bc.getStatus() === "active",
    );
    const completableBookingClasses = bookingClasses.filter((bc) =>
      bc.isReadyForCompletion(),
    );

    // Extract lessons with proper date filtering (keeping original structure for compatibility)
    const filteredLessons = statusFilteredBookings.flatMap(
      (booking) =>
        booking.lessons?.map((lesson: any) => {
          // Keep all original events for border logic
          const originalEvents = lesson.events || [];

          // Filter events for the selected date (for the Events section)
          const eventsForSelectedDate =
            lesson.events?.filter((event: any) => {
              // If event has no date, include it (it's part of the lesson/booking period)
              if (!event.date) return true;

              // If event has a date, check if it matches the selected date
              const eventDate = new Date(event.date);
              eventDate.setHours(0, 0, 0, 0);
              return eventDate.getTime() === filterDate.getTime();
            }) || [];

          return {
            ...lesson,
            originalEvents: originalEvents,
            events: eventsForSelectedDate,
            selectedDate: selectedDate,
            booking: booking, // Direct reference to booking with all relations
          };
        }) || [],
    );

    // Create events array from filtered lessons
    const filteredEvents = filteredLessons.flatMap(
      (lesson) =>
        lesson.events?.map((event: any) => ({
          ...event,
          lesson: {
            id: lesson.id,
            teacher: lesson.teacher,
            status: lesson.status,
          },
          booking: lesson.booking,
        })) || [],
    );

    // Enhanced statistics using business logic
    const enhancedStats = {
      totalBookings: statusFilteredBookings.length,
      totalLessons: filteredLessons.length,
      totalEvents: filteredEvents.length,
      activeBookings: activeBookingClasses.length,
      completableBookings: completableBookingClasses.length,
      // Calculate total progress across all bookings
      averageProgress: Math.round(
        bookingClasses.reduce(
          (sum, bc) => sum + bc.getCompletionPercentage(),
          0,
        ) / (bookingClasses.length || 1),
      ),
      // Calculate utilization rates
      totalUsedMinutes: bookingClasses.reduce(
        (sum, bc) => sum + bc.getUsedMinutes(),
        0,
      ),
      totalAvailableMinutes: bookingClasses.reduce(
        (sum, bc) => sum + bc.getTotalMinutes(),
        0,
      ),
    };

    // Create unified TeacherSchedule instances for both lessons and events
    const teacherSchedules = TeacherSchedule.createSchedulesFromLessons(
      selectedDate,
      filteredLessons,
    );

    return {
      bookings: statusFilteredBookings,
      bookingClasses, // Enhanced WhiteboardClass instances for business logic
      lessons: filteredLessons,
      events: filteredEvents,
      teacherSchedules, // Unified TeacherSchedule instances
      status: enhancedStats,
    };
  }, [data, selectedDate, bookingFilter]);


  const handleSectionClick = (sectionId: string) => {
    setActiveSection(sectionId);
    window.location.hash = sectionId;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar - Mobile: sticky top, Desktop: sticky sidebar */}
      <div className="md:hidden sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border p-2">
        <WhiteboardMiniNav
          activeSection={activeSection}
          onSectionClick={handleSectionClick}
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
          bookingsCount={filteredData.bookings.length}
          lessonsCount={filteredData.lessons.length}
          eventsCount={filteredData.events.length}
          bookingFilter={bookingFilter}
          onBookingFilterChange={handleBookingFilterChange}
          onActionClick={handleActionClick}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 w-full px-4">
        {/* Desktop Sidebar */}
        <div className="hidden md:block col-span-1">
          <div className="sticky top-4 p-4">
            <WhiteboardMiniNav
              activeSection={activeSection}
              onSectionClick={handleSectionClick}
              selectedDate={selectedDate}
              onDateChange={handleDateChange}
              bookingsCount={filteredData.bookings.length}
              lessonsCount={filteredData.lessons.length}
              eventsCount={filteredData.events.length}
              bookingFilter={bookingFilter}
              onBookingFilterChange={handleBookingFilterChange}
              onActionClick={handleActionClick}
            />
          </div>
        </div>

        {/* Content */}
        <div className="md:col-span-3 xl:col-span-3 2xl:col-span-4 pt-4">
          <div className="bg-card">
            <div className="p-4">
              <div className="w-full">
                {activeSection === "bookings" && (
                  <WhiteboardBookings 
                    bookings={filteredData.bookings} 
                    bookingClasses={filteredData.bookingClasses}
                    selectedDate={selectedDate}
                    teacherSchedules={filteredData.teacherSchedules}
                    controller={controller}
                    teachers={data.teachers}
                  />
                )}

                {activeSection === "lessons" && (
                  <WhiteboardLessons
                    lessons={filteredData.lessons}
                    selectedDate={selectedDate}
                    teacherSchedules={filteredData.teacherSchedules}
                    controller={controller}
                    onControllerChange={setController}
                  />
                )}

                {activeSection === "events" && (
                  <WhiteboardEvents
                    events={filteredData.events}
                    selectedDate={selectedDate}
                    teacherSchedules={filteredData.teacherSchedules}
                    viewAs="admin"
                  />
                )}

                {activeSection === "weather" && (
                  <WhiteboardWeather
                    selectedDate={selectedDate}
                    location="Tarifa, Spain"
                    lat={36.0128}
                    lon={-5.6081}
                  />
                )}


                {activeSection === "status" && (
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
