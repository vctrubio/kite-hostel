import { NextRequest, NextResponse } from 'next/server';
import db from "@/drizzle";
import { Booking, Lesson } from "@/drizzle/migrations/schema";
import { isNull } from "drizzle-orm";

export interface TransactionData {
  id: string;
  eventDate: string;
  eventStartTime: string;
  students: string[];
  studentIds: string[];
  teacher: string;
  teacherId: string;
  duration: number; // in minutes
  revenue: number; // in euros
  bookingId: string;
  packageHours: number; // package duration in hours
  pricePerStudent: number; // package price per student
}

/**
 * Calculate revenue for a single event
 * Formula: price_per_hour = (price_per_student * capacity) / (package_duration_in_hours)
 * Revenue = price_per_hour * event_duration_in_hours
 * 
 * @param pricePerStudent - Price per student from package (in euros)
 * @param capacity - Capacity of students in the package
 * @param eventDuration - Duration of the event (in minutes)
 * @param packageDuration - Duration of the package (in minutes)
 * @returns Revenue in euros
 */
function calculateEventRevenue(
  pricePerStudent: number,
  capacity: number,
  eventDuration: number,
  packageDuration: number
): number {
  // Calculate package full price
  const packageFullPrice = pricePerStudent * capacity;
  
  // Convert package duration to hours
  const packageDurationHours = packageDuration / 60;
  
  // Calculate price per hour
  const pricePerHour = packageFullPrice / packageDurationHours;
  
  // Convert event duration to hours
  const eventDurationHours = eventDuration / 60;
  
  // Calculate revenue
  const revenue = pricePerHour * eventDurationHours;
  
  return Math.round(revenue * 100) / 100; // Round to 2 decimal places
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build the query to get all bookings with their relations
    const bookings = await db.query.Booking.findMany({
      where: isNull(Booking.deleted_at),
      with: {
        package: true,
        students: {
          with: {
            student: true,
          },
        },
        lessons: {
          where: isNull(Lesson.deleted_at),
          with: {
            teacher: true,
            events: true,
          },
        },
      },
    });

    // Transform bookings into transaction data
    const transactions: TransactionData[] = [];

    for (const booking of bookings) {
      const studentNames = booking.students.map(
        (bs) => bs.student.name + (bs.student.last_name ? ` ${bs.student.last_name}` : '')
      );
      const studentIds = booking.students.map((bs) => bs.student.id);

      for (const lesson of booking.lessons) {
        for (const event of lesson.events) {
          const eventDate = new Date(event.date);

          // Apply date filtering if provided
          if (startDate && eventDate < new Date(startDate)) continue;
          if (endDate && eventDate > new Date(endDate)) continue;

          // Extract time from timestamp
          const hours = eventDate.getHours();
          const minutes = eventDate.getMinutes();
          const eventStartTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

          // Calculate revenue using package capacity
          const revenue = calculateEventRevenue(
            booking.package.price_per_student,
            booking.package.capacity_students,
            event.duration,
            booking.package.duration
          );

          transactions.push({
            id: `${booking.id}-${lesson.id}-${event.id}`,
            eventDate: eventDate.toISOString().split('T')[0],
            eventStartTime: eventStartTime,
            students: studentNames,
            studentIds: studentIds,
            teacher: lesson.teacher?.name || 'Unknown',
            teacherId: lesson.teacher?.id || '',
            duration: event.duration,
            revenue,
            bookingId: booking.id,
            packageHours: booking.package.duration / 60, // Convert minutes to hours
            pricePerStudent: booking.package.price_per_student,
          });
        }
      }
    }

    // Sort by date descending (newest first)
    transactions.sort((a, b) => 
      new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
    );

    // Calculate total revenue
    const totalRevenue = transactions.reduce((sum, t) => sum + t.revenue, 0);

    return NextResponse.json({
      success: true,
      data: transactions,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      count: transactions.length,
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return NextResponse.json(
      { error: 'Error fetching statistics data' },
      { status: 500 }
    );
  }
}
