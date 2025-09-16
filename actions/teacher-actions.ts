"use server";

import db from "@/drizzle";
import { InferSelectModel } from "drizzle-orm";
import { Teacher, Commission, Lesson, TeacherKite, Payment, Kite, user_wallet, Event, Student, BookingStudent, Booking, PackageStudent, KiteEvent } from "@/drizzle/migrations/schema";
import { eq} from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

export async function createTeacher(
  teacherData: typeof Teacher.$inferInsert,
): Promise<{ success: boolean; data?: InferSelectModel<typeof Teacher>; error?: string }> {
  try {
    const result = await db
      .insert(Teacher)
      .values(teacherData)
      .returning();

    if (result.length === 0) {
      return { success: false, error: "Failed to create teacher." };
    }

    revalidatePath("/teachers");
    revalidatePath("/forms");

    return { success: true, data: result[0] };
  } catch (error: any) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, error: errorMessage };
  }
}

export async function updateTeacher(
  id: string,
  updatedFields: Partial<typeof Teacher.$inferInsert>,
) {
  try {
    const result = await db
      .update(Teacher)
      .set(updatedFields)
      .where(eq(Teacher.id, id))
      .returning();

    revalidatePath(`/teachers/${id}`);
    revalidatePath("/teachers"); // Revalidate the list page as well

    if (result.length === 0) {
      return { success: false, error: "Teacher not found." };
    }

    return { success: true, teacher: result[0] };
  } catch (error) {
    return { success: false, error: "Failed to update teacher." };
  }
}


export type TeacherWithRelations = InferSelectModel<typeof Teacher> & {
  commissions: InferSelectModel<typeof Commission>[];
  kites: (InferSelectModel<typeof TeacherKite> & { kite: InferSelectModel<typeof Kite> })[];
  payments: InferSelectModel<typeof Payment>[];
  lessons: (InferSelectModel<typeof Lesson> & { 
    events: InferSelectModel<typeof Event>[];
    commission: InferSelectModel<typeof Commission>;
    booking: InferSelectModel<typeof Booking> & {
      package: InferSelectModel<typeof PackageStudent>;
      students: (InferSelectModel<typeof BookingStudent> & { student: InferSelectModel<typeof Student> })[];
    };
  })[];
  user_wallet?: {
    id: string;
    role: string;
    sk: string | null;
    pk: string | null;
    note: string | null;
    created_at: string | null;
    updated_at: string | null;
    sk_email: string | null;
    sk_full_name: string | null;
  } | null;
};

export type TeacherPortalData = InferSelectModel<typeof Teacher> & {
  commissions: InferSelectModel<typeof Commission>[];
  kites: (InferSelectModel<typeof TeacherKite> & { kite: InferSelectModel<typeof Kite> })[];
  payments: InferSelectModel<typeof Payment>[];
  lessons: (InferSelectModel<typeof Lesson> & { 
    events: (InferSelectModel<typeof Event> & {
      kites: (InferSelectModel<typeof KiteEvent> & { kite: InferSelectModel<typeof Kite> })[];
    })[];
    booking: InferSelectModel<typeof Booking> & {
      package: InferSelectModel<typeof PackageStudent>;
      students: (InferSelectModel<typeof BookingStudent> & { student: InferSelectModel<typeof Student> })[];
    };
  })[];
  user_wallet?: {
    id: string;
    role: string;
    sk: string | null;
    pk: string | null;
    note: string | null;
    created_at: string | null;
    updated_at: string | null;
    sk_email: string | null;
    sk_full_name: string | null;
  } | null;
};

export async function getTeachers() {
  try {
    const teachers = await db.query.Teacher.findMany({
      where: (teachers, { isNull }) => isNull(teachers.deleted_at),
      with: {
        commissions: true,
      },
    });
    return { data: teachers, error: null };
  } catch (error: any) {
    console.error("Error fetching teachers with Drizzle:", error);
    return { data: [], error: error.message };
  }
}

