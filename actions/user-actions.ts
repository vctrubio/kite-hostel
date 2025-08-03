"use server";

import db from "@/drizzle";
import { user_wallet, Teacher } from "@/drizzle/migrations/schema";
import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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


export async function getUserWallets() {
  try {
    const userWalletsWithRelations = await db.query.user_wallet.findMany({
      with: {
        teacher: {
          columns: {
            name: true,
          },
        },
      },
    });

    const formattedUserWallets = userWalletsWithRelations.map((wallet) => ({
      id: wallet.id,
      role: wallet.role,
      pk: wallet.pk,
      note: wallet.note, // Include the note column
      teacher_name: wallet.teacher?.name || null,
    }));

    return { data: formattedUserWallets, error: null };
  } catch (error: any) {
    console.error("Error fetching user wallets with Drizzle:", error);
    return { data: [], error: error.message };
  }
}
