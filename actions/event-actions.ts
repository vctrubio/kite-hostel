"use server";

import db from "@/drizzle";
import { Event, Lesson, Booking, BookingStudent, Student, Teacher, KiteEvent, Kite, PackageStudent, Commission } from "@/drizzle/migrations/schema";
import { eq, sql } from "drizzle-orm";
import { format } from "date-fns";

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