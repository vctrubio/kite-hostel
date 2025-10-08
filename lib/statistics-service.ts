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
  bookingDateStart: string; // From booking.date_start
  bookingDateEnd: string; // From booking.date_end
  packageHours: number; // package duration in hours
  pricePerStudent: number; // package price per student
}

/**
 * Calculate revenue for a single event
 */
function calculateEventRevenue(
  pricePerStudent: number,
  capacity: number,
  eventDuration: number,
  packageDuration: number
): number {
  const packageFullPrice = pricePerStudent * capacity;
  const packageDurationHours = packageDuration / 60;
  const pricePerHour = packageFullPrice / packageDurationHours;
  const eventDurationHours = eventDuration / 60;
  const revenue = pricePerHour * eventDurationHours;
  
  return Math.round(revenue * 100) / 100;
}

export async function getStatisticsData(
  startDate?: string | null,
  endDate?: string | null
) {
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

  const transactions: TransactionData[] = [];

  for (const booking of bookings) {
    const studentNames = booking.students.map(
      (bs) => bs.student.name + (bs.student.last_name ? ` ${bs.student.last_name}` : '')
    );
    const studentIds = booking.students.map((bs) => bs.student.id);

    for (const lesson of booking.lessons) {
      for (const event of lesson.events) {
        const eventDate = new Date(event.date);

        if (startDate && eventDate < new Date(startDate)) continue;
        if (endDate && eventDate > new Date(endDate)) continue;

        const hours = eventDate.getHours();
        const minutes = eventDate.getMinutes();
        const eventStartTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

        const revenue = calculateEventRevenue(
          booking.package.price_per_student,
          booking.package.capacity_students,
          event.duration,
          booking.package.duration
        );

        const bookingDateStart = booking.date_start 
          ? new Date(booking.date_start).toISOString().split('T')[0]
          : '';
        const bookingDateEnd = booking.date_end 
          ? new Date(booking.date_end).toISOString().split('T')[0]
          : '';

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
          bookingDateStart,
          bookingDateEnd,
          packageHours: booking.package.duration / 60,
          pricePerStudent: booking.package.price_per_student,
        });
      }
    }
  }

  transactions.sort((a, b) => 
    new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
  );

  const totalRevenue = transactions.reduce((sum, t) => sum + t.revenue, 0);

  return {
    success: true,
    data: transactions,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    count: transactions.length,
  };
}
