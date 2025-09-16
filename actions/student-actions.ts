"use server";

import db from "@/drizzle";
import { BookingWithRelations } from "@/backend/types";
import { Student, BookingStudent } from "@/drizzle/migrations/schema";
import { eq, InferSelectModel } from "drizzle-orm";
import { revalidatePath } from "next/cache";

type StudentWithRelations = InferSelectModel<typeof Student> & {
  totalBookings: number;
  isAvailable: boolean;
  bookings: BookingWithRelations[];
  eventCount: number;
  totalEventHours: number;
};

export async function createStudent(
  studentData: typeof Student.$inferInsert,
): Promise<{ success: boolean; data?: InferSelectModel<typeof Student>; error?: string }> {
  try {
    const result = await db
      .insert(Student)
      .values(studentData)
      .returning();

    if (result.length === 0) {
      return { success: false, error: "Failed to create student." };
    }

    revalidatePath("/students");
    revalidatePath("/forms");

    return { success: true, data: result[0] };
  } catch (error: any) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, error: errorMessage };
  }
}

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

export async function getStudents(): Promise<{
  data: StudentWithRelations[];
  error: string | null;
}> {
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
      // Student is available if no active booking AND last booking is not active
      let isAvailable = !activeBooking;
      if (isAvailable && student.bookings.length > 0) {
        // Sort bookings by creation date to get the latest one
        const sortedBookings = student.bookings.sort((a, b) => 
          new Date(b.booking.created_at).getTime() - new Date(a.booking.created_at).getTime()
        );
        const lastBooking = sortedBookings[0];
        isAvailable = lastBooking.booking.status !== "active";
      }

      // Calculate event count and total hours from all booking lessons
      let eventCount = 0;
      let totalEventHours = 0;
      
      student.bookings.forEach((bs) => {
        bs.booking.lessons?.forEach((lesson) => {
          if (lesson.events) {
            eventCount += lesson.events.length;
            lesson.events.forEach((event) => {
              totalEventHours += (event.duration || 0) / 60; // Convert minutes to hours
            });
          }
        });
      });

      return {
        ...student,
        totalBookings,
        isAvailable,
        eventCount,
        totalEventHours,
        bookings: student.bookings.map((bs) => bs.booking), // Extract the actual booking objects
      };
    });

    return { data: studentsWithRelations, error: null };
  } catch (error: any) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return { data: [], error: errorMessage };
  }
}

export async function getStudentById(
  id: string,
): Promise<{ data: StudentWithRelations | null; error: string | null }> {
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
    // Student is available if no active booking AND last booking is not active
    let isAvailable = !activeBooking;
    if (isAvailable && student.bookings.length > 0) {
      // Sort bookings by creation date to get the latest one
      const sortedBookings = student.bookings.sort((a, b) => 
        new Date(b.booking.created_at).getTime() - new Date(a.booking.created_at).getTime()
      );
      const lastBooking = sortedBookings[0];
      isAvailable = lastBooking.booking.status !== "active";
    }

    // Calculate event count and total hours from all booking lessons
    let eventCount = 0;
    let totalEventHours = 0;
    
    student.bookings.forEach((bs) => {
      bs.booking.lessons?.forEach((lesson) => {
        if (lesson.events) {
          eventCount += lesson.events.length;
          lesson.events.forEach((event) => {
            totalEventHours += (event.duration || 0) / 60; // Convert minutes to hours
          });
        }
      });
    });

    const studentWithRelations: StudentWithRelations = {
      ...student,
      totalBookings,
      isAvailable,
      eventCount,
      totalEventHours,
      bookings: student.bookings.map((bs) => bs.booking),
    };

    return { data: studentWithRelations, error: null };
  } catch (error: any) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return { data: null, error: errorMessage };
  }
}

export async function deleteStudent(studentId: string): Promise<{ success: boolean; error: string | null }> {
  try {
    // First check if student has any bookings
    const studentWithBookings = await db.query.Student.findFirst({
      where: eq(Student.id, studentId),
      with: {
        bookings: true,
      },
    });

    if (!studentWithBookings) {
      return { success: false, error: "Student not found" };
    }

    if (studentWithBookings.bookings && studentWithBookings.bookings.length > 0) {
      return { 
        success: false, 
        error: `Cannot delete student. They have ${studentWithBookings.bookings.length} booking(s) associated with them.` 
      };
    }

    // Delete related records first (in order due to foreign key constraints)
    
    // Delete booking-student relationships (though there shouldn't be any if we got here)
    await db.delete(BookingStudent).where(eq(BookingStudent.student_id, studentId));
    
    // Finally delete the student
    const deletedStudent = await db
      .delete(Student)
      .where(eq(Student.id, studentId))
      .returning();

    if (deletedStudent.length === 0) {
      return { success: false, error: "Failed to delete student" };
    }

    // Revalidate paths
    revalidatePath("/students");
    revalidatePath("/forms");

    return { success: true, error: null };
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Error deleting student:", error);
    return { success: false, error: errorMessage };
  }
}

export async function softDeleteStudent(studentId: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const updatedStudent = await db
      .update(Student)
      .set({ deleted_at: new Date().toISOString() })
      .where(eq(Student.id, studentId))
      .returning();

    if (updatedStudent.length === 0) {
      return { success: false, error: "Student not found" };
    }

    // Revalidate paths
    revalidatePath("/students");
    revalidatePath(`/students/${studentId}`);

    return { success: true, error: null };
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Error soft deleting student:", error);
    return { success: false, error: errorMessage };
  }
}

export async function restoreStudent(studentId: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const updatedStudent = await db
      .update(Student)
      .set({ deleted_at: null })
      .where(eq(Student.id, studentId))
      .returning();

    if (updatedStudent.length === 0) {
      return { success: false, error: "Student not found" };
    }

    // Revalidate paths
    revalidatePath("/students");
    revalidatePath(`/students/${studentId}`);

    return { success: true, error: null };
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Error restoring student:", error);
    return { success: false, error: errorMessage };
  }
}
