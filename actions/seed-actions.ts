"use server";

import db from "@/drizzle";
import { Student, Teacher, PackageStudent, Kite } from "@/drizzle/migrations/schema";
import { revalidatePath } from "next/cache";
import { createKite, assignKiteToTeacher } from "@/actions/kite-actions";

export async function seedCreateStudent() {
  try {
    const firstNames = ["John", "Jane", "Mike", "Sarah", "David", "Emma", "Alex", "Lisa", "Chris", "Maria"];
    const lastNames = ["Smith", "Johnson", "Brown", "Davis", "Wilson", "Miller", "Taylor", "Anderson", "Thomas", "Jackson"];
    const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    
    const languages = ["English", "Spanish", "French", "German", "Italian"] as const;
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
        name: randomFirstName,
        last_name: randomLastName,
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
    const languages = ["English", "Spanish", "French", "German", "Italian"] as const;
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

export async function seedCreateKite() {
  try {
    const models = ["Rebel", "Duotone", "Neo", "Dice", "Evo"];
    const sizes = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
    const randomModel = models[Math.floor(Math.random() * models.length)];
    const randomSize = sizes[Math.floor(Math.random() * sizes.length)];
    const randomSerialId = `SN${Math.floor(Math.random() * 1000000000)}`;

    const kiteResult = await createKite({
      model: randomModel,
      size: randomSize,
      serial_id: randomSerialId,
    });

    if (!kiteResult.success || !kiteResult.kite) {
      return { success: false, error: kiteResult.error || "Failed to create kite." };
    }

    const allTeachers = await db.query.Teacher.findMany();

    if (allTeachers.length === 0) {
      return { success: true, kite: kiteResult.kite, message: "No teachers available to assign kite to." };
    }

    const teachersToAssign = [];
    if (allTeachers.length >= 2) {
      // Select two random unique teachers
      const shuffledTeachers = allTeachers.sort(() => 0.5 - Math.random());
      teachersToAssign.push(shuffledTeachers[0].id);
      teachersToAssign.push(shuffledTeachers[1].id);
    } else if (allTeachers.length === 1) {
      // Select one teacher if only one is available
      teachersToAssign.push(allTeachers[0].id);
    }

    if (teachersToAssign.length > 0) {
      const assignResult = await assignKiteToTeacher(teachersToAssign, kiteResult.kite.id);
      if (!assignResult.success) {
        console.error("Failed to assign kite to teachers:", assignResult.error);
        // Continue even if assignment fails, as kite was created
      }
    }

    return { success: true, kite: kiteResult.kite };
  } catch (error: any) {
    console.error("Error seeding kite:", error);
    return { success: false, error: error.message };
  }
}
