"use server";

import db from "@/drizzle";
import { InferSelectModel } from "drizzle-orm";
import {
  Booking,
  PackageStudent,
  Lesson,
  Event,
  KiteEvent,
  Kite,
  user_wallet,
  Student,
  BookingStudent,
  Teacher,
} from "@/drizzle/migrations/schema";
import { eq, count, and, desc, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { BookingWithRelations } from "@/backend/types";

export async function getBookingCountByPackageId(packageId: string) {
  try {
    const result = await db
      .select({ count: count() })
      .from(Booking)
      .where(eq(Booking.package_id, packageId));

    return { count: result[0].count, error: null };
  } catch (error: any) {
    console.error(
      `Error fetching booking count for package with ID ${packageId} with Drizzle:`,
      error,
    );
    return { count: 0, error: error.message };
  }
}

export async function getBookingById(
  id: string,
): Promise<{ data: BookingWithRelations | null; error: string | null }> {
  try {
    const booking = await db.query.Booking.findFirst({
      where: eq(Booking.id, id),
      with: {
        lessons: {
          with: {
            teacher: true,
            commission: true,
            events: {
              with: {
                kites: true,
              },
            },
          },
        },
        package: true,
        reference: {
          with: {
            teacher: true,
          },
        },
        students: {
          with: {
            student: true,
          },
        },
      },
    });

    if (!booking) {
      return { data: null, error: "Booking not found." };
    }

    const bookingWithLessonCount = {
      ...booking,
      lessonCount: booking.lessons?.length ?? 0,
    };

    return {
      data: bookingWithLessonCount as BookingWithRelations,
      error: null,
    };
  } catch (error: any) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    console.error(
      `Error fetching booking with ID ${id} with Drizzle:`,
      error,
      "Full error object:",
      JSON.stringify(error, Object.getOwnPropertyNames(error)),
    );
    return { data: null, error: errorMessage };
  }
}

export async function getBookings(): Promise<{
  data: BookingWithRelations[];
  error: string | null;
}> {
  try {
    const bookings = await db.query.Booking.findMany({
      with: {
        package: true,
        reference: {
          with: {
            teacher: true,
          },
        },
        students: {
          with: {
            student: true,
          },
        },
        lessons: {
          with: {
            teacher: true,
            commission: true,
            events: {
              with: {
                kites: true,
              },
            },
          },
        },
      },
    });

    const bookingsWithLessonCount = bookings.map((booking) => ({
      ...booking,
      lessonCount: booking.lessons?.length ?? 0,
    }));

    return {
      data: bookingsWithLessonCount as BookingWithRelations[],
      error: null,
    };
  } catch (error: any) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    console.error(
      "Error fetching bookings with Drizzle:",
      error,
      "Full error object:",
      JSON.stringify(error, Object.getOwnPropertyNames(error)),
    );
    return { data: [], error: errorMessage };
  }
}

interface CreateBookingParams {
  package_id: string;
  date_start: string;
  date_end: string;
  student_ids: string[];
  reference_id: string | null;
}

export async function createBooking({
  package_id,
  date_start,
  date_end,
  student_ids,
  reference_id,
}: CreateBookingParams): Promise<{
  success: boolean;
  error: string | null;
  bookingId?: string;
}> {
  try {
    const newBooking = await db
      .insert(Booking)
      .values({
        package_id,
        date_start,
        date_end,
        status: "active", // Default status
        reference_id,
      })
      .returning();

    if (newBooking.length === 0) {
      return { success: false, error: "Failed to create booking record." };
    }

    const bookingId = newBooking[0].id;

    if (student_ids.length > 0) {
      const bookingStudents = student_ids.map((student_id) => ({
        booking_id: bookingId,
        student_id,
      }));
      await db.insert(BookingStudent).values(bookingStudents);
    }

    revalidatePath("/bookings");
    revalidatePath("/bookings/form");
    revalidatePath("/students");
    revalidatePath("/billboard");
    return { success: true, bookingId, error: null };
  } catch (error: any) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to create booking.";
    console.error(
      "Error creating booking:",
      error,
      "Full error object:",
      JSON.stringify(error, Object.getOwnPropertyNames(error)),
    );
    return { success: false, error: errorMessage };
  }
}

export async function updateBookingStatus(
  bookingId: string,
  status: "active" | "uncomplete" | "completed",
): Promise<{ success: boolean; error: string | null }> {
  try {
    await db.update(Booking).set({ status }).where(eq(Booking.id, bookingId));
    revalidatePath("/bookings");
    return { success: true, error: null };
  } catch (error: any) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to update booking status.";
    console.error(
      `Error updating booking status for booking ${bookingId}:`,
      error,
      "Full error object:",
      JSON.stringify(error, Object.getOwnPropertyNames(error)),
    );
    return { success: false, error: errorMessage };
  }
}

export async function updateBookingDates(
  bookingId: string,
  dateStart: string,
  dateEnd: string,
): Promise<{ success: boolean; error: string | null }> {
  try {
    await db
      .update(Booking)
      .set({ 
        date_start: dateStart,
        date_end: dateEnd 
      })
      .where(eq(Booking.id, bookingId));

    revalidatePath("/bookings");
    revalidatePath("/whiteboard");
    revalidatePath("/billboard");
    revalidatePath(`/bookings/${bookingId}`);

    return { success: true, error: null };
  } catch (error: any) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to update booking dates.";
    console.error(
      `Error updating booking dates for booking ${bookingId}:`,
      error,
      "Full error object:",
      JSON.stringify(error, Object.getOwnPropertyNames(error)),
    );
    return { success: false, error: errorMessage };
  }
}

export async function deleteBooking(
  bookingId: string,
): Promise<{ success: boolean; error: string | null }> {
  try {
    // Find all lessons related to the booking
    const lessons = await db
      .select()
      .from(Lesson)
      .where(eq(Lesson.booking_id, bookingId));
    const lessonIds = lessons.map((lesson) => lesson.id);

    if (lessonIds.length > 0) {
      // Find all events related to these lessons
      const events = await db
        .select()
        .from(Event)
        .where(and(...lessonIds.map((id) => eq(Event.lesson_id, id))));
      const eventIds = events.map((event) => event.id);

      if (eventIds.length > 0) {
        // Delete all kite events related to these events
        await db
          .delete(KiteEvent)
          .where(and(...eventIds.map((id) => eq(KiteEvent.event_id, id))));
      }

      // Delete all events related to these lessons
      await db
        .delete(Event)
        .where(and(...lessonIds.map((id) => eq(Event.lesson_id, id))));
    }

    // Delete all lessons related to the booking
    await db.delete(Lesson).where(eq(Lesson.booking_id, bookingId));

    // Delete all booking-student associations
    await db
      .delete(BookingStudent)
      .where(eq(BookingStudent.booking_id, bookingId));

    // Finally, delete the booking itself
    await db.delete(Booking).where(eq(Booking.id, bookingId));

    revalidatePath("/bookings");
    revalidatePath("/whiteboard");

    return { success: true, error: null };
  } catch (error: any) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to delete booking.";
    console.error(
      `Error deleting booking with ID ${bookingId}:`,
      error,
      "Full error object:",
      JSON.stringify(error, Object.getOwnPropertyNames(error)),
    );
    return { success: false, error: errorMessage };
  }
}
