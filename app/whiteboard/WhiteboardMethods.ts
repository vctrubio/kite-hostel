/**
 * Utility methods for Whiteboard operations
 * Centralized functions for TeacherSchedule management and statistics
 */

import { TeacherSchedule } from "@/backend/TeacherSchedule";
import { WhiteboardClass } from "@/backend/WhiteboardClass";

/**
 * Create TeacherSchedule instances from lessons and booking classes
 * Centralized logic for DRY principle across whiteboard components
 */
export function createTeacherSchedulesFromLessons(
  lessons: any[],
  bookingClasses: WhiteboardClass[],
  selectedDate: string
): Map<string, TeacherSchedule> {
  const teacherSchedules = new Map<string, TeacherSchedule>();

  // First pass: Create TeacherSchedule instances and add lessons
  lessons.forEach((lesson) => {
    if (!lesson.teacher?.id) return;
    
    const teacherId = lesson.teacher.id;
    const teacherName = lesson.teacher.name;
    
    // Get or create teacher schedule
    let teacherSchedule = teacherSchedules.get(teacherId);
    if (!teacherSchedule) {
      teacherSchedule = new TeacherSchedule(teacherId, teacherName, selectedDate);
      teacherSchedules.set(teacherId, teacherSchedule);
    }
    
    // Add lesson to schedule
    teacherSchedule.lessons.push(lesson);
    
    // Add events from this lesson
    if (lesson.events) {
      lesson.events
        .filter((event: any) => event != null && event.date)
        .forEach((event: any) => {
          if (TeacherSchedule.isSameDate(event.date, selectedDate)) {
            const localTime = TeacherSchedule.extractTimeFromDate(event.date);
            
            // Extract student names from booking
            let studentNames: string[] = [];
            if (lesson.booking?.students?.length > 0) {
              studentNames = lesson.booking.students.map(
                (bookingStudent: any) =>
                  bookingStudent.student?.name ||
                  bookingStudent.student?.first_name ||
                  "Unknown",
              );
            }

            teacherSchedule.addEvent(
              localTime,
              event.duration,
              lesson.id,
              event.location,
              lesson.booking?.students?.length || 1,
              studentNames.length > 0 ? studentNames : undefined,
            );
          }
        });
    }
  });

  // Second pass: Add booking classes to each teacher schedule
  bookingClasses.forEach((bookingClass) => {
    const lessonsForBooking = lessons.filter(lesson => lesson.booking.id === bookingClass.getId());
    
    lessonsForBooking.forEach((lesson) => {
      if (!lesson.teacher?.id) return;
      
      const teacherId = lesson.teacher.id;
      const teacherSchedule = teacherSchedules.get(teacherId);
      
      if (teacherSchedule) {
        teacherSchedule.addBookingClass(bookingClass);
      }
    });
  });

  return teacherSchedules;
}

/**
 * Calculate global statistics from all teacher schedules
 * Uses TeacherSchedule.calculateTeacherStats() method for each teacher
 */
export function calculateGlobalStats(teacherSchedules: Map<string, TeacherSchedule>) {
  let totalEvents = 0;
  let totalLessons = 0;
  let totalHours = 0;
  let totalEarnings = 0;
  let schoolRevenue = 0;

  teacherSchedules.forEach((schedule) => {
    const stats = schedule.calculateTeacherStats();
    totalEvents += stats.totalEvents;
    totalLessons += stats.totalLessons;
    totalHours += stats.totalHours;
    totalEarnings += stats.totalEarnings;
    schoolRevenue += stats.schoolRevenue;
  });

  return {
    totalEvents,
    totalLessons,
    totalHours,
    totalEarnings,
    schoolRevenue,
  };
}

/**
 * Get the earliest time from all teacher schedules
 * Uses TeacherSchedule.getEarliestTime() method for each teacher
 */
export function getEarliestTimeFromSchedules(teacherSchedules: Map<string, TeacherSchedule>): string | null {
  let earliest = null;
  teacherSchedules.forEach((schedule) => {
    const scheduleEarliest = schedule.getEarliestTime();
    if (scheduleEarliest && (!earliest || scheduleEarliest < earliest)) {
      earliest = scheduleEarliest;
    }
  });
  return earliest;
}