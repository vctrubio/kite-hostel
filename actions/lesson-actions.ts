"use server";

import db from "@/drizzle";
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
  totalKiteEventDuration: number;
  packageCapacity: number;
  packageDuration: number;
};

export async function getLessonsWithDetails(): Promise<{ data: LessonWithDetails[]; error: string | null }> {
  try {
    const lessons = await db.query.Lesson.findMany({
      orderBy: [desc(Lesson.created_at)],
      with: {
        teacher: true,
        events: true,
        commission: true,
        booking: {
          with: {
            package: true,
            students: {
              with: {
                student: true,
              },
            },
          },
        },
      },
    });

    const lessonsWithDetails = lessons.map((lesson) => {
      const totalEventHours =
        lesson.events.reduce((sum, event) => sum + event.duration, 0) / 60; // Convert minutes to hours

      const totalKiteEventDuration = lesson.events.reduce((sum, event) => sum + event.duration, 0);

      if (!lesson.booking?.package) {
        throw new Error(`Lesson ${lesson.id} has no associated package`);
      }
      
      return {
        ...lesson,
        totalEventHours,
        totalKiteEventDuration,
        packageCapacity: lesson.booking.package.capacity_students,
        packageDuration: lesson.booking.package.duration,
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

    // Real-time listener handles UI updates - no need for revalidatePath

    return { success: true, lessonId: newLesson[0].id, error: null };
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Error creating lesson:", error);
    return { success: false, error: errorMessage };
  }
}

export async function getLessonById(id: string): Promise<{ data: LessonWithDetails | null; error: string | null }> {
  try {
    const lesson = await db.query.Lesson.findFirst({
      where: eq(Lesson.id, id),
      with: {
        teacher: true,
        events: true,
        commission: true,
        booking: {
          with: {
            package: true,
            students: {
              with: {
                student: true,
              },
            },
          },
        },
      },
    });

    if (!lesson) {
      return { data: null, error: "Lesson not found." };
    }

    const totalEventHours =
      lesson.events.reduce((sum, event) => sum + event.duration, 0) / 60; // Convert minutes to hours

    const totalKiteEventDuration = lesson.events.reduce((sum, event) => sum + event.duration, 0);

    if (!lesson.booking?.package) {
      throw new Error(`Lesson ${lesson.id} has no associated package`);
    }
    
    const lessonWithDetails = {
      ...lesson,
      totalEventHours,
      totalKiteEventDuration,
      packageCapacity: lesson.booking.package.capacity_students,
      packageDuration: lesson.booking.package.duration,
    };

    return { data: lessonWithDetails as LessonWithDetails, error: null };
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Error fetching lesson by id:", error);
    return { data: null, error: errorMessage };
  }
}

export async function deleteLesson(lessonId: string): Promise<{ success: boolean; error: string | null }> {
  try {
    // First check if lesson has any events
    const lesson = await db.query.Lesson.findFirst({
      where: eq(Lesson.id, lessonId),
      with: {
        events: true,
      },
    });

    if (!lesson) {
      return { success: false, error: "Lesson not found" };
    }

    if (lesson.events && lesson.events.length > 0) {
      return { 
        success: false, 
        error: `Cannot delete lesson. It has ${lesson.events.length} event(s) associated with it.` 
      };
    }

    // Delete the lesson
    const deletedLesson = await db
      .delete(Lesson)
      .where(eq(Lesson.id, lessonId))
      .returning();

    if (deletedLesson.length === 0) {
      return { success: false, error: "Failed to delete lesson" };
    }

    // Revalidate paths
    revalidatePath("/lessons");
    revalidatePath("/bookings");
    revalidatePath("/teachers");

    return { success: true, error: null };
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Error deleting lesson:", error);
    return { success: false, error: errorMessage };
  }
}

