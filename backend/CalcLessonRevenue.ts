/**
 * Revenue calculation utilities for lessons and bookings
 * Centralizes revenue, teacher earnings, and school earnings calculations
 */

interface LessonRevenue {
  revenue: number;      // Total revenue from all bookings (expected/potential)
  teacher: number;      // Teacher earnings from lessons that happened (have events)
  school: number;       // School earnings from lessons that happened (revenue from events - teacher)
  moneyMade: number;    // Total money made (teacher + school earnings from actual events)
}

/**
 * Calculate revenue breakdown from bookings with lessons
 * @param bookings Array of booking objects with lessons, students, packages, and commissions
 * @returns Object with revenue, teacher earnings, and school earnings
 */
export function calcLessonRevenue(bookings: any[]): LessonRevenue {
  // Calculate total revenue from all bookings
  const revenue = bookings.reduce((sum, booking) => {
    const studentsCount = booking.students?.length || 0;
    const pricePerStudent = booking.package?.price_per_student || 0;
    return sum + studentsCount * pricePerStudent;
  }, 0);

  // Calculate teacher earnings from all lessons
  const teacher = bookings.reduce((sum, booking) => {
    if (!booking.lessons || booking.lessons.length === 0) return sum;

    return (
      sum +
      booking.lessons.reduce((lessonSum, lesson) => {
        if (lesson.events && lesson.commission) {
          // Calculate total event duration for this lesson
          const totalEventDuration = lesson.events.reduce((eventSum, event) => {
            return eventSum + (event.duration || 0);
          }, 0);

          // Convert minutes to hours and multiply by commission rate
          const hoursWorked = totalEventDuration / 60;
          const commissionRate = lesson.commission.price_per_hour || 0;
          return lessonSum + hoursWorked * commissionRate;
        }
        return lessonSum;
      }, 0)
    );
  }, 0);

  // Calculate school earnings - based on event hours × package hourly rate - teacher commission
  const school = bookings.reduce((sum, booking) => {
    if (!booking.lessons || booking.lessons.length === 0) return sum;

    return (
      sum +
      booking.lessons.reduce((lessonSum, lesson) => {
        if (lesson.events && lesson.events.length > 0 && lesson.commission) {
          // Calculate total event duration for this lesson
          const totalEventDuration = lesson.events.reduce((eventSum, event) => {
            return eventSum + (event.duration || 0);
          }, 0);
          const hoursWorked = totalEventDuration / 60;

          // Calculate school revenue based on package hourly rate × students × hours
          const studentsCount = booking.students?.length || 0;
          const packageDuration = booking.package?.duration || 0; // package duration in minutes
          const packageHours = packageDuration / 60;
          const pricePerStudent = booking.package?.price_per_student || 0;
          const hourlyRatePerStudent = packageHours > 0 ? pricePerStudent / packageHours : 0;
          const schoolEventRevenue = studentsCount * hourlyRatePerStudent * hoursWorked;

          // Calculate teacher earnings for this lesson
          const commissionRate = lesson.commission.price_per_hour || 0;
          const lessonTeacherEarnings = hoursWorked * commissionRate;

          // School earnings = school event revenue - teacher earnings
          return lessonSum + (schoolEventRevenue - lessonTeacherEarnings);
        }
        return lessonSum;
      }, 0)
    );
  }, 0);

  return {
    revenue,
    teacher,
    school,
    moneyMade: teacher + school,
  };
}

