"use server";

import { InferSelectModel } from "drizzle-orm";
import { Lesson, Teacher, Event, Booking, PackageStudent } from "@/drizzle/migrations/schema";
import { revalidatePath } from "next/cache";
import { eq, desc } from "drizzle-orm";

type LessonStatus = typeof Lesson._.columns.status.enumValues[number];

export async function updateLessonStatus(lessonId: string, newStatus: LessonStatus) {
  try {
    await db.update(Lesson).set({ status: newStatus }).where(eq(Lesson.id, lessonId));
    revalidatePath("/lessons");
    return { success: true, error: null };
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : "Failed to update lesson status.";
    console.error("Error updating lesson status:", error);
    return { success: false, error: errorMessage };
  }
}

type LessonWithDetails = InferSelectModel<typeof Lesson> & {
  teacher: InferSelectModel<typeof Teacher>;
  events: InferSelectModel<typeof Event>[];
  totalEventHours: number;
  packageCapacity: number | null;
  packageDuration: number | null;
};

export async function getLessonsWithDetails(): Promise<{ data: LessonWithDetails[]; error: string | null }> {
  try {
    const lessons = await db.query.Lesson.findMany({
      orderBy: [desc(Lesson.created_at)],
      with: {
        teacher: true,
        events: true,
        booking: {
          with: {
            package: true,
          },
        },
      },
    });

    const lessonsWithDetails = lessons.map((lesson) => {
      const totalEventHours =
        lesson.events.reduce((sum, event) => sum + event.duration, 0) / 60; // Convert minutes to hours
      return {
        ...lesson,
        totalEventHours,
        packageCapacity: lesson.booking?.package?.capacity_students || null,
        packageDuration: lesson.booking?.package?.duration || null,
      };
    });

    return { data: lessonsWithDetails as LessonWithDetails[], error: null };
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Error fetching lessons with details:", error);
    return { data: [], error: errorMessage };
  }
}

interface CreateLessonParams {
  booking_id: string;
  teacher_id: string;
  commission_id: string;
  status?: "planned" | "completed" | "cancelled";
}

export async function createLesson({
  booking_id,
  teacher_id,
  commission_id,
  status = "planned",
}: CreateLessonParams): Promise<{ success: boolean; error: string | null; lessonId?: string }> {
  try {
    const newLesson = await db
      .insert(Lesson)
      .values({
        booking_id,
        teacher_id,
        commission_id,
        status,
      })
      .returning({ id: Lesson.id });

    if (newLesson.length === 0) {
      return { success: false, error: "Failed to create lesson." };
    }

    revalidatePath("/bookings");
    revalidatePath("/lessons");

    return { success: true, lessonId: newLesson[0].id, error: null };
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Error creating lesson:", error);
    return { success: false, error: errorMessage };
  }
}