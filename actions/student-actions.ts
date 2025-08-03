"use server";

import db from "@/drizzle";
import { InferSelectModel } from "drizzle-orm";
import { Student, BookingStudent } from "@/drizzle/migrations/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

type StudentWithRelations = InferSelectModel<typeof Student> & {
  totalBookings: number;
};

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

export async function getStudents(): Promise<{ data: StudentWithRelations[]; error: string | null }> {
  try {
    const students = await db.query.Student.findMany({
      with: {
        bookings: {
          columns: { id: true },
        },
      },
    });

    const studentsWithRelations = students.map((student) => ({
      ...student,
      totalBookings: student.bookings?.length ?? 0,
    }));

    return { data: studentsWithRelations, error: null };
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Error fetching students with Drizzle:", error, "Full error object:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
    return { data: [], error: errorMessage };
  }
}

export async function getStudentById(id: string): Promise<{ data: StudentWithRelations | null; error: string | null }> {
  try {
    const student = await db.query.Student.findFirst({
      where: eq(Student.id, id),
      with: {
        bookings: {
          columns: { id: true },
        },
      },
    });

    if (!student) {
      return { data: null, error: "Student not found." };
    }

    const studentWithRelations: StudentWithRelations = {
      ...student,
      totalBookings: student.bookings?.length ?? 0,
    };

    return { data: studentWithRelations, error: null };
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error(`Error fetching student with ID ${id} with Drizzle:`, error, "Full error object:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
    return { data: null, error: errorMessage };
  }
}
