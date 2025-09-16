"use server";

import db from "@/drizzle";
import { Commission } from "@/drizzle/migrations/schema";
import { revalidatePath } from "next/cache";

interface CreateCommissionParams {
  teacher_id: string;
  price_per_hour: number;
  desc?: string | null;
}

export async function createCommission({
  teacher_id,
  price_per_hour,
  desc,
}: CreateCommissionParams): Promise<{ success: boolean; error: string | null; commission: any }> {
  try {
    const newCommission = await db
      .insert(Commission)
      .values({
        teacher_id,
        price_per_hour,
        desc,
      })
      .returning();

    if (newCommission.length === 0) {
      return { success: false, error: "Failed to create commission.", commission: null };
    }

    revalidatePath("/teachers"); // Revalidate teachers page to show new commission
    revalidatePath("/bookings/form"); // Revalidate booking form in case it needs updated commissions

    return { success: true, commission: newCommission[0], error: null };
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Error creating commission:", error);
    return { success: false, error: errorMessage, commission: null };
  }
}

export async function deleteCommission(commissionId: string): Promise<{ success: boolean; error: string | null }> {
  try {
    // First check if this commission is being used in any lessons
    const { Lesson } = await import("@/drizzle/migrations/schema");
    const { eq } = await import("drizzle-orm");
    
    const lessonsUsingCommission = await db.query.Lesson.findMany({
      where: eq(Lesson.commission_id, commissionId),
    });

    if (lessonsUsingCommission.length > 0) {
      return { 
        success: false, 
        error: `Cannot delete commission. It is being used by ${lessonsUsingCommission.length} lesson(s).` 
      };
    }

    // If no lessons are using it, safe to delete
    const deletedCommission = await db
      .delete(Commission)
      .where(eq(Commission.id, commissionId))
      .returning();

    if (deletedCommission.length === 0) {
      return { success: false, error: "Commission not found." };
    }

    revalidatePath("/teachers");
    revalidatePath("/bookings/form");

    return { success: true, error: null };
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Error deleting commission:", error);
    return { success: false, error: errorMessage };
  }
}
