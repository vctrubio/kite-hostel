"use server";

import { db } from "@/drizzle";
import { Teacher, user_wallet } from "@/drizzle/migrations/schema";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

export async function createTeacher(name: string) {
  try {
    const newTeacher = await db
      .insert(Teacher)
      .values({ name, languages: ["English"], commission_a: 0 })
      .returning();
    revalidatePath("/");
    return { success: true, teacher: newTeacher[0] };
  } catch (error) {
    console.error("Error creating teacher:", error);
    return { success: false, error: "Failed to create teacher." };
  }
}

export async function updateUserWalletPk(teacherId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "User not authenticated." };
  }

  try {
    const updatedWallet = await db
      .update(user_wallet)
      .set({ pk: teacherId, updated_at: new Date().toISOString() })
      .where(eq(user_wallet.sk, user.id))
      .returning();

    if (updatedWallet.length === 0) {
      return { success: false, error: "User wallet not found." };
    }

    revalidatePath("/");
    return { success: true, wallet: updatedWallet[0] };
  } catch (error) {
    console.error("Error updating user wallet:", error);
    return { success: false, error: "Failed to update user wallet." };
  }
}