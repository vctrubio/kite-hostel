"use server";

import { getBookingById } from "@/actions/booking-actions";
import { extractStudents } from "@/backend/WhiteboardClass";
import { format } from "date-fns";
import db from "@/drizzle";
import { Commission } from "@/drizzle/migrations/schema";
import { eq } from "drizzle-orm";

// Function to get commission details
async function getCommission(commissionId: string) {
  try {
    const commission = await db.query.Commission.findFirst({
      where: eq(Commission.id, commissionId)
    });
    return commission;
  } catch (error) {
    console.error("Error fetching commission:", error);
    return null;
  }
}

export interface ExportBookingData {
  id: string;
  purchasedDate: string;
  startDate: string;
  endDate: string;
  students: string;
  packageDescription: string;
  packageHours: number;
  kitedHours: number;
  packageKites: number;
  packageCapacity: number;
  referenceId: string;
  pricePerStudent: number;
  totalRevenue: number;
}

export interface ExportEventData {
  id: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  teacher: string;
  students: string;
  teacherCommission: number;
  schoolRevenue: number;
}

// Function to prepare booking data for export
export async function prepareBookingExport(bookingId: string): Promise<ExportBookingData | null> {
  const { data: booking, error } = await getBookingById(bookingId);
  
  if (error || !booking) {
    // Only log actual errors, not "booking not found" cases
    if (error && !error.includes("not found")) {
      console.error("Error fetching booking for export:", error);
    }
    return null;
  }
  
  const students = extractStudents(booking);
  const packageHours = booking.package ? booking.package.duration / 60 : 0;
  const totalRevenue = booking.package
    ? booking.package.price_per_student * booking.package.capacity_students
    : 0;
  
  // Calculate total hours kited (sum of all event durations)
  const kitedHours = booking.lessons?.reduce((total, lesson) => {
    const lessonEventMinutes = lesson.events?.reduce((sum, event) => sum + (event.duration || 0), 0) || 0;
    return total + lessonEventMinutes / 60;
  }, 0) || 0;
    
  return {
    id: booking.id,
    purchasedDate: booking.created_at ? format(new Date(booking.created_at), 'yyyy-MM-dd') : 'N/A',
    startDate: format(new Date(booking.date_start), 'yyyy-MM-dd'),
    endDate: format(new Date(booking.date_end), 'yyyy-MM-dd'),
    students: students.map(s => s.name).join(', '),
    packageDescription: booking.package?.description || 'No description',
    packageHours,
    kitedHours,
    packageKites: booking.package?.capacity_kites || 0,
    packageCapacity: booking.package?.capacity_students || 0,
    referenceId: booking.reference?.id || 'N/A',
    pricePerStudent: booking.package?.price_per_student || 0,
    totalRevenue
  };
}

// Function to prepare events data for export
export async function prepareEventsExport(bookingId: string): Promise<ExportEventData[]> {
  const { data: booking, error } = await getBookingById(bookingId);
  
  if (error || !booking) {
    // Only log actual errors, not "booking not found" cases
    if (error && !error.includes("not found")) {
      console.error("Error fetching booking events for export:", error);
    }
    return [];
  }
  
  const students = extractStudents(booking);
  const studentNames = students.map(s => s.name).join(', ');
  
  const events: ExportEventData[] = [];
  
  // Loop through all lessons and their events
  for (const lesson of booking.lessons || []) {
    const teacherName = lesson.teacher?.name || 'Unknown';
    const commission = await getCommission(lesson.commission_id);
    const teacherCommissionRate = commission?.price_per_hour || 0;
    
    for (const event of lesson.events || []) {
      const eventDate = new Date(event.date);
      const durationHours = (event.duration || 0) / 60;
      const teacherCommission = teacherCommissionRate * durationHours;
      const schoolRevenue = (booking.package?.price_per_student || 0) * students.length * durationHours - teacherCommission;
      
      events.push({
        id: event.id,
        date: format(eventDate, 'yyyy-MM-dd'),
        time: format(eventDate, 'HH:mm'),
        duration: `${durationHours.toFixed(1)}h`,
        location: event.location,
        teacher: teacherName,
        students: studentNames,
        teacherCommission,
        schoolRevenue: Math.max(0, schoolRevenue) // Ensure school revenue is not negative
      });
    }
  }
  
  return events;
}

// Proxy function to export data to XLSX format on the client
export async function getBookingExportData(bookingId: string) {
  return await prepareBookingExport(bookingId);
}

export async function getEventsExportData(bookingId: string) {
  return await prepareEventsExport(bookingId);
}
