/**
 * TimeZone Utility - Ensures consistent date/time handling across the application
 * 
 * All times in this app are treated as UTC to avoid timezone conversion issues.
 * Use these utilities instead of native Date operations.
 */

/**
 * Create a UTC datetime from date and time strings
 * @param date - Date string (YYYY-MM-DD)
 * @param time - Time string (HH:MM)
 * @returns Date object representing the exact UTC time
 */
export function createUTCDateTime(date: string, time: string): Date {
  return new Date(`${date}T${time}:00.000Z`);
}

/**
 * Format a UTC datetime to ISO string for database storage
 * @param date - Date object
 * @returns ISO string in UTC
 */
export function toUTCString(date: Date): string {
  return date.toISOString();
}

/**
 * Extract time (HH:MM) from a UTC datetime string
 * @param isoString - ISO datetime string
 * @returns Time string (HH:MM)
 */
export function extractTimeFromUTC(isoString: string): string {
  const date = new Date(isoString);
  return `${date.getUTCHours().toString().padStart(2, '0')}:${date.getUTCMinutes().toString().padStart(2, '0')}`;
}

/**
 * Extract date (YYYY-MM-DD) from a UTC datetime string
 * @param isoString - ISO datetime string
 * @returns Date string (YYYY-MM-DD)
 */
export function extractDateFromUTC(isoString: string): string {
  const date = new Date(isoString);
  return date.toISOString().split('T')[0];
}

/**
 * Check if two UTC datetime strings are on the same date
 * @param date1 - First UTC datetime string
 * @param date2 - Second UTC datetime string
 * @returns True if same date
 */
export function isSameUTCDate(date1: string, date2: string): boolean {
  return extractDateFromUTC(date1) === extractDateFromUTC(date2);
}

/**
 * Add minutes to a time string (HH:MM)
 * @param time - Time string (HH:MM)
 * @param minutes - Minutes to add (can be negative)
 * @returns New time string (HH:MM)
 */
export function addMinutesToTime(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number);
  const totalMinutes = h * 60 + m + minutes;
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMins = totalMinutes % 60;
  return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
}

/**
 * Convert time string to minutes since midnight
 * @param time - Time string (HH:MM)
 * @returns Minutes since midnight
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Convert minutes since midnight to time string
 * @param minutes - Minutes since midnight
 * @returns Time string (HH:MM)
 */
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Format duration in minutes to human-readable string
 * @param minutes - Duration in minutes
 * @returns Formatted duration string
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}:${mins.toString().padStart(2, '0')}hrs` : `${hours}:00hrs`;
}

/**
 * Get current UTC date string (YYYY-MM-DD)
 * @returns Current date in UTC
 */
export function getCurrentUTCDate(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get current UTC time string (HH:MM)
 * @returns Current time in UTC
 */
export function getCurrentUTCTime(): string {
  const now = new Date();
  return `${now.getUTCHours().toString().padStart(2, '0')}:${now.getUTCMinutes().toString().padStart(2, '0')}`;
}
