"use server";

import db from "@/drizzle";
import { Event, Lesson, Booking, BookingStudent, Student, Teacher, KiteEvent, Kite, PackageStudent, Commission } from "@/drizzle/migrations/schema";
import { eq, sql } from "drizzle-orm";
import { format } from "date-fns";
import { revalidatePath } from "next/cache";
import { LOCATION_ENUM_VALUES, type Location } from "@/lib/constants";

export async function createEvent(eventData: {
  lessonId: string;
  startTime: string;
  duration: number;
  location: string;
  date: string;
  studentCount: number;
}) {
  try {
    console.log('🕐 Server Action Debug Info:');
    console.log('- Received date:', eventData.date);
    console.log('- Received startTime:', eventData.startTime);
    console.log('- Server timezone:', Intl.DateTimeFormat().resolvedOptions().timeZone);
    
    // Create the datetime string and explicitly parse as UTC to avoid timezone shifts
    const dateTimeString = `${eventData.date}T${eventData.startTime}:00.000Z`;
    console.log('- UTC string:', dateTimeString);
    
    const eventDateTime = new Date(dateTimeString);
    console.log('- Date object:', eventDateTime);
    console.log('- ISO string (stored):', eventDateTime.toISOString());
    
    // Validate location is valid enum value
    const location = eventData.location as Location;
    if (!LOCATION_ENUM_VALUES.includes(location)) {
      throw new Error(`Invalid location: ${eventData.location}`);
    }
    
    // Create the event in the database
    const [newEvent] = await db.insert(Event).values({
      lesson_id: eventData.lessonId,
      date: eventDateTime.toISOString(),
      duration: eventData.duration,
      location: location,
      status: 'planned' as const, // Default status
    }).returning();

    // Revalidate the whiteboard data
    revalidatePath("/whiteboard");
    
    return { success: true, event: newEvent };
  } catch (error: any) {
    console.error("Error creating event:", error);
    return { success: false, error: error.message };
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