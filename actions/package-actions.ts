"use server";

import db from "@/drizzle";
import { PackageStudent } from "@/drizzle/migrations/schema";
import { eq, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getPackages() {
  try {
    const packages = await db.query.PackageStudent.findMany({
      with: {
        bookings: {
          columns: { id: true },
        },
      },
    });

    const packagesWithBookingCount = packages.map((pkg) => ({
      ...pkg,
      bookingCount: pkg.bookings?.length ?? 0,
    }));

    return { data: packagesWithBookingCount, error: null };
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Error fetching packages with Drizzle:", error, "Full error object:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
    return { data: [], error: errorMessage };
  }
}

export async function getPackageById(id: string) {
  try {
    const pkg = await db.query.PackageStudent.findFirst({
      where: eq(PackageStudent.id, id),
    });
    return { data: pkg, error: null };
  } catch (error: any) {
    console.error(`Error fetching package with ID ${id} with Drizzle:`, error);
    return { data: null, error: error.message };
  }
}
