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

export async function createEvent(eventData: EventData) {
  try {
    const supabase = await createClient();

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
        status: 'planned'
      })
      .select()
      .single();

    if (eventError) {
      console.error('❌ Event creation failed:', eventError);
      return { success: false, error: eventError.message };
    }

    revalidatePath('/whiteboard');
    return { success: true, data: eventResult };
  } catch (error) {
    console.error('🔥 Error creating event:', error);
    return { success: false, error: 'Failed to create event' };
  }
}

export async function deleteEvent(eventId: string) {
  try {
    const supabase = await createClient();

    // Delete the event
    const { error: deleteError } = await supabase
      .from('event')
      .delete()
      .eq('id', eventId);

    if (deleteError) {
      console.error('❌ Event deletion failed:', deleteError);
      return { success: false, error: deleteError.message };
    }

    revalidatePath('/whiteboard');
    return { success: true };
  } catch (error) {
    console.error('🔥 Error deleting event:', error);
    return { success: false, error: 'Failed to delete event' };
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
      students: sql`
        (SELECT json_agg(s.name)
         FROM booking_student bs
         JOIN student s ON bs.student_id = s.id
         WHERE bs.booking_id = ${Booking.id})
      `.as("students"),
    })
    .from(Event)
    .leftJoin(Lesson, eq(Event.lesson_id, Lesson.id))
    .leftJoin(Teacher, eq(Lesson.teacher_id, Teacher.id))
    .leftJoin(Commission, eq(Lesson.commission_id, Commission.id))
    .leftJoin(Booking, eq(Lesson.booking_id, Booking.id))
    .leftJoin(PackageStudent, eq(Booking.package_id, PackageStudent.id))
    .leftJoin(KiteEvent, eq(Event.id, KiteEvent.event_id))
    .leftJoin(Kite, eq(KiteEvent.kite_id, Kite.id));

    const formattedEvents = events.map((event) => {
      if (!event.packagePricePerStudent || !event.packageDuration || !event.teacher || 
          !event.eventLocation || !event.commissionPerHour) {
        throw new Error(`Missing required data for event ${event.eventId}`);
      }

      const eventDate = new Date(event.eventDate);
      const formattedDate = format(eventDate, "dd-MM-yy | HH:mm");
      const studentsList = Array.isArray(event.students) ? event.students.join(", ") : "";
      const kiteInfo = event.kiteModel && event.kiteSerialId ? `${event.kiteModel} (${event.kiteSerialId})` : "No kite assigned";
      
      // Calculate price per hour from package
      const pricePerHour = (event.packagePricePerStudent / (event.packageDuration / 60)).toFixed(2);

      return {
        date: formattedDate,
        duration: `${event.eventDuration} min`,
        teacher: event.teacher,
        students: studentsList,
        location: event.eventLocation,
        kite: kiteInfo,
        pricePerHour: `${pricePerHour}€`,
        commissionPerHour: `${event.commissionPerHour}€`,
      };
    });

    return { data: formattedEvents, error: null };
  } catch (error: any) {
    console.error("Error fetching event CSV data:", error);
    return { data: null, error: error.message };
  }
}