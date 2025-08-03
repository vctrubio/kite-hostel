"use server";

import db from "@/drizzle";
import { Teacher } from "@/drizzle/migrations/schema";
import { eq } from "drizzle-orm";

export async function getTeachers() {
  try {
    const teachers = await db.query.Teacher.findMany();
    return { data: teachers, error: null };
  } catch (error: any) {
    console.error("Error fetching teachers with Drizzle:", error);
    return { data: [], error: error.message };
  }
}

export async function getTeacherById(id: string) {
  try {
    const teacher = await db.query.Teacher.findFirst({
      where: eq(Teacher.id, id),
    });
    return { data: teacher, error: null };
  } catch (error: any) {
    console.error(`Error fetching teacher with ID ${id} with Drizzle:`, error);
    return { data: null, error: error.message };
  }
}
