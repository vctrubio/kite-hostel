"use server";

import db from "@/drizzle";
import { Booking, PackageStudent, user_wallet, Teacher } from "@/drizzle/migrations/schema";
import { eq, isNotNull } from "drizzle-orm";

export async function getAllReferencedBookings() {
  try {
    const referencedBookings = await db
      .select({
        bookingCreatedAt: Booking.created_at,
        bookingStartDate: Booking.date_start,
        referenceId: Booking.reference_id,
        packageCapacity: PackageStudent.capacity_students,
        packagePrice: PackageStudent.price_per_student,
        teacherName: Teacher.name,
        note: user_wallet.note,
        role: user_wallet.role,
      })
      .from(Booking)
      .innerJoin(PackageStudent, eq(Booking.package_id, PackageStudent.id))
      .innerJoin(user_wallet, eq(Booking.reference_id, user_wallet.id))
      .leftJoin(Teacher, eq(user_wallet.pk, Teacher.id))
      .where(isNotNull(Booking.reference_id));

    return { data: referencedBookings, error: null };
  } catch (error: any) {
    console.error("Error fetching referenced bookings:", error);
    return { data: null, error: error.message };
  }
}
