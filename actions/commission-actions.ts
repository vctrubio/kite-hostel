"use server";

import db from "@/drizzle";
import { Commission } from "@/drizzle/migrations/schema";
import { revalidatePath } from "next/cache";

interface CreateCommissionParams {
  teacher_id: string;
  rate: number;
  description?: string;
}

export async function createCommission({
  teacher_id,
  rate,
  description,
}: CreateCommissionParams): Promise<{ success: boolean; error: string | null; commissionId?: string }> {
  try {
    const newCommission = await db
      .insert(Commission)
      .values({
        teacher_id,
        price_per_hour: rate,
        desc: description,
      })
      .returning({ id: Commission.id });

    if (newCommission.length === 0) {
      return { success: false, error: "Failed to create commission." };
    }

    revalidatePath("/teachers"); // Revalidate teachers page to show new commission
    revalidatePath("/bookings/form"); // Revalidate booking form in case it needs updated commissions

    return { success: true, commissionId: newCommission[0].id, error: null };
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Error creating commission:", error);
    return { success: false, error: errorMessage };
  }
}
