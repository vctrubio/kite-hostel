/**
 * Statistics calculation utilities for lessons
 * Centralizes lesson categorization and hour calculations
 */

// Helper function for consistent hour rounding (1 decimal place)
const roundHours = (hours: number): number => Math.round(hours * 10) / 10;

interface LessonStats {
  totalHours: number;   // Total hours from all lesson events
  privateHours: number; // Private lessons (1 student)
  semiPrivate: number;  // Semi-private lessons (2 students)
  group: number;        // Group lessons (3+ students)
}

/**
 * Calculate lesson statistics breakdown
 * @param lessons Array of lesson objects with events and booking data
 * @returns Object with total hours and lesson type breakdown
 */
export function calcLessonStats(lessons: any[]): LessonStats {
  let totalHours = 0;
  let privateHours = 0;
  let semiPrivate = 0;
  let group = 0;

  lessons.forEach((lesson) => {
    if (!lesson.events || lesson.events.length === 0) return;

    // Calculate total hours for this lesson
    const lessonHours = lesson.events.reduce((sum, event) => {
      return sum + (event.duration || 0);
    }, 0) / 60; // Convert minutes to hours

    totalHours += lessonHours;

    // Categorize lesson based on student count
    const studentsCount = lesson.booking?.students?.length || 0;
    
    if (studentsCount === 1) {
      privateHours += lessonHours;
    } else if (studentsCount === 2) {
      semiPrivate += lessonHours;
    } else if (studentsCount >= 3) {
      group += lessonHours;
    }
  });

  return {
    totalHours: roundHours(totalHours),
    privateHours: roundHours(privateHours),
    semiPrivate: roundHours(semiPrivate),
    group: roundHours(group),
  };
}