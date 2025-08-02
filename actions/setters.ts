"use server";

import db from "@/drizzle";
import { Student, Teacher, user_wallet } from "@/drizzle/migrations/schema";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

export async function createTeacher() {
  try {
    const randomName = `Teacher ${Math.floor(Math.random() * 10000)}`;
    const languages = ["English", "Spanish", "French"];
    const randomLanguage = languages[Math.floor(Math.random() * languages.length)];

    const newTeacher = await db
      .insert(Teacher)
      .values({
        name: randomName,
        languages: [randomLanguage],
        passport_number: `PN${Math.floor(Math.random() * 1000000)}`,
        country: "Spain",
        phone: `6${Math.floor(Math.random() * 100000000)}`,
      })
      .returning();
    revalidatePath("/teachers");
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

export async function createStudent() {
  try {
    const randomName = `Student ${Math.floor(Math.random() * 10000)}`;
    const languages = ["English", "Spanish", "French"];
    const randomLanguage = languages[Math.floor(Math.random() * languages.length)];

    const newStudent = await db
      .insert(Student)
      .values({
        name: randomName,
        languages: [randomLanguage],
        passport_number: `PN${Math.floor(Math.random() * 1000000)}`,
        country: "Spain",
        phone: `6${Math.floor(Math.random() * 100000000)}`,
        size: "M",
        desc: "Fake student for testing",
      })
      .returning();
    revalidatePath("/students");
    return { success: true, student: newStudent[0] };
  } catch (error) {
    console.error("Error creating student:", error);
    return { success: false, error: "Failed to create student." };
  }
}