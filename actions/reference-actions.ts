"use server";

import db from "@/drizzle";
import { Booking, PackageStudent, user_wallet, Teacher, BookingStudent, Student } from "@/drizzle/migrations/schema";
import { eq, isNotNull } from "drizzle-orm";

export async function getAllReferencedBookings() {
  try {
    const referencedBookings = await db
      .select({
        bookingId: Booking.id,
        bookingCreatedAt: Booking.created_at,
        bookingStartDate: Booking.date_start,
        bookingEndDate: Booking.date_end,
        referenceId: Booking.reference_id,
        packageCapacity: PackageStudent.capacity_students,
        packagePrice: PackageStudent.price_per_student,
        packageDuration: PackageStudent.duration,
        packageDescription: PackageStudent.description,
        teacherName: Teacher.name,
        note: user_wallet.note,
        role: user_wallet.role,
      })
      .from(Booking)
      .innerJoin(PackageStudent, eq(Booking.package_id, PackageStudent.id))
      .innerJoin(user_wallet, eq(Booking.reference_id, user_wallet.id))
      .leftJoin(Teacher, eq(user_wallet.pk, Teacher.id))
      .where(isNotNull(Booking.reference_id));

    // Fetch students for each booking
    const bookingsWithStudents = await Promise.all(
      referencedBookings.map(async (booking) => {
        const students = await db
          .select({
            id: Student.id,
            name: Student.name,
            last_name: Student.last_name,
          })
          .from(Student)
          .innerJoin(BookingStudent, eq(Student.id, BookingStudent.student_id))
          .where(eq(BookingStudent.booking_id, booking.bookingId));

        return {
          ...booking,
          students,
        };
      })
    );

    return { data: bookingsWithStudents, error: null };
  } catch (error: any) {
    console.error("Error fetching referenced bookings:", error);
    return { data: null, error: error.message };
  }
}
