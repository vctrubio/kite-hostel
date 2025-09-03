"use server";

import db from "@/drizzle";
import { Event, Lesson, Booking, BookingStudent, Student, Teacher, KiteEvent, Kite, PackageStudent, Commission } from "@/drizzle/migrations/schema";
import { eq, sql } from "drizzle-orm";
import { format } from "date-fns";
import { revalidatePath } from "next/cache";
import { LOCATION_ENUM_VALUES, type Location } from "@/lib/constants";
import { createClient } from '@/lib/supabase/server';
import { createUTCDateTime, toUTCString } from '@/components/formatters/TimeZone';

interface EventData {
  lessonId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  durationMinutes: number;
  location: Location;
}

interface QueueEventData {
  lessonId: string;
  date: string;
  startTime: string;
  duration: number; // Queue events use 'duration'
  location: string;
  [key: string]: any; // Allow additional properties from queue
}

export async function createEvent(eventData: EventData & { status?: "planned" | "completed" | "tbc" | "cancelled" }) {
  try {
    const supabase = await createClient();

    // Validate that event date falls within booking date range
    const { data: lessonData, error: lessonError } = await supabase
      .from('lesson')
      .select(`
        id,
        booking:booking_id (
          id,
          date_start,
          date_end,
          status
        )
      `)
      .eq('id', eventData.lessonId)
      .single();

    if (lessonError || !lessonData?.booking) {
      console.error('❌ Failed to fetch lesson/booking data:', lessonError);
      return { success: false, error: 'Invalid lesson or booking not found' };
    }

    const booking = lessonData.booking;
    const eventDate = new Date(eventData.date);
    const bookingStartDate = new Date(booking.date_start);
    const bookingEndDate = new Date(booking.date_end);

    // Normalize dates for comparison (remove time component)
    eventDate.setHours(0, 0, 0, 0);
    bookingStartDate.setHours(0, 0, 0, 0);
    bookingEndDate.setHours(0, 0, 0, 0);

    // Validate event date is within booking range
    if (eventDate < bookingStartDate || eventDate > bookingEndDate) {
      return { 
        success: false, 
        error: `Event date must be between ${bookingStartDate.toISOString().split('T')[0]} and ${bookingEndDate.toISOString().split('T')[0]}` 
      };
    }

    // Validate booking is active
    if (booking.status !== 'active') {
      return { 
        success: false, 
        error: `Cannot create event for ${booking.status} booking` 
      };
    }

    // Create UTC datetime using our timezone utility
    const eventDateTimeISO = toUTCString(createUTCDateTime(eventData.date, eventData.startTime));

    // Insert the event
    const { data: eventResult, error: eventError } = await supabase
      .from('event')
      .insert({
        lesson_id: eventData.lessonId,
        date: eventDateTimeISO,
        duration: eventData.durationMinutes,
        location: eventData.location,
        status: eventData.status || 'planned'
      })
      .select()
      .single();

    if (eventError) {
      console.error('❌ Event creation failed:', eventError);
      return { success: false, error: eventError.message };
    }

    revalidatePath('/whiteboard');
    revalidatePath('/billboard');
    return { success: true, data: eventResult };
  } catch (error) {
    console.error('🔥 Error creating event:', error);
    return { success: false, error: 'Failed to create event' };
  }
}

