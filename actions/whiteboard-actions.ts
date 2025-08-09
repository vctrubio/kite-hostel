"use server";

import { getBookings } from "./booking-actions";

export interface WhiteboardData {
  bookings: any[];
  lessons: any[];
  events: any[];
  kites: any[];
  status: {
    totalBookings: number;
    totalLessons: number;
    totalEvents: number;
    activeBookings: number;
  };
}

export async function getWhiteboardData(): Promise<{ data: WhiteboardData | null; error: string | null }> {
  try {
    // Get all bookings with full relations
    const bookingsResult = await getBookings();

    // Check for errors
    if (bookingsResult.error) {
      return { data: null, error: `Bookings error: ${bookingsResult.error}` };
    }

    const bookings = bookingsResult.data || [];
    
    // Extract kites from events in lessons (already included in booking relations)
    const kites = bookings.flatMap(booking => 
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
    const lessons = bookings.flatMap(booking => 
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

    // Calculate status data
    const activeBookings = bookings.filter(booking => booking.status === 'active').length;

    const whiteboardData: WhiteboardData = {
      bookings,
      lessons,
      events,
      kites: uniqueKites,
      status: {
        totalBookings: bookings.length,
        totalLessons: lessons.length,
        totalEvents: events.length,
        activeBookings,
      },
    };

    return { data: whiteboardData, error: null };
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Error fetching whiteboard data:", error);
    return { data: null, error: errorMessage };
  }
}