export type TeacherWithMetrics = InferSelectModel<typeof Teacher> & {
  commissions: InferSelectModel<typeof Commission>[];
  lessonCount: number;
  eventCount: number;
  totalEventHours: number;
  activeLessonCount: number;
  isActive: boolean;
  lessonsByStatus: {
    planned: number;
    rest: number;
    delegated: number;
    completed: number;
    cancelled: number;
  };
};

export async function getTeachersWithMetrics(): Promise<{ data: TeacherWithMetrics[]; error: string | null }> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const teachers = await db.query.Teacher.findMany({
      with: {
        commissions: true,
        lessons: {
          with: {
            events: true,
            booking: true,
          },
        },
      },
    });

    const teachersWithMetrics: TeacherWithMetrics[] = teachers.map(teacher => {
      const lessonCount = teacher.lessons.length;
      const eventCount = teacher.lessons.reduce((count, lesson) => count + lesson.events.length, 0);
      const totalEventHours = teacher.lessons.reduce((total, lesson) => {
        return total + lesson.events.reduce((eventTotal, event) => {
          return eventTotal + ((event.duration || 0) / 60); // Convert minutes to hours
        }, 0);
      }, 0);

      // Group lessons by status
      const lessonsByStatus = teacher.lessons.reduce((acc, lesson) => {
        const status = lesson.status as 'planned' | 'rest' | 'delegated' | 'completed' | 'cancelled';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {
        planned: 0,
        rest: 0,
        delegated: 0,
        completed: 0,
        cancelled: 0,
      });

      const activeLessonCount = lessonsByStatus.planned;
      const isActive = activeLessonCount > 0;

      return {
        ...teacher,
        lessonCount,
        eventCount,
        totalEventHours,
        activeLessonCount,
        isActive,
        lessonsByStatus,
      };
    });

    return { data: teachersWithMetrics, error: null };
  } catch (error: any) {
    console.error("Error fetching teachers with metrics:", error);
    return { data: [], error: error.message };
  }
}

export async function fetchUserBySk(sk: string): Promise<{ data: TeacherWithRelations | null; error: string | null }> {
  try {
    const userWallet = await db.query.user_wallet.findFirst({
      where: eq(user_wallet.sk, sk),
    });

    if (!userWallet || !userWallet.pk) {
      return { data: null, error: "No teacher associated with this user." };
    }

    return await getTeacherById(userWallet.pk);
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error(`Error fetching teacher by SK ${sk}:`, error);
    return { data: null, error: errorMessage };
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
            kite: true,
          },
        },
        payments: true,
        lessons: {
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
                lessons: {
                  with: {
                    teacher: true,
                    events: true,
                  },
                },
              },
            },
          },
        },
        user_wallet: true,
      },
    });

    if (!teacher) {
      return { data: null, error: "Teacher not found." };
    }

    // Enrich user_wallet with auth data if present
    let enrichedUserWallet = null;
    if (teacher.user_wallet && teacher.user_wallet.sk) {
      const supabaseAdmin = createAdminClient();
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(teacher.user_wallet.sk);

      enrichedUserWallet = {
        ...teacher.user_wallet,
        sk_email: authError || !authUser.user ? null : authUser.user.email || null,
        sk_full_name: authError || !authUser.user ? null : authUser.user.user_metadata?.full_name || null,
      };

      if (authError) {
        console.error("Error fetching auth user by ID for teacher wallet:", authError);
      }
    }

    const teacherWithRelations: TeacherWithRelations = {
      ...teacher,
      user_wallet: enrichedUserWallet,
    };
    return { data: teacherWithRelations, error: null };
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error(`Error fetching teacher with ID ${id} with Drizzle:`, error, "Full error object:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
    return { data: null, error: errorMessage };
  }
}