export async function createTeacherQueueEvents(events: QueueEventData[]) {
  try {
    const supabase = await createClient();
    const results = [];

    console.log('🚀 Creating teacher queue events:', events.length);

    // Process events sequentially to avoid database conflicts
    for (const eventData of events) {
      console.log('📝 Creating event:', eventData);
      
      // Validate that event date falls within booking date range
      const { data: lessonData, error: lessonError } = await supabase
        .from('lesson')
        .select(`
          id,
          booking:booking_id (
            id,
            date_start,
            date_end,
            status
          )
        `)
        .eq('id', eventData.lessonId)
        .single();

      if (lessonError || !lessonData?.booking) {
        console.error('❌ Failed to fetch lesson/booking data for queue event:', lessonError);
        results.push({ success: false, lessonId: eventData.lessonId, error: 'Invalid lesson or booking not found' });
        continue;
      }

      const booking = lessonData.booking;
      const eventDate = new Date(eventData.date);
      const bookingStartDate = new Date(booking.date_start);
      const bookingEndDate = new Date(booking.date_end);

      // Normalize dates for comparison (remove time component)
      eventDate.setHours(0, 0, 0, 0);
      bookingStartDate.setHours(0, 0, 0, 0);
      bookingEndDate.setHours(0, 0, 0, 0);

      // Validate event date is within booking range
      if (eventDate < bookingStartDate || eventDate > bookingEndDate) {
        const errorMsg = `Event date must be between ${bookingStartDate.toISOString().split('T')[0]} and ${bookingEndDate.toISOString().split('T')[0]}`;
        console.error('❌ Date validation failed for queue event:', errorMsg);
        results.push({ success: false, lessonId: eventData.lessonId, error: errorMsg });
        continue;
      }

      // Validate booking is active
      if (booking.status !== 'active') {
        const errorMsg = `Cannot create event for ${booking.status} booking`;
        console.error('❌ Booking status validation failed for queue event:', errorMsg);
        results.push({ success: false, lessonId: eventData.lessonId, error: errorMsg });
        continue;
      }
      
      // Create UTC datetime using our timezone utility
      const eventDateTimeISO = toUTCString(createUTCDateTime(eventData.date, eventData.startTime));

      // Insert the event
      const { data: eventResult, error: eventError } = await supabase
        .from('event')
        .insert({
          lesson_id: eventData.lessonId,
          date: eventDateTimeISO,
          duration: eventData.duration, // Queue events use 'duration' property
          location: eventData.location,
          status: 'planned'
        })
        .select()
        .single();

      if (eventError) {
        console.error('❌ Event creation failed for lesson:', eventData.lessonId, eventError);
        results.push({ success: false, lessonId: eventData.lessonId, error: eventError.message });
      } else {
        console.log('✅ Event created successfully for lesson:', eventData.lessonId);
        results.push({ success: true, lessonId: eventData.lessonId, data: eventResult });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    console.log(`📊 Queue creation complete: ${successCount} success, ${failureCount} failures`);

    revalidatePath('/whiteboard');
    revalidatePath('/billboard');
    return { 
      success: failureCount === 0, 
      results,
      summary: { successCount, failureCount, total: events.length }
    };
  } catch (error) {
    console.error('🔥 Error creating teacher queue events:', error);
    return { success: false, error: 'Failed to create queue events' };
  }
}

export async function deleteEvent(eventId: string) {
  try {
    const supabase = await createClient();

    // First, delete any KiteEvent associations (cascade should handle this, but let's be explicit)
    const { error: kiteEventError } = await supabase
      .from('kite_event')
      .delete()
      .eq('event_id', eventId);

    if (kiteEventError) {
      console.error('❌ KiteEvent deletion failed:', kiteEventError);
      return { success: false, error: kiteEventError.message };
    }

    // Then delete the event itself
    const { error: deleteError } = await supabase
      .from('event')
      .delete()
      .eq('id', eventId);

    if (deleteError) {
      console.error('❌ Event deletion failed:', deleteError);
      return { success: false, error: deleteError.message };
    }

    revalidatePath('/whiteboard');
    revalidatePath('/billboard');
    revalidatePath('/events');
    return { success: true };
  } catch (error) {
    console.error('🔥 Error deleting event:', error);
    return { success: false, error: 'Failed to delete event' };
  }
}

export async function updateEvent(eventId: string, updates: {
  date?: string;
  status?: "planned" | "completed" | "tbc" | "cancelled";
  location?: "Los Lances" | "Valdevaqueros" | "Palmones";
  duration?: number;
}) {
  try {
    const supabase = await createClient();

    // Only update fields that are provided
    const updateData: any = {};
    if (updates.date !== undefined) updateData.date = updates.date;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.location !== undefined) updateData.location = updates.location;
    if (updates.duration !== undefined) updateData.duration = updates.duration;

    if (Object.keys(updateData).length === 0) {
      return { success: false, error: "No fields to update" };
    }

    const { error: updateError } = await supabase
      .from('event')
      .update(updateData)
      .eq('id', eventId);

    if (updateError) {
      console.error('❌ Event update failed:', updateError);
      return { success: false, error: updateError.message };
    }
    
    revalidatePath("/whiteboard");
    revalidatePath("/billboard");
    revalidatePath("/events");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating event:", error);
    return { success: false, error: error.message };
  }
}

export async function getEvents() {
  try {
    const events = await db.select({
      id: Event.id,
      date: Event.date,
      duration: Event.duration,
      location: Event.location,
      status: Event.status,
      created_at: Event.created_at,
      teacher: {
        id: Teacher.id,
        name: Teacher.name,
      },
      commission_per_hour: Commission.price_per_hour,
      package: {
        description: PackageStudent.description,
        price_per_student: PackageStudent.price_per_student,
        duration: PackageStudent.duration,
        capacity_kites: PackageStudent.capacity_kites,
      },
      kite: {
        model: Kite.model,
        serial_id: Kite.serial_id,
        size: Kite.size,
      },
      booking_id: Booking.id,
    })
    .from(Event)
    .leftJoin(Lesson, eq(Event.lesson_id, Lesson.id))
    .leftJoin(Teacher, eq(Lesson.teacher_id, Teacher.id))
    .leftJoin(Commission, eq(Lesson.commission_id, Commission.id))
    .leftJoin(Booking, eq(Lesson.booking_id, Booking.id))
    .leftJoin(PackageStudent, eq(Booking.package_id, PackageStudent.id))
    .leftJoin(KiteEvent, eq(Event.id, KiteEvent.event_id))
    .leftJoin(Kite, eq(KiteEvent.kite_id, Kite.id));

    // Now fetch students for each event using Drizzle subqueries
    const eventsWithStudents = await Promise.all(
      events.map(async (event) => {
        if (!event.booking_id) {
          return {
            ...event,
            students: [],
            student_count: 0,
          };
        }

        const students = await db
          .select({
            id: Student.id,
            name: Student.name,
            last_name: Student.last_name,
          })
          .from(Student)
          .innerJoin(BookingStudent, eq(Student.id, BookingStudent.student_id))
          .where(eq(BookingStudent.booking_id, event.booking_id));

        return {
          ...event,
          students,
          student_count: students.length,
          booking_id: undefined, // Remove booking_id from final result
        };
      })
    );

    return { data: eventsWithStudents, error: null };
  } catch (error: any) {
    console.error("Error fetching events:", error);
    return { data: null, error: error.message };
  }
}

export async function getEventCsv() {
  try {
    const events = await db.select({
      eventId: Event.id,
      eventDate: Event.date,
      eventDuration: Event.duration,
      eventLocation: Event.location,
      teacher: Teacher.name,
      commissionPerHour: Commission.price_per_hour,
      packageName: PackageStudent.description,
      packagePricePerStudent: PackageStudent.price_per_student,
      packageDuration: PackageStudent.duration,
      kiteModel: Kite.model,
      kiteSerialId: Kite.serial_id,
      kiteSize: Kite.size,
      booking_id: Booking.id,
    })
    .from(Event)
    .leftJoin(Lesson, eq(Event.lesson_id, Lesson.id))
    .leftJoin(Teacher, eq(Lesson.teacher_id, Teacher.id))
    .leftJoin(Commission, eq(Lesson.commission_id, Commission.id))
    .leftJoin(Booking, eq(Lesson.booking_id, Booking.id))
    .leftJoin(PackageStudent, eq(Booking.package_id, PackageStudent.id))
    .leftJoin(KiteEvent, eq(Event.id, KiteEvent.event_id))
    .leftJoin(Kite, eq(KiteEvent.kite_id, Kite.id));

    // Fetch students for each event using proper Drizzle queries
    const eventsWithStudents = await Promise.all(
      events.map(async (event) => {
        let students: Array<{id: string, name: string, last_name: string | null}> = [];
        
        if (event.booking_id) {
          students = await db
            .select({
              id: Student.id,
              name: Student.name,
              last_name: Student.last_name,
            })
            .from(Student)
            .innerJoin(BookingStudent, eq(Student.id, BookingStudent.student_id))
            .where(eq(BookingStudent.booking_id, event.booking_id));
        }

        return { ...event, students };
      })
    );

    const formattedEvents = eventsWithStudents.map((event) => {
      if (!event.packagePricePerStudent || !event.packageDuration || !event.teacher || 
          !event.eventLocation || !event.commissionPerHour) {
        throw new Error(`Missing required data for event ${event.eventId}`);
      }

      const eventDate = new Date(event.eventDate);
      const formattedDate = format(eventDate, "dd-MM-yy | HH:mm");
      
      // Format student names properly
      const studentsList = event.students.map(student => 
        `${student.name} ${student.last_name || ''}`).join(", ");
      
      // Format kite info
      const kiteInfo = event.kiteModel && event.kiteSerialId 
        ? `${event.kiteModel} ${event.kiteSize}m (${event.kiteSerialId})` 
        : "No kite assigned";
      
      // Calculate price per hour per student and format cleanly
      const pricePerHour = event.packagePricePerStudent / (event.packageDuration / 60);
      const formattedPricePerHour = pricePerHour % 1 === 0 ? pricePerHour.toString() : pricePerHour.toFixed(2);
      
      // Format commission per hour cleanly  
      const formattedCommission = event.commissionPerHour % 1 === 0 ? event.commissionPerHour.toString() : event.commissionPerHour.toFixed(2);
      
      // Convert duration to hours
      const durationInHours = event.eventDuration / 60;
      const formattedDuration = durationInHours % 1 === 0 ? `${durationInHours}h` : `${durationInHours.toFixed(2)}h`;

      return {
        date: formattedDate,
        teacher: event.teacher,
        students: studentsList,
        location: event.eventLocation,
        duration: formattedDuration,
        kite: kiteInfo,
        pricePerHourPerStudent: `€${formattedPricePerHour}/h`,
        commissionPerHour: `€${formattedCommission}/h`,
      };
    });

    return { data: formattedEvents, error: null };
  } catch (error: any) {
    console.error("Error fetching event CSV data:", error);
    return { data: null, error: error.message };
  }
}