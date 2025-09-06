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
import StudentBookingColumn from "./StudentBookingColumn";
import { BillboardClass } from "@/backend/BillboardClass";
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

      {/* Main content */}
      <div className="grid grid-cols-1 gap-6">
        <StudentBookingColumn
          billboardClasses={filteredBillboardClasses}
          selectedDate={selectedDate}
        />
      </div>
    </div>
  );
}