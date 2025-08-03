"use server";

import db from "@/drizzle";
import { Student, Teacher, user_wallet, PackageStudent } from "@/drizzle/migrations/schema";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { eq, and, set } from "drizzle-orm";

export async function createTeacher() {
  try {
    const randomName = `Teacher ${Math.floor(Math.random() * 10000)}`;
    const languages = ["English", "Spanish", "French"];
    const randomLanguage = languages[Math.floor(Math.random() * languages.length)];
    const countries = {
      Spain: "+34",
      France: "+33",
      Germany: "+49",
      Italy: "+39",
      UK: "+44",
      USA: "+1",
      Canada: "+1",
      Mexico: "+52",
      Argentina: "+54",
      Brazil: "+55",
    };
    const randomCountry = Object.keys(countries)[
      Math.floor(Math.random() * Object.keys(countries).length)
    ];
    const phonePrefix = countries[randomCountry as keyof typeof countries];

    const newTeacher = await db
      .insert(Teacher)
      .values({
        name: randomName,
        languages: [randomLanguage],
        passport_number: `PN${Math.floor(Math.random() * 1000000)}`,
        country: randomCountry,
        phone: `${phonePrefix}${Math.floor(Math.random() * 1000000000)}`,
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
    const countries = {
      Spain: "+34",
      France: "+33",
      Germany: "+49",
      Italy: "+39",
      UK: "+44",
      USA: "+1",
      Canada: "+1",
      Mexico: "+52",
      Argentina: "+54",
      Brazil: "+55",
    };
    const randomCountry = Object.keys(countries)[
      Math.floor(Math.random() * Object.keys(countries).length)
    ];
    const phonePrefix = countries[randomCountry as keyof typeof countries];

    const newStudent = await db
      .insert(Student)
      .values({
        name: randomName,
        languages: [randomLanguage],
        passport_number: `PN${Math.floor(Math.random() * 1000000)}`,
        country: randomCountry,
        phone: `${phonePrefix}${Math.floor(Math.random() * 1000000000)}`,
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

export async function updateStudent(id: string, updatedFields: Partial<typeof Student.$inferInsert>) {
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
    console.error(`Error updating student ${id}:`, error);
    return { success: false, error: "Failed to update student." };
  }
}

export async function createPackages() {
  try {
    const packages = [];
    for (let i = 0; i < 10; i++) {
      packages.push({
        duration: (Math.floor(Math.random() * 10) + 1) * 60,
        description: `Package ${Math.floor(Math.random() * 10000)}`,
        price_per_student: Math.floor(Math.random() * 100) + 50,
        capacity_students: Math.floor(Math.random() * 4) + 1,
        capacity_kites: Math.floor(Math.random() * 3) + 1,
      });
    }

    await db.insert(PackageStudent).values(packages);

    revalidatePath("/packages");
    return { success: true };
  } catch (error) {
    console.error("Error creating packages:", error);
    return { success: false, error: "Failed to create packages." };
  }
}