/**
 * Shared utility functions for grouping lessons and events by teachers
 * This keeps the logic DRY and reusable across components
 */

import { WhiteboardClass } from '@/backend/WhiteboardClass';
import { type TeacherLessons, type TeacherEvents } from '@/backend/types';

/**
 * Group lessons by teacher
 */
export function groupLessonsByTeacher(lessons: any[]): TeacherLessons[] {
  return lessons.reduce((acc: TeacherLessons[], lesson: any) => {
    const teacherId = lesson.teacher?.id || 'unassigned';
    const teacherName = lesson.teacher?.name || 'Unassigned';
    
    // Create WhiteboardClass instance from booking data
    const bookingClass = lesson.booking ? new WhiteboardClass(lesson.booking) : null;
    
    let teacherGroup = acc.find(group => group.teacherId === teacherId);
    
    if (!teacherGroup) {
      teacherGroup = {
        teacherId,
        teacherName,
        lessons: []
      };
      acc.push(teacherGroup);
    }
    
    if (bookingClass) {
      teacherGroup.lessons.push({
        lesson,
        bookingClass
      });
    }
    
    return acc;
  }, []);
}

/**
 * Group events by teacher
 */
export function groupEventsByTeacher(events: any[]): TeacherEvents[] {
  return events.reduce((acc: TeacherEvents[], event: any) => {
    const teacherId = event.lesson?.teacher?.id || 'unassigned';
    const teacherName = event.lesson?.teacher?.name || 'Unassigned';
    
    let teacherGroup = acc.find(group => group.teacherId === teacherId);
    
    if (!teacherGroup) {
      teacherGroup = {
        teacherId,
        teacherName,
        events: []
      };
      acc.push(teacherGroup);
    }
    
    teacherGroup.events.push({
      event,
      lesson: event.lesson,
      booking: event.booking
    });
    
    return acc;
  }, []);
}

/**
 * Calculate lesson statistics for a teacher group
 */
export function calculateLessonStats(teacherGroup: TeacherLessons) {
  const availableLessons = teacherGroup.lessons.filter(({ lesson }) => lesson.status === 'planned').length;
  const lessonsWithEvents = teacherGroup.lessons.filter(({ lesson }) => 
    lesson.status === 'planned' && lesson.events && lesson.events.length > 0
  ).length;
  
  return {
    availableLessons,
    lessonsWithEvents
  };
}

/**
 * Calculate event statistics for a teacher group
 */
export function calculateEventStats(teacherGroup: TeacherEvents) {
  const totalEvents = teacherGroup.events.length;
  const completedEvents = teacherGroup.events.filter(({ event }) => event.status === 'completed').length;
  const plannedEvents = teacherGroup.events.filter(({ event }) => event.status === 'planned' || event.status === 'tbc').length;
  
  return {
    totalEvents,
    completedEvents,
    plannedEvents
  };
}
