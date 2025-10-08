/**
 * Calculate the number of days between booking start and end dates
 * This calculation matches the booking timeline display
 */
export function calculateBookingDays(dateStart: string, dateEnd: string): number {
  const startDate = new Date(dateStart);
  const endDate = new Date(dateEnd);
  
  // Calculate days difference (inclusive of both start and end days)
  const daysDifference = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)
  );
  
  // If start and end are the same day, return 1
  // Otherwise, add 1 to include both the start and end day
  return daysDifference === 0 ? 1 : daysDifference + 1;
}

/**
 * Get the additional days count for display (totalDays - 1)
 * Returns 0 if it's a single-day booking
 */
export function getAdditionalDays(dateStart: string, dateEnd: string): number {
  const totalDays = calculateBookingDays(dateStart, dateEnd);
  return totalDays > 1 ? totalDays - 1 : 0;
}