export async function getTeacherPortalById(id: string): Promise<{ data: TeacherPortalData | null; error: string | null }> {
  try {
    const teacher = await db.query.Teacher.findFirst({
      where: eq(Teacher.id, id),
      with: {
        commissions: true,
        kites: {
          with: {
            kite: true,
          },
        },
        payments: true,
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
        },
      },
    });

    if (!teacher) {
      return { data: null, error: "Teacher not found." };
    }

    let sk_email = null;
    let sk_full_name = null;
    let userWalletData = null;

    const associatedUserWallet = await db.query.user_wallet.findFirst({
      where: eq(user_wallet.pk, teacher.id),
    });

    if (associatedUserWallet) {
      userWalletData = associatedUserWallet;
      if (userWalletData.sk) {
        const supabaseAdmin = createAdminClient();
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(userWalletData.sk);

        if (authError) {
          console.error("Error fetching auth user by ID for teacher wallet:", authError);
        } else if (authUser.user) {
          sk_email = authUser.user.email || null;
          sk_full_name = authUser.user.user_metadata?.full_name || null;
        }
      }
    }

    const teacherPortalData: TeacherPortalData = {
      ...teacher,
      user_wallet: userWalletData ? { 
        ...userWalletData, 
        sk_email, 
        sk_full_name,
      } : null,
    };
    return { data: teacherPortalData, error: null };
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error(`Error fetching teacher portal data with ID ${id}:`, error);
    return { data: null, error: errorMessage };
  }
}

interface TeacherPortalUpdateParams {
  eventId: string;
  teacherId: string;
  selectedKiteIds: string[];
  duration: number;
  continueTomorrow: boolean;
}

interface CancelEventParams {
  eventId: string;
  teacherId: string;
}

export async function teacherportalupdate({
  eventId,
  teacherId,
  selectedKiteIds,
  duration,
  continueTomorrow,
}: TeacherPortalUpdateParams): Promise<{ success: boolean; error: string | null }> {
  try {
    // Get event details and lesson info
    const event = await db.query.Event.findFirst({
      where: eq(Event.id, eventId),
      with: {
        lesson: {
          with: {
            booking: {
              with: {
                package: true,
              },
            },
          },
        },
      },
    });

    if (!event) {
      return { success: false, error: "Event not found" };
    }

    // Verify kite capacity matches package requirements
    if (selectedKiteIds.length !== event.lesson.booking.package.capacity_kites) {
      return { 
        success: false, 
        error: `Must select exactly ${event.lesson.booking.package.capacity_kites} kites for this package` 
      };
    }

    // Verify teacher owns all selected kites
    const teacherKites = await db.query.TeacherKite.findMany({
      where: eq(TeacherKite.teacher_id, teacherId),
    });
    
    const teacherKiteIds = teacherKites.map(tk => tk.kite_id);
    const invalidKites = selectedKiteIds.filter(kiteId => !teacherKiteIds.includes(kiteId));
    
    if (invalidKites.length > 0) {
      return { 
        success: false, 
        error: "Some selected kites are not assigned to this teacher" 
      };
    }

    // Start transaction-like operations
    // 1. Update event status to completed and duration
    await db.update(Event)
      .set({ 
        status: "completed",
        duration: duration,
      })
      .where(eq(Event.id, eventId));

    // 2. Clear existing kite assignments and add new ones
    await db.delete(KiteEvent).where(eq(KiteEvent.event_id, eventId));
    
    const kiteEventInserts = selectedKiteIds.map(kiteId => ({
      event_id: eventId,
      kite_id: kiteId,
    }));
    
    if (kiteEventInserts.length > 0) {
      await db.insert(KiteEvent).values(kiteEventInserts);
    }

    // 3. Update lesson status based on booking end date and continue tomorrow choice
    const bookingEndDate = new Date(event.lesson.booking.date_end);
    const eventDate = new Date(event.date);
    const daysUntilEnd = Math.ceil((bookingEndDate.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24));
    const isLastDay = daysUntilEnd <= 1;

    if (isLastDay) {
      // Final day of booking - complete the lesson
      await db.update(Lesson)
        .set({ status: "completed" })
        .where(eq(Lesson.id, event.lesson_id));
    } else if (!continueTomorrow) {
      // Not final day but user chose not to continue - set to rest
      await db.update(Lesson)
        .set({ status: "rest" })
        .where(eq(Lesson.id, event.lesson_id));
    }
    // If continuing tomorrow and not final day, keep lesson status unchanged (planned)

    // Revalidate relevant paths
    revalidatePath(`/teacher/${teacherId}`);
    revalidatePath("/whiteboard");
    
    return { success: true, error: null };
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Error updating teacher portal:", error);
    return { success: false, error: errorMessage };
  }
}

