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

type BookingWithRelations = InferSelectModel<typeof Booking> & {
  lessons: (InferSelectModel<typeof Lesson> & {
    events: (InferSelectModel<typeof Event> & {
      kites: (InferSelectModel<typeof KiteEvent> & { kite: InferSelectModel<typeof Kite> })[];
    })[];
  })[];
  package: InferSelectModel<typeof PackageStudent>;
  reference: (InferSelectModel<typeof user_wallet> & { teacher: InferSelectModel<typeof Teacher> | null }) | null;
  students: (InferSelectModel<typeof BookingStudent> & { student: InferSelectModel<typeof Student> })[];
  lessonCount: number;
};

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
      error
    );
    return { count: 0, error: error.message };
  }
}

export async function getBookingById(id: string): Promise<{ data: BookingWithRelations | null; error: string | null }> {
  try {
    const booking = await db.query.Booking.findFirst({
      where: eq(Booking.id, id),
      with: {
        lessons: {
          with: {
            events: {
              with: {
                kites: {
                  with: {
                    kite: true,
                  },
                },
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

    return { data: booking as BookingWithRelations, error: null };
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error(`Error fetching booking with ID ${id} with Drizzle:`, error, "Full error object:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
    return { data: null, error: errorMessage };
  }
}

export async function getBookings(): Promise<{ data: BookingWithRelations[]; error: string | null }> {
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
          columns: { id: true }, // Select at least one column to count lessons
        },
      },
    });

    const bookingsWithLessonCount = bookings.map((booking) => ({
      ...booking,
      lessonCount: booking.lessons?.length ?? 0,
    }));

    return { data: bookingsWithLessonCount as BookingWithRelations[], error: null };
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Error fetching bookings with Drizzle:", error, "Full error object:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
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
}: CreateBookingParams): Promise<{ success: boolean; error: string | null; bookingId?: string }> {
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
