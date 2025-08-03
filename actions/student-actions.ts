"use server";

import db from "@/drizzle";
import { Student } from "@/drizzle/migrations/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateStudent(
  id: string,
  updatedFields: Partial<typeof Student.$inferInsert>,
) {
  try {
    const result = await db
      .update(Student)
      .set(updatedFields)
      .where(eq(Student.id, id))
      .returning();

    revalidatePath(`/students/${id}`);
    revalidatePath("/students"); // Revalidate the list page as well

    if (result.length === 0) {
      return { success: false, error: "Student not found." };
    }

    return { success: true, student: result[0] };
  } catch (error) {
    console.error(`Error updating student ${id}:`, error);
    return { success: false, error: "Failed to update student." };
  }
}

export async function getStudents() {
  try {
    const students = await db.query.Student.findMany();
    return { data: students, error: null };
  } catch (error: any) {
    console.error("Error fetching students with Drizzle:", error);
    return { data: [], error: error.message };
  }
}

export async function getStudentById(id: string) {
  try {
    const student = await db.query.Student.findFirst({
      where: eq(Student.id, id),
    });
    return { data: student, error: null };
  } catch (error: any) {
    console.error(`Error fetching student with ID ${id} with Drizzle:`, error);
    return { data: null, error: error.message };
  }
}
