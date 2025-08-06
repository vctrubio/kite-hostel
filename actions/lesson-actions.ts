"use server";

import db from "@/drizzle";
import { Lesson } from "@/drizzle/migrations/schema";
import { revalidatePath } from "next/cache";

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