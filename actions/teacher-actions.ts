"use server";

import db from "@/drizzle";
import { InferSelectModel } from "drizzle-orm";
import { Teacher, Commission, Lesson, TeacherKite, Payment, Kite, user_wallet, Event, Student, BookingStudent, Booking, PackageStudent, KiteEvent } from "@/drizzle/migrations/schema";
import { eq, and } from "drizzle-orm";
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
  lessons: (InferSelectModel<typeof Lesson> & { events: InferSelectModel<typeof Event>[] })[];
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
            kite: true, // Fetch details of the associated kite
          },
        },
        payments: true,
        lessons: {
          with: {
            events: true,
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

    const teacherWithRelations: TeacherWithRelations = {
      ...teacher,
      user_wallet: userWalletData ? { 
        ...userWalletData, 
        sk_email, 
        sk_full_name,
      } : null,
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
