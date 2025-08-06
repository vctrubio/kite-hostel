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
      const eventDate = new Date(event.eventDate);
      const formattedDate = format(eventDate, "dd-MM-yy | HH:mm");
      const studentsList = event.students ? event.students.join(", ") : "N/A";
      const kiteInfo = event.kiteModel && event.kiteSerialId ? `${event.kiteModel} (${event.kiteSerialId})` : "N/A";
      
      // Calculate price per hour from package
      const pricePerHour = event.packagePricePerStudent && event.packageDuration
        ? (event.packagePricePerStudent / (event.packageDuration / 60)).toFixed(2)
        : "N/A";

      return {
        date: formattedDate,
        duration: `${event.eventDuration} min`,
        teacher: event.teacher || "N/A",
        students: studentsList,
        location: event.eventLocation || "N/A",
        kite: kiteInfo,
        pricePerHour: pricePerHour,
        commissionPerHour: event.commissionPerHour ? `${event.commissionPerHour}€` : "N/A",
      };
    });

    return { data: formattedEvents, error: null };
  } catch (error: any) {
    console.error("Error fetching event CSV data:", error);
    return { data: null, error: error.message };
  }
}