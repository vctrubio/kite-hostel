"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { BillboardData } from "@/actions/billboard-actions";
import {
  getStoredDate,
  setStoredDate,
  getTodayDateString,
} from "@/components/formatters/DateTime";
import BillboardHeader from "./BillboardHeader";
import BillboardDev from "./BillboardDev";
import TeacherColumn from "./TeacherColumn";
import StudentBookingColumn from "./StudentBookingColumn";
import { TeacherSchedule } from "@/backend/TeacherSchedule";
import { WhiteboardClass, extractStudents } from "@/backend/WhiteboardClass";
import { type EventController } from "@/backend/types";
import { LOCATION_ENUM_VALUES } from "@/lib/constants";

const STORAGE_KEY = "billboard-selected-date";

interface BillboardClientProps {
  data: BillboardData;
}


export default function BillboardClient({ data }: BillboardClientProps) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(() => getTodayDateString());
  const [teacherSchedules, setTeacherSchedules] = useState<
    Map<string, TeacherSchedule>
  >(new Map());
  const [draggedBooking, setDraggedBooking] = useState<any>(null);

  // Memoized booking classes to avoid redundant instantiations
  const bookingClasses = useMemo(() => {
    const classes = new Map<string, WhiteboardClass>();
    data.bookings.forEach(booking => {
      classes.set(booking.id, new WhiteboardClass(booking));
    });
    return classes;
  }, [data.bookings]);

  // Controller settings (copied from WhiteboardLessons pattern)
  const [controller, setController] = useState<EventController>(() => ({
    flag: false,
    location: LOCATION_ENUM_VALUES[0],
    submitTime: "12:00",
    durationCapOne: 120,
    durationCapTwo: 180,
    durationCapThree: 240,
  }));

  const handleDateChange = (date: string) => {
    if (!date || isNaN(Date.parse(date))) {
      console.error("Invalid date provided to handleDateChange:", date);
      return;
    }
    setSelectedDate(date);
    setStoredDate(STORAGE_KEY, date);
  };

  useEffect(() => {
    const storedDate = getStoredDate(STORAGE_KEY);
    const isValidDate = storedDate && !isNaN(Date.parse(storedDate));

    if (isValidDate) {
      setSelectedDate(storedDate);
    } else {
      const today = getTodayDateString();
      setSelectedDate(today);
      setStoredDate(STORAGE_KEY, today);
    }
  }, []);

  // Initialize teacher schedules with real lessons and events
  useEffect(() => {
    const schedules = new Map<string, TeacherSchedule>();

    console.log("Initializing teacher schedules with data: ", data);
    
    data.teachers?.forEach((teacher) => {
      const teacherSchedule = new TeacherSchedule(
        teacher.id,
        teacher.name,
        selectedDate,
      );
      teacherSchedule.setQueueStartTime(controller.submitTime);
      
      // Find all lessons for this teacher across all bookings
      data.bookings.forEach((booking) => {
        const bookingClass = bookingClasses.get(booking.id);
        if (!bookingClass) return;
        const lessons = bookingClass.getLessons() || [];
        
        lessons.forEach((lesson) => {
          if (lesson.teacher?.id === teacher.id) {
            // Get events for this lesson on the selected date
            const lessonEvents = lesson.events?.filter((event: any) => {
              if (!event.date) return false;
              const eventDate = new Date(event.date);
              const filterDate = new Date(selectedDate);
              eventDate.setHours(0, 0, 0, 0);
              filterDate.setHours(0, 0, 0, 0);
              return eventDate.getTime() === filterDate.getTime();
            }) || [];
            
            if (lessonEvents.length > 0) {
              // Add lesson with events to the teacher schedule
              const students = extractStudents(booking);
              const studentNames = students.map(s => s.name);
              
              // Add real lesson to queue with actual event data
              teacherSchedule.addLessonToQueue(
                lesson.id,
                lessonEvents[0].duration || controller.durationCapOne,
                studentNames,
                bookingClass.getTotalMinutes(),
                lessonEvents[0].status || "planned",
              );
              
              console.log(`Added lesson ${lesson.id} to teacher ${teacher.name} with ${lessonEvents.length} events`);
            }
          }
        });
      });
      
      schedules.set(teacher.id, teacherSchedule);
    });

    setTeacherSchedules(schedules);
  }, [data, bookingClasses, selectedDate, controller.submitTime, controller.durationCapOne]);

  const handleDrop = (teacherId: string, e: React.DragEvent) => {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData("text/plain"));
      const booking = data.booking;

      const teacherSchedule = teacherSchedules.get(teacherId);
      if (!teacherSchedule) return;

      // Create a fake lesson from booking to add to queue
      const students = extractStudents(booking);
      const bookingClass = bookingClasses.get(booking.id);
      if (!bookingClass) return;

      // Create a pseudo lesson ID from booking ID
      const lessonId = `lesson_${booking.id}`;

      // Add to teacher's lesson queue
      teacherSchedule.addLessonToQueue(
        lessonId,
        controller.durationCapOne, // Default duration
        students.map((s) => s.name),
        bookingClass.getTotalMinutes(),
        "planned",
      );

      // Trigger re-render
      setTeacherSchedules(new Map(teacherSchedules));
      setDraggedBooking(null);
    } catch (error) {
      console.error("Failed to handle drop:", error);
    }
  };


  // Create map of teacher events for TeacherColumn
  const teacherEvents = useMemo(() => {
    const eventsMap = new Map<string, any[]>();
    
    data.teachers?.forEach(teacher => {
      const events = data.bookings.flatMap(booking => {
        const bookingClass = bookingClasses.get(booking.id);
        if (!bookingClass) return [];
        const lessons = bookingClass.getLessons() || [];
        
        return lessons.flatMap(lesson => {
          if (lesson.teacher?.id !== teacher.id) return [];
          
          const filteredEvents = lesson.events?.filter((event: any) => {
            if (!event.date) return false;
            const eventDate = new Date(event.date);
            const filterDate = new Date(selectedDate);
            eventDate.setHours(0, 0, 0, 0);
            filterDate.setHours(0, 0, 0, 0);
            return eventDate.getTime() === filterDate.getTime();
          }) || [];
          
          return filteredEvents.map(event => ({ ...event, booking, lesson }));
        });
      });
      
      eventsMap.set(teacher.id, events);
    });
    
    return eventsMap;
  }, [data, bookingClasses, selectedDate]);

  const filteredData = useMemo(() => {
    if (!selectedDate || isNaN(Date.parse(selectedDate))) {
      return {
        bookings: [],
        teachers: data.teachers || [],
      };
    }

    const filterDate = new Date(selectedDate);
    filterDate.setHours(0, 0, 0, 0);

    const dateFilteredBookings = data.bookings.filter((booking) => {
      const bookingStart = new Date(booking.date_start);
      const bookingEnd = new Date(booking.date_end);
      bookingStart.setHours(0, 0, 0, 0);
      bookingEnd.setHours(23, 59, 59, 999);
      return filterDate >= bookingStart && filterDate <= bookingEnd;
    });

    // Filter out already assigned bookings from all teacher schedules
    const assignedBookingIds = new Set<string>();
    teacherSchedules.forEach((schedule) => {
      schedule.getLessonQueue().forEach((queuedLesson) => {
        // Handle both pseudo lesson IDs (lesson_bookingId) and real lesson IDs
        if (queuedLesson.lessonId.startsWith("lesson_")) {
          // Pseudo lesson ID from dragged booking
          const bookingId = queuedLesson.lessonId.replace("lesson_", "");
          assignedBookingIds.add(bookingId);
        } else {
          // Real lesson ID - find the booking through lessons
          data.bookings.forEach((booking) => {
            const bookingClass = bookingClasses.get(booking.id);
            if (bookingClass) {
              const lessons = bookingClass.getLessons() || [];
              if (lessons.some(lesson => lesson.id === queuedLesson.lessonId)) {
                assignedBookingIds.add(booking.id);
              }
            }
          });
        }
      });
    });

    const availableBookings = dateFilteredBookings.filter(
      (booking) => !assignedBookingIds.has(booking.id),
    );

    return {
      bookings: availableBookings,
      teachers: data.teachers || [],
    };
  }, [data, selectedDate, teacherSchedules, bookingClasses]);


  //for each teacher schedule console log the json object
  useEffect(() => {
    teacherSchedules.forEach((schedule, teacherId) => {
      console.log(`Teacher ID: ${teacherId}, Schedule: `);
      console.dir(schedule);
    });
  }, [teacherSchedules]);

  return (
    <div className="min-h-screen p-4">
      {/* Header with date picker, controller, and stats */}
      <BillboardHeader
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
        controller={controller}
        onControllerChange={setController}
        teacherSchedules={teacherSchedules}
      />

      {/* Billboard Dev Component - JSON View */}
      <BillboardDev bookingsData={data.bookings} />

      {/* Main content - 3/4 and 1/4 split */}
      <div className="grid grid-cols-4 gap-6">
        <TeacherColumn
          teachers={filteredData.teachers}
          teacherSchedules={teacherSchedules}
          teacherEvents={teacherEvents}
          selectedDate={selectedDate}
          controller={controller}
          onDrop={handleDrop}
          onTeacherSchedulesChange={setTeacherSchedules}
          onRevalidate={() => router.refresh()}
          data={data}
          bookingClasses={bookingClasses}
        />
        
        <StudentBookingColumn
          bookings={filteredData.bookings}
          teachers={filteredData.teachers}
          selectedDate={selectedDate}
          onDragStart={setDraggedBooking}
          bookingClasses={bookingClasses}
        />
      </div>
    </div>
  );
}