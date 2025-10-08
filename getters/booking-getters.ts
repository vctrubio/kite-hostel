/**
 * Calculate the number of days between booking start and end dates
 * This calculation matches the booking timeline display
 */
export function calculateBookingDays(dateStart: string, dateEnd: string): number {
  const startDate = new Date(dateStart);
  const endDate = new Date(dateEnd);
  
  // Calculate days difference and add 1 to include both start and end days
  const daysDifference = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)
  );
  
  return daysDifference;
}
