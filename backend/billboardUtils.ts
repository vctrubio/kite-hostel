/**
 * Billboard utilities for creating teacher queues and handling event logic
 */

import { BillboardClass } from './BillboardClass';
import { TeacherQueue, type EventNode, type TeacherInfo } from './TeacherQueue';

export interface TeacherEventItem {
  event: any;
  billboardClass: BillboardClass;
}

/**
 * Create teacher queues from billboard classes for a specific date
 */
export function createTeacherQueuesFromBillboardClasses(
  teachers: { id: string; name: string }[],
  billboardClasses: BillboardClass[],
  selectedDate: string
): TeacherQueue[] {
  if (!teachers || !selectedDate) return [];
  
  // Step 1: Create a map of teachers
  const teacherMap = new Map<string, TeacherInfo>();
  teachers.forEach(teacher => {
    teacherMap.set(teacher.id, { id: teacher.id, name: teacher.name });
  });
  
  // Step 2: Collect all events grouped by teacher ID
  const eventsByTeacher = collectEventsByTeacher(billboardClasses, selectedDate);
  
  // Step 3: Create TeacherQueues with properly ordered events
  const queues: TeacherQueue[] = [];
  
  teacherMap.forEach((teacherInfo, teacherId) => {
    const queue = new TeacherQueue(teacherInfo, selectedDate);
    const teacherEvents = eventsByTeacher.get(teacherId) || [];
    
    // Sort events by time
    teacherEvents.sort((a, b) => {
      const timeA = new Date(a.event.date).getTime();
      const timeB = new Date(b.event.date).getTime();
      return timeA - timeB;
    });
    
    // Add events to queue
    teacherEvents.forEach((item) => {
      const { event, billboardClass } = item;
      
      const eventNode: EventNode = {
        id: event.id,
        lessonId: event.lesson.id,
        billboardClass,
        eventData: {
          id: event.id,
          date: event.date,
          duration: event.duration,
          location: event.location,
          status: event.status
        },
        next: null
      };
      
      queue.addToQueue(eventNode);
    });
    
    queues.push(queue);
  });
  
  return queues;
}

/**
 * Collect events grouped by teacher ID for a specific date
 */
function collectEventsByTeacher(
  billboardClasses: BillboardClass[], 
  selectedDate: string
): Map<string, TeacherEventItem[]> {
  const eventsByTeacher = new Map<string, TeacherEventItem[]>();
  
  billboardClasses.forEach(bc => {
    bc.lessons.forEach(lesson => {
      if (!lesson.teacher?.id || !lesson.events) return;
      
      const teacherId = lesson.teacher.id;
      if (!eventsByTeacher.has(teacherId)) {
        eventsByTeacher.set(teacherId, []);
      }
      
      // Filter events for selected date
      lesson.events.forEach(event => {
        if (!event.date || !event.duration || !event.location || !event.status) return;
        
        const eventDate = new Date(event.date);
        eventDate.setHours(0, 0, 0, 0);
        
        const filterDate = new Date(selectedDate);
        filterDate.setHours(0, 0, 0, 0);
        
        if (eventDate.getTime() === filterDate.getTime()) {
          eventsByTeacher.get(teacherId)!.push({
            event: { ...event, lesson },
            billboardClass: bc
          });
        }
      });
    });
  });
  
  return eventsByTeacher;
}

