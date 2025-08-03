"use server";

import db from "@/drizzle";
import { InferSelectModel } from "drizzle-orm";
import { Teacher, Commission, Lesson, TeacherKite, Payment, Kite } from "@/drizzle/migrations/schema";
import { eq } from "drizzle-orm";

type TeacherWithRelations = InferSelectModel<typeof Teacher> & {
  commissions: InferSelectModel<typeof Commission>[];
  kites: (InferSelectModel<typeof TeacherKite> & { kite: InferSelectModel<typeof Kite> })[];
  payments: InferSelectModel<typeof Payment>[];
};

export async function getTeachers() {
  try {
    const teachers = await db.query.Teacher.findMany();
    return { data: teachers, error: null };
  } catch (error: any) {
    console.error("Error fetching teachers with Drizzle:", error);
    return { data: [], error: error.message };
  }
}

export async function getTeacherById(id: string): Promise<{ data: TeacherWithRelations | null; error: string | null }> {
  try {
    const teacher = await db.query.Teacher.findFirst({
      where: eq(Teacher.id, id),
      with: {
        commissions: true,
        kites: {
          with: {
            kite: true, // Fetch details of the associated kite
          },
        },
        payments: true,
      },
    });

    if (!teacher) {
      return { data: null, error: "Teacher not found." };
    }

    return { data: teacher as TeacherWithRelations, error: null };
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error(`Error fetching teacher with ID ${id} with Drizzle:`, error, "Full error object:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
    return { data: null, error: errorMessage };
  }
}
