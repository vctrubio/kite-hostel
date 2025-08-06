"use server";

import db from "@/drizzle";
import { InferSelectModel } from "drizzle-orm";
import { Teacher, Commission, Lesson, TeacherKite, Payment, Kite, user_wallet } from "@/drizzle/migrations/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

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


type TeacherWithRelations = InferSelectModel<typeof Teacher> & {
  commissions: InferSelectModel<typeof Commission>[];
  kites: (InferSelectModel<typeof TeacherKite> & { kite: InferSelectModel<typeof Kite> })[];
  payments: InferSelectModel<typeof Payment>[];
  lessons: InferSelectModel<typeof Lesson>[];
  user_wallet?: {
    id: string;
    role: string;
    sk: string | null;
    pk: string | null;
    note: string | null;
    created_at: string;
    updated_at: string;
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
          columns: { id: true, booking_id: true, commission_id: true, status: true },
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
      user_wallet: userWalletData ? { ...userWalletData, sk_email, sk_full_name } : null,
    };
    return { data: teacherWithRelations, error: null };
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error(`Error fetching teacher with ID ${id} with Drizzle:`, error, "Full error object:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
    return { data: null, error: errorMessage };
  }
}
