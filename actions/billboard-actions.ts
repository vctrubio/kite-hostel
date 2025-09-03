"use server";

import { getBookings } from "./booking-actions";
import { getTeachers } from "./teacher-actions";
import { type BookingData } from "@/backend/types";

export interface BillboardData {
  bookings: BookingData[];
  teachers: any[];
}

export async function getBillboardData(): Promise<{ data: BillboardData | null; error: string | null }> {
  try {
    const [bookingsResult, teachersResult] = await Promise.all([
      getBookings(),
      getTeachers()
    ]);

    if (bookingsResult.error) {
      return { data: null, error: `Bookings error: ${bookingsResult.error}` };
    }
    if (teachersResult.error) {
      return { data: null, error: `Teachers error: ${teachersResult.error}` };
    }

    const bookings = (bookingsResult.data || []).sort((a, b) => {
      const startA = new Date(a.date_start).getTime();
      const startB = new Date(b.date_start).getTime();
      if (startA !== startB) {
        return startA - startB;
      }
      const endA = new Date(a.date_end).getTime();
      const endB = new Date(b.date_end).getTime();
      return endA - endB;
    });

    return { 
      data: { bookings, teachers: teachersResult.data || [] }, 
      error: null 
    };
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Error fetching billboard data:", error);
    return { data: null, error: errorMessage };
  }
}