"use server";

import db from "@/drizzle";
import { Student, Teacher, PackageStudent } from "@/drizzle/migrations/schema";
import { revalidatePath } from "next/cache";

export async function seedCreateStudent() {
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

export async function seedCreateTeacher() {
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

export async function seedCreatePackages() {
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