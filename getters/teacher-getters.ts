interface TeacherBalanceData {
  lessons?: Array<{
    events?: Array<{
      duration?: number;
    }>;
    commission?: {
      price_per_hour?: number;
    };
  }>;
  payments?: Array<{
    amount?: number;
  }>;
}

/**
 * Calculate teacher balance: total commission earned - total payments received
 */
export function getTeacherBalance(teacher: TeacherBalanceData): number {
  if (!teacher) return 0;

  // Calculate total commission earned from lessons
  const totalCommissionEarned = teacher.lessons?.reduce((total, lesson) => {
    const lessonHours = lesson.events?.reduce((eventTotal, event) => {
      return eventTotal + ((event.duration || 0) / 60); // Convert minutes to hours
    }, 0) || 0;
    
    const commissionRate = lesson.commission?.price_per_hour || 0;
    return total + (lessonHours * commissionRate);
  }, 0) || 0;

  // Calculate total payments received
  const totalPayments = teacher.payments?.reduce((total, payment) => {
    return total + (payment.amount || 0);
  }, 0) || 0;

  return totalCommissionEarned - totalPayments;
}