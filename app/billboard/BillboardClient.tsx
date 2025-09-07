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
import TeacherColumnComplex from "./TeacherColumnComplex";
import StudentBookingColumn from "./StudentBookingColumn";
import { BillboardClass } from "@/backend/BillboardClass";
import { TeacherQueue } from "@/backend/TeacherQueue";
import { type EventController } from "@/backend/types";
import { createTeacherQueuesFromBillboardClasses } from "@/backend/billboardUtils";
import { LOCATION_ENUM_VALUES } from "@/lib/constants";
import { createEvent } from "@/actions/event-actions";

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
    return data.bookings.map((booking) => new BillboardClass(booking));
  }, [data.bookings]);

  // Date filtering logic
  const filteredBillboardClasses = useMemo(() => {
    if (!selectedDate || isNaN(Date.parse(selectedDate))) {
      return [];
    }

    const filterDate = new Date(selectedDate);
    filterDate.setHours(0, 0, 0, 0);

    return billboardClasses.filter((bc) => {
      const bookingStart = new Date(bc.booking.date_start);
      const bookingEnd = new Date(bc.booking.date_end);
      bookingStart.setHours(0, 0, 0, 0);
      bookingEnd.setHours(23, 59, 59, 999);
      return filterDate >= bookingStart && filterDate <= bookingEnd;
    });
  }, [billboardClasses, selectedDate]);

  // Teacher queues for the selected date
  const teacherQueues = useMemo(() => {
    const queues = createTeacherQueuesFromBillboardClasses(
      data.teachers || [],
      filteredBillboardClasses,
      selectedDate,
    );

    // Convert array to Map for compatibility with existing code
    const queuesMap = new Map<string, TeacherQueue>();
    queues.forEach((queue) => {
      queuesMap.set(queue.teacher.id, queue);
    });
    return queuesMap;
  }, [data.teachers, filteredBillboardClasses, selectedDate]);

  // Calculate flag time - earliest time from teacher queues or controller submit time
  const calculatedFlagTime = useMemo(() => {
    const allTimes: string[] = [];
    teacherQueues.forEach((queue) => {
      const time = queue.getFlagTime();
      if (time !== null) {
        // Only if there are events
        allTimes.push(time);
      }
    });

    // If no events exist, use the controller submit time as fallback
    if (allTimes.length === 0) {
      const timeSource = "Controller Time";
      console.log(`Flag Time: ${controller.submitTime} (${timeSource})`);
      return controller.submitTime;
    }

    const earliestTime = allTimes.sort()[0];
    const timeSource = "Earliest Time";
    console.log(`Flag Time: ${earliestTime} (${timeSource})`);
    return earliestTime;
  }, [teacherQueues, controller.submitTime]);

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

      {/* Main content - Teacher Column and Student Column */}
      <div className="grid grid-cols-4 gap-4">
        <TeacherColumnComplex
          teachers={data.teachers || []}
          teacherQueues={teacherQueues}
          controller={controller}
          selectedDate={selectedDate}
        />

        <StudentBookingColumn
          billboardClasses={filteredBillboardClasses}
          selectedDate={selectedDate}
        />
      </div>

      {/* Dev Component - JSON View */}
      {/* <BillboardDev bookingsData={data.bookings} /> */}
    </div>
  );
}
