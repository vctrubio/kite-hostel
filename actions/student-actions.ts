"use server";

import db from "@/drizzle";
import { BookingWithRelations } from "@/backend/types";
import { Student } from "@/drizzle/migrations/schema";
import { eq, InferSelectModel } from "drizzle-orm";

type StudentWithRelations = InferSelectModel<typeof Student> & {
  totalBookings: number;
  isAvailable: boolean;
  bookings: BookingWithRelations[];
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
    return { success: false, error: "Failed to update student." };
  }
}

export async function getStudents(): Promise<{ data: StudentWithRelations[]; error: string | null }> {
  try {
    const students = await db.query.Student.findMany({
      orderBy: (student, { desc }) => [desc(student.created_at)],
      with: {
        bookings: {
          with: {
            booking: {
              with: {
                lessons: {
                  with: {
                    teacher: true,
                    commission: true,
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
            },
          },
        },
      },
    });

    const studentsWithRelations = students.map((student) => {
      const totalBookings = student.bookings.length;
      const activeBooking = student.bookings.find(
        (bs) => bs.booking.status === "active",
      );
      const isAvailable = !activeBooking; // If there's an active booking, the student is not available

      return {
        ...student,
        totalBookings,
        isAvailable,
        bookings: student.bookings.map((bs) => bs.booking), // Extract the actual booking objects
      };
    });

    return { data: studentsWithRelations, error: null };
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return { data: [], error: errorMessage };
  }
}

export async function getStudentById(id: string): Promise<{ data: StudentWithRelations | null; error: string | null }> {
  try {
    const student = await db.query.Student.findFirst({
      where: eq(Student.id, id),
      with: {
        bookings: {
          with: {
            booking: {
              with: {
                lessons: {
                  with: {
                    teacher: true,
                    commission: true,
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
            },
          },
        },
      },
    });

    if (!student) {
      return { data: null, error: "Student not found." };
    }

    const totalBookings = student.bookings.length;
    const activeBooking = student.bookings.find(
      (bs) => bs.booking.status === "active",
    );
    const isAvailable = !activeBooking;

    const studentWithRelations: StudentWithRelations = {
      ...student,
      totalBookings,
      isAvailable,
      bookings: student.bookings.map((bs) => bs.booking),
    };

    return { data: studentWithRelations, error: null };
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return { data: null, error: errorMessage };
  }
}
function revalidatePath(arg0: string) {
  throw new Error("Function not implemented.");
}

