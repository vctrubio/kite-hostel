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
    
    // Add events to queue with gap calculation
    teacherEvents.forEach((item, index) => {
      const { event, billboardClass } = item;
      
      // Calculate gap if not the first event
      const gapMinutes = calculateGapMinutes(teacherEvents, index);
      const hasGap = gapMinutes !== undefined;
      
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
        hasGap,
        timeAdjustment: 0,
        next: null
      };
      
      queue.addEventNode(eventNode);
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

/**
 * Calculate gap in minutes between events
 */
function calculateGapMinutes(teacherEvents: TeacherEventItem[], currentIndex: number): number | undefined {
  if (currentIndex === 0) return undefined;
  
  const prevEvent = teacherEvents[currentIndex - 1].event;
  const currentEvent = teacherEvents[currentIndex].event;
  
  const prevEndTime = new Date(new Date(prevEvent.date).getTime() + (prevEvent.duration * 60 * 1000));
  const currentStartTime = new Date(currentEvent.date);
  
  const gapMilliseconds = currentStartTime.getTime() - prevEndTime.getTime();
  const gapMinutes = Math.round(gapMilliseconds / (1000 * 60));
  
  return gapMinutes > 0 ? gapMinutes : undefined;
}