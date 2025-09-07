"use client";

import { useState, useEffect, useMemo } from "react";
import { BillboardData } from "@/actions/billboard-actions";
import {
  getStoredDate,
  setStoredDate,
  getTodayDateString,
} from "@/components/formatters/DateTime";
import BillboardHeader from "./BillboardHeader";
import BillboardDev from "./BillboardDev";
import TeacherColumnSimple from "./TeacherColumnSimple";
import StudentBookingColumn from "./StudentBookingColumn";
import { BillboardClass } from "@/backend/BillboardClass";
import { TeacherQueue } from "@/backend/TeacherQueue";
import { type EventController } from "@/backend/types";
import { LOCATION_ENUM_VALUES } from "@/lib/constants";

const STORAGE_KEY = "billboard-selected-date";

interface BillboardClientProps {
  data: BillboardData;
}


export default function BillboardClient({ data }: BillboardClientProps) {
  // Core state
  const [selectedDate, setSelectedDate] = useState(() => getTodayDateString());
  const [controller, setController] = useState<EventController>(() => ({
    flag: false,
    location: LOCATION_ENUM_VALUES[0],
    submitTime: "12:00",
    durationCapOne: 120,
    durationCapTwo: 180,
    durationCapThree: 240,
  }));

  // Billboard classes for clean data access
  const billboardClasses = useMemo(() => {
    return data.bookings.map(booking => new BillboardClass(booking));
  }, [data.bookings]);

  // Date filtering logic
  const filteredBillboardClasses = useMemo(() => {
    if (!selectedDate || isNaN(Date.parse(selectedDate))) {
      return [];
    }

    const filterDate = new Date(selectedDate);
    filterDate.setHours(0, 0, 0, 0);

    return billboardClasses.filter(bc => {
      const bookingStart = new Date(bc.booking.date_start);
      const bookingEnd = new Date(bc.booking.date_end);
      bookingStart.setHours(0, 0, 0, 0);
      bookingEnd.setHours(23, 59, 59, 999);
      return filterDate >= bookingStart && filterDate <= bookingEnd;
    });
  }, [billboardClasses, selectedDate]);

  // Teacher queues for the selected date
  const teacherQueues = useMemo(() => {
    const queuesMap = new Map<string, TeacherQueue>();
    
    data.teachers?.forEach(teacher => {
      const teacherInfo = { id: teacher.id, name: teacher.name };
      const queue = new TeacherQueue(teacherInfo, selectedDate);
      
      // Get all events for this teacher on this date
      filteredBillboardClasses.forEach(bc => {
        const events = bc.getEventsForTeacherAndDate(teacher.id, selectedDate);
        events.forEach(event => {
          const eventNode = {
            id: event.id, // Use actual event ID (string) for existing events
            lessonId: event.lesson?.id || event.id,
            billboardClass: bc,
            eventData: {
              id: event.id, // This exists for existing events
              date: event.date,
              duration: event.duration || 120,
              location: event.location,
              status: event.status || "planned"
            },
            timeAdjustment: 0,
            next: null
          };
          queue.addEventNode(eventNode);
        });
      });
      
      queuesMap.set(teacher.id, queue);
    });
    
    console.log("TeacherQueues created:", queuesMap);
    return queuesMap;
  }, [data.teachers, filteredBillboardClasses, selectedDate]);

  // Available bookings (show all that have teacher assignments and can be dragged)
  const availableBillboardClasses = useMemo(() => {
    return filteredBillboardClasses.filter(bc => {
      // Show bookings that have teacher assignments (can be dragged)
      // Don't filter out based on drag state - let them stay visible
      return !bc.needsTeacherAssignment();
    });
  }, [filteredBillboardClasses]);

  // Drag and drop handlers (placeholder for future implementation)
  const handleTeacherDrop = (teacherId: string, bookingId: string) => {
    console.log(`Dropped booking ${bookingId} on teacher ${teacherId} - drag functionality not implemented yet`);
  };

  // Date management
  const handleDateChange = (date: string) => {
    if (!date || isNaN(Date.parse(date))) {
      console.error("Invalid date provided to handleDateChange:", date);
      return;
    }
    setSelectedDate(date);
    setStoredDate(STORAGE_KEY, date);
  };

  // Initialize date from storage
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

  return (
    <div className="min-h-screen p-4">
      {/* Header with date picker and controller */}
      <BillboardHeader
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
        controller={controller}
        onControllerChange={setController}
      />

      {/* Dev Component - JSON View */}
      <BillboardDev bookingsData={data.bookings} />

      {/* Main content - Teacher Column and Student Column */}
      <div className="grid grid-cols-4 gap-4">
        <TeacherColumnSimple
          teachers={data.teachers || []}
          teacherQueues={teacherQueues}
          dayOfWeek={new Date(selectedDate).toLocaleDateString("en-US", { weekday: "long" })}
          flagTime={controller.submitTime}
        />
        
        <StudentBookingColumn
          billboardClasses={availableBillboardClasses}
          selectedDate={selectedDate}
        />
      </div>
    </div>
  );
}