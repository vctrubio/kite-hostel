"use server";

import db from "@/drizzle";
import { Booking, PackageStudent } from "@/drizzle/migrations/schema";
import { eq, count } from "drizzle-orm";

export async function getBookingCountByPackageId(packageId: string) {
  try {
    const result = await db
      .select({ count: count() })
      .from(Booking)
      .where(eq(Booking.package_id, packageId));

    return { count: result[0].count, error: null };
  } catch (error: any) {
    console.error(
      `Error fetching booking count for package with ID ${packageId} with Drizzle:`,
      error
    );
    return { count: 0, error: error.message };
  }
}