export async function cancelTeacherEvent({
  eventId,
  teacherId,
}: CancelEventParams): Promise<{ success: boolean; error: string | null }> {
  try {
    // Get event details to verify it belongs to this teacher
    const event = await db.query.Event.findFirst({
      where: eq(Event.id, eventId),
      with: {
        lesson: true,
      },
    });

    if (!event) {
      return { success: false, error: "Event not found" };
    }

    if (event.lesson.teacher_id !== teacherId) {
      return { success: false, error: "Unauthorized: Event doesn't belong to this teacher" };
    }

    // Update event status to cancelled
    await db.update(Event)
      .set({ status: "cancelled" })
      .where(eq(Event.id, eventId));

    // Revalidate relevant paths
    revalidatePath(`/teacher/${teacherId}`);
    revalidatePath("/whiteboard");
    
    return { success: true, error: null };
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Error cancelling event:", error);
    return { success: false, error: errorMessage };
  }
}

export async function deleteTeacher(teacherId: string): Promise<{ success: boolean; error: string | null }> {
  try {
    // First check if teacher has any lessons
    const teacherWithLessons = await db.query.Teacher.findFirst({
      where: eq(Teacher.id, teacherId),
      with: {
        lessons: true,
      },
    });

    if (!teacherWithLessons) {
      return { success: false, error: "Teacher not found" };
    }

    if (teacherWithLessons.lessons && teacherWithLessons.lessons.length > 0) {
      return { 
        success: false, 
        error: `Cannot delete teacher. They have ${teacherWithLessons.lessons.length} lesson(s) associated with them.` 
      };
    }

    // Delete related records first (in order due to foreign key constraints)
    
    // 1. Delete teacher-kite relationships
    await db.delete(TeacherKite).where(eq(TeacherKite.teacher_id, teacherId));
    
    // 2. Delete commissions
    await db.delete(Commission).where(eq(Commission.teacher_id, teacherId));
    
    // 3. Delete payments
    await db.delete(Payment).where(eq(Payment.teacher_id, teacherId));
    
    // 4. Update user_wallet to remove teacher reference
    await db.update(user_wallet).set({ pk: null }).where(eq(user_wallet.pk, teacherId));
    
    // 5. Finally delete the teacher
    const deletedTeacher = await db
      .delete(Teacher)
      .where(eq(Teacher.id, teacherId))
      .returning();

    if (deletedTeacher.length === 0) {
      return { success: false, error: "Failed to delete teacher" };
    }

    // Revalidate paths
    revalidatePath("/teachers");
    revalidatePath("/forms");

    return { success: true, error: null };
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Error deleting teacher:", error);
    return { success: false, error: errorMessage };
  }
}

export async function softDeleteTeacher(teacherId: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const updatedTeacher = await db
      .update(Teacher)
      .set({ deleted_at: new Date().toISOString() })
      .where(eq(Teacher.id, teacherId))
      .returning();

    if (updatedTeacher.length === 0) {
      return { success: false, error: "Teacher not found" };
    }

    // Revalidate paths
    revalidatePath("/teachers");
    revalidatePath(`/teachers/${teacherId}`);

    return { success: true, error: null };
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Error soft deleting teacher:", error);
    return { success: false, error: errorMessage };
  }
}

export async function restoreTeacher(teacherId: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const updatedTeacher = await db
      .update(Teacher)
      .set({ deleted_at: null })
      .where(eq(Teacher.id, teacherId))
      .returning();

    if (updatedTeacher.length === 0) {
      return { success: false, error: "Teacher not found" };
    }

    // Revalidate paths
    revalidatePath("/teachers");
    revalidatePath(`/teachers/${teacherId}`);

    return { success: true, error: null };
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Error restoring teacher:", error);
    return { success: false, error: errorMessage };
  }
}
