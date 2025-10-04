"use server";

import db from "@/drizzle";
import { InferSelectModel } from "drizzle-orm";
import { PackageStudent, Booking } from "@/drizzle/migrations/schema";
import { eq, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";

interface CreatePackageParams {
  duration: number;
  description?: string;
  price_per_student: number;
  capacity_students: number;
  capacity_kites?: number;
}

type PackageWithRelations = InferSelectModel<typeof PackageStudent> & {
  bookingCount: number;
};

export async function getPackages(): Promise<{ data: PackageWithRelations[]; error: string | null }> {
  try {
    const packages = await db.query.PackageStudent.findMany({
      with: {
        bookings: {
          columns: { id: true },
        },
      },
    });

    const packagesWithRelations = packages.map((pkg) => ({
      ...pkg,
      bookingCount: pkg.bookings?.length ?? 0,
    }));

    return { data: packagesWithRelations, error: null };
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Error fetching packages with Drizzle:", error, "Full error object:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
    return { data: [], error: errorMessage };
  }
}

export async function getPackageById(id: string): Promise<{ data: PackageWithRelations | null; error: string | null }> {
  try {
    const pkg = await db.query.PackageStudent.findFirst({
      where: eq(PackageStudent.id, id),
      with: {
        bookings: {
          with: {
            students: {
              with: {
                student: true,
              },
            },
            lessons: {
              with: {
                events: true,
                teacher: true,
                commission: true,
              },
            },
            reference: {
              with: {
                teacher: true,
              },
            },
          },
        },
      },
    });

    if (!pkg) {
      return { data: null, error: "Package not found." };
    }

    const packageWithRelations: PackageWithRelations = {
      ...pkg,
      bookingCount: pkg.bookings?.length ?? 0,
    };

    return { data: packageWithRelations, error: null };
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error(`Error fetching package with ID ${id} with Drizzle:`, error, "Full error object:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
    return { data: null, error: errorMessage };
  }
}

export async function createPackage({
  duration,
  description,
  price_per_student,
  capacity_students,
  capacity_kites = 1,
}: CreatePackageParams): Promise<{ success: boolean; error: string | null; data?: PackageWithRelations }> {
  try {
    const newPackage = await db
      .insert(PackageStudent)
      .values({
        duration,
        description,
        price_per_student,
        capacity_students,
        capacity_kites,
      })
      .returning();

    if (newPackage.length === 0) {
      return { success: false, error: "Failed to create package." };
    }

    const createdPackage: PackageWithRelations = {
      ...newPackage[0],
      bookingCount: 0, // New package has no bookings yet
    };

    revalidatePath("/packages"); // Revalidate packages page
    revalidatePath("/bookings/form"); // Revalidate booking form in case it needs updated packages

    return { success: true, error: null, data: createdPackage };
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Error creating package:", error);
    return { success: false, error: errorMessage };
  }
}
