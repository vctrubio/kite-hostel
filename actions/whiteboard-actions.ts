"use server";

import { getBookings } from "./booking-actions";
import { WhiteboardClass, createBookingClasses } from "@/backend/WhiteboardClass";
import { TeacherSchedule } from "@/backend/TeacherSchedule";
import { type BookingData } from "@/backend/types";

export interface WhiteboardData {
  // Remove bookingClasses from server response - can't serialize classes
  rawBookings: BookingData[]; // Main data for client-side class creation
  lessons: any[];
  events: any[];
  kites: any[];
  status: {
    totalBookings: number;
    totalLessons: number;
    totalEvents: number;
    activeBookings: number;
    completableBookings: number; // New: bookings ready for completion
  };
}

/**
 * Enhanced whiteboard data fetcher that returns serializable data
 * Client components will create WhiteboardClass instances from this data
 */
export async function getWhiteboardData(): Promise<{ data: WhiteboardData | null; error: string | null }> {
  try {
    // Get all bookings with full relations
    const bookingsResult = await getBookings();

    // Check for errors
    if (bookingsResult.error) {
      return { data: null, error: `Bookings error: ${bookingsResult.error}` };
    }

    const rawBookings = (bookingsResult.data || []).sort((a, b) => {
      const startA = new Date(a.date_start).getTime();
      const startB = new Date(b.date_start).getTime();
      if (startA !== startB) {
        return startA - startB;
      }
      // If start dates are equal, sort by end date
      const endA = new Date(a.date_end).getTime();
      const endB = new Date(b.date_end).getTime();
      return endA - endB;
    });
    
    // Create WhiteboardClass instances for analysis (server-side only)
    // We can't pass these to client, but we can use them for calculations
    const bookingClasses = createBookingClasses(rawBookings);
    
    // Extract kites from events in lessons (already included in booking relations)
    const kites = rawBookings.flatMap(booking => 
      booking.lessons?.flatMap(lesson => 
        lesson.events?.flatMap(event => 
          event.kites?.map(kiteEvent => kiteEvent.kite) || []
        ) || []
      ) || []
    );
    
    // Remove duplicate kites by ID
    const uniqueKites = kites.filter((kite, index, self) => 
      index === self.findIndex(k => k.id === kite.id)
    );
    
    // Extract lessons from all bookings
    const lessons = rawBookings.flatMap(booking => 
      booking.lessons?.map(lesson => ({
        ...lesson,
        booking: {
          id: booking.id,
          package: booking.package,
          students: booking.students,
          date_start: booking.date_start,
          date_end: booking.date_end,
          status: booking.status,
        }
      })) || []
    );

    // Extract events from all lessons
    const events = lessons.flatMap(lesson => 
      lesson.events?.map(event => ({
        ...event,
        lesson: {
          id: lesson.id,
          teacher: lesson.teacher,
          status: lesson.status,
        },
        booking: lesson.booking,
      })) || []
    );

    // Calculate enhanced status data using business logic
    const activeBookings = bookingClasses.filter(booking => booking.getStatus() === 'active').length;
    const completableBookings = bookingClasses.filter(booking => booking.isReadyForCompletion()).length;

    // Return only serializable data
    const whiteboardData: WhiteboardData = {
      rawBookings, // Client will create classes from this
      lessons,
      events,
      kites: uniqueKites,
      status: {
        totalBookings: rawBookings.length,
        totalLessons: lessons.length,
        totalEvents: events.length,
        activeBookings,
        completableBookings, // Calculated server-side
      },
    };

    return { data: whiteboardData, error: null };
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Error fetching whiteboard data:", error);
    return { data: null, error: errorMessage };
  }
}

/**
 * Get a specific booking's raw data by ID
 * Client will create WhiteboardClass instance from this
 */
export async function getBookingData(bookingId: string): Promise<{ data: BookingData | null; error: string | null }> {
  try {
    const result = await getWhiteboardData();
    if (result.error || !result.data) {
      return { data: null, error: result.error };
    }

    const bookingData = result.data.rawBookings.find(booking => booking.id === bookingId);
    if (!bookingData) {
      return { data: null, error: 'Booking not found' };
    }

    return { data: bookingData, error: null };
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return { data: null, error: errorMessage };
  }
}

export async function getFilteredWhiteboardData(selectedDate: string): Promise<{ data: any | null; error: string | null }> {
  try {
    const { data, error } = await getWhiteboardData();

    if (error || !data) {
      return { data: null, error };
    }

    const filterDate = new Date(selectedDate);
    filterDate.setHours(0, 0, 0, 0);

    const filteredBookings = data.rawBookings
      .filter(booking => {
        const bookingStart = new Date(booking.date_start);
        const bookingEnd = new Date(booking.date_end);
        bookingStart.setHours(0, 0, 0, 0);
        bookingEnd.setHours(23, 59, 59, 999);
        return filterDate >= bookingStart && filterDate <= bookingEnd;
      })
      .sort((a, b) => {
        // Sort by start date, earliest first
        return new Date(a.date_start).getTime() - new Date(b.date_start).getTime();
      });

    const bookingClasses = filteredBookings.map(booking => new WhiteboardClass(booking));
    const activeBookingClasses = bookingClasses.filter(bc => bc.getStatus() === 'active');
    const completableBookingClasses = bookingClasses.filter(bc => bc.isReadyForCompletion());

    const filteredLessons = filteredBookings.flatMap(booking => 
      booking.lessons?.map((lesson: any) => {
        const originalEvents = lesson.events || [];
        const eventsForSelectedDate = lesson.events?.filter((event: any) => {
          if (!event.date) return true;
          const eventDate = new Date(event.date);
          eventDate.setHours(0, 0, 0, 0);
          return eventDate.getTime() === filterDate.getTime();
        }) || [];

        return {
          ...lesson,
          originalEvents: originalEvents,
          events: eventsForSelectedDate,
          selectedDate: selectedDate,
          booking: booking
        };
      }) || []
    );

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

    const enhancedStats = {
      totalBookings: filteredBookings.length,
      totalLessons: filteredLessons.length,
      totalEvents: filteredEvents.length,
      activeBookings: activeBookingClasses.length,
      completableBookings: completableBookingClasses.length,
      averageProgress: Math.round(
        bookingClasses.reduce((sum, bc) => sum + bc.getCompletionPercentage(), 0) / 
        (bookingClasses.length || 1)
      ),
      totalUsedMinutes: bookingClasses.reduce((sum, bc) => sum + bc.getUsedMinutes(), 0),
      totalAvailableMinutes: bookingClasses.reduce((sum, bc) => sum + bc.getTotalMinutes(), 0),
    };

    const teacherSchedules = TeacherSchedule.createSchedulesFromLessons(selectedDate, filteredLessons);

    return {
      data: {
        bookings: filteredBookings,
        bookingClasses,
        lessons: filteredLessons,
        events: filteredEvents,
        teacherSchedules,
        status: enhancedStats,
      },
      error: null,
    };
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return { data: null, error: errorMessage };
  }
}
