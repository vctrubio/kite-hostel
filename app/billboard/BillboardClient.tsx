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
import { type EventController } from "@/backend/types";
import { createTeacherQueuesFromBillboardClasses } from "@/backend/billboardUtils";
import { LOCATION_ENUM_VALUES } from "@/lib/constants";
import {
  exportBillboardEventsToCsv,
  exportBillboardEventsToXlsm,
  generateWhatsAppMessage,
  generateMedicalEmail,
  shareToWhatsApp,
  sendMedicalEmail,
  generatePrintHTML,
  printHTMLDocument,
  extractShareDataFromTeacherQueues,
} from "@/components/billboard/BillboardExportUtils";

const STORAGE_KEY = "billboard-selected-date";
interface BillboardClientProps {
  data: BillboardData;
}

export default function BillboardClient({ data }: BillboardClientProps) {
  // Core state
  const [selectedDate, setSelectedDate] = useState(() => getTodayDateString());
  const [draggedBooking, setDraggedBooking] = useState<BillboardClass | null>(
    null,
  );
  const [exportDebugMode, setExportDebugMode] = useState(true);
  const [debugText, setDebugText] = useState<string>("");
  const [showDebugDropdown, setShowDebugDropdown] = useState(false);
  const [controller, setController] = useState<EventController>({
    flag: false,
    location: LOCATION_ENUM_VALUES[0],
    submitTime: "12:00",
    durationCapOne: 120,
    durationCapTwo: 180,
    durationCapThree: 240,
  });

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
    return createTeacherQueuesFromBillboardClasses(
      data.teachers || [],
      filteredBillboardClasses,
      selectedDate,
    );
  }, [data.teachers, filteredBillboardClasses, selectedDate]);

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

  const globalStats = useMemo(() => {
    const stats = {
      eventCount: 0,
      totalHours: 0,
      earnings: {
        teacher: 0,
        school: 0,
      },
    };

    if (!teacherQueues) {
      return stats;
    }

    teacherQueues.forEach((queue) => {
      const teacherStats = queue.getTeacherStats();
      stats.eventCount += teacherStats.eventCount;
      stats.totalHours += teacherStats.totalHours;
      stats.earnings.teacher += teacherStats.earnings.teacher;
      stats.earnings.school += teacherStats.earnings.school;
    });

    return stats;
  }, [teacherQueues]);

  const teacherCount = useMemo(() => {
    return teacherQueues.filter((tq) => tq.getAllEvents().length > 0).length;
  }, [teacherQueues]);

  const studentCount = useMemo(() => {
    const studentIds = new Set<string>();

    teacherQueues.forEach((queue) => {
      const events = queue.getAllEvents();
      events.forEach((eventNode) => {
        const students = eventNode.billboardClass.booking.students;
        if (students) {
          students.forEach((student) => {
            studentIds.add(student.id);
          });
        }
      });
    });

    return studentIds.size;
  }, [teacherQueues]);

  const eventStatus = useMemo(() => {
    let planned = 0;
    let completed = 0;
    let tbc = 0;
    let cancelled = 0;
    let total = 0;
    const allIds: string[] = [];
    const incompleteIds: string[] = [];

    teacherQueues.forEach((queue) => {
      const events = queue.getAllEvents();
      events.forEach((eventNode) => {
        const eventId = eventNode.eventData.id;
        total++;
        allIds.push(eventId);
        const status = eventNode.eventData.status;

        switch (status) {
          case "planned":
            planned++;
            incompleteIds.push(eventId);
            break;
          case "completed":
            completed++;
            break;
          case "tbc":
            tbc++;
            incompleteIds.push(eventId);
            break;
          case "cancelled":
            cancelled++;
            incompleteIds.push(eventId);
            break;
        }
      });
    });

    return {
      planned,
      completed,
      tbc,
      cancelled,
      total,
      allIds,
      incompleteIds,
    };
  }, [teacherQueues]);

  const handleActionClick = async (actionId: string) => {
    try {
      // Extract share data using the utility function
      const shareData = extractShareDataFromTeacherQueues(
        selectedDate,
        teacherQueues,
      );

      if (exportDebugMode) {
        // Debug mode - show text in dropdown instead of executing action
        let debugContent = "";

        switch (actionId) {
          case "share":
            debugContent = generateWhatsAppMessage(shareData);
            break;
          case "medical":
            const { subject, body } = generateMedicalEmail(
              selectedDate,
              teacherQueues,
            );
            debugContent = `Subject: ${subject}\n\nBody:\n${body}`;
            break;
          case "csv":
            const csvHeaders =
              "Time,Duration (hrs),Location,Teacher,Students,Package,Teacher Commission (€),School Revenue (€),Total Revenue (€)";
            const csvRows = shareData.events
              .map((event) => {
                const durationHrs = (event.duration / 60).toFixed(1);
                return `${event.startTime},${durationHrs}hrs,${event.location},${event.teacherName},"${event.studentNames.join(" & ")}",${event.packageDescription},${event.teacherEarning.toFixed(2)},${event.schoolRevenue.toFixed(2)},${event.totalRevenue.toFixed(2)}`;
              })
              .join("\n");
            debugContent = `${csvHeaders}\n${csvRows}`;
            break;
          case "xlsm":
            debugContent =
              "XLSM export would be generated with the same data as CSV but in Excel format";
            break;
          case "print":
            debugContent = generatePrintHTML(shareData);
            break;
          default:
            debugContent = `Unknown action: ${actionId}`;
        }

        setDebugText(debugContent);
        setShowDebugDropdown(true);
      } else {
        // Normal mode - execute actions
        switch (actionId) {
          case "share":
            const whatsappMessage = generateWhatsAppMessage(shareData);
            shareToWhatsApp(whatsappMessage);
            break;
          case "medical":
            const { subject, body } = generateMedicalEmail(
              selectedDate,
              teacherQueues,
            );
            sendMedicalEmail(subject, body);
            break;
          case "csv":
            const csvFilename = `tkh-billboard-${selectedDate}.csv`;
            exportBillboardEventsToCsv(shareData, csvFilename);
            break;
          case "xlsm":
            const xlsmFilename = `tkh-billboard-${selectedDate}.xls`;
            exportBillboardEventsToXlsm(shareData, xlsmFilename);
            break;
          case "print":
            const htmlContent = generatePrintHTML(shareData);
            printHTMLDocument(htmlContent);
            break;
          default:
            console.warn(`Unknown action: ${actionId}`);
        }
      }
    } catch (error) {
      console.error(`Error executing ${actionId} action:`, error);
    }
  };

  // Drag handlers
  const handleBookingDragStart = (bookingId: string) => {
    const booking = filteredBillboardClasses.find(
      (bc) => bc.booking.id === bookingId,
    );
    if (booking) {
      setDraggedBooking(booking);
    }
  };

  const handleBookingDragEnd = (bookingId: string, wasDropped: boolean) => {
    setDraggedBooking(null);
  };

  return (
    <div className="min-h-screen p-4">
      {/* Debug Dropdown */}
      {showDebugDropdown && (
        <div className="mb-4 p-4 bg-gray-100 border rounded">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">Export Debug Content:</h3>
            <button
              onClick={() => setShowDebugDropdown(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <textarea
            value={debugText}
            readOnly
            className="w-full h-64 p-2 border rounded font-mono text-sm"
            onClick={(e) => e.currentTarget.select()}
          />
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => navigator.clipboard.writeText(debugText)}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              Copy to Clipboard
            </button>
          </div>
        </div>
      )}

      {/* Header with date picker and controller */}
      <BillboardHeader
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
        controller={controller}
        onControllerChange={setController}
        globalStats={globalStats}
        teacherCount={teacherCount}
        studentCount={studentCount}
        onActionClick={handleActionClick}
        exportDebugMode={exportDebugMode}
        onExportDebugModeChange={setExportDebugMode}
        eventStatus={eventStatus}
      />

      {/* Main content - Teacher Column and Student Column */}
      <div className="grid grid-cols-4 gap-4">
        <TeacherColumnComplex
          teachers={data.teachers || []}
          teacherQueues={teacherQueues}
          controller={controller}
          selectedDate={selectedDate}
          draggedBooking={draggedBooking}
        />

        <StudentBookingColumn
          billboardClasses={filteredBillboardClasses}
          selectedDate={selectedDate}
          teachers={data.teachers || []}
          onBookingDragStart={handleBookingDragStart}
          onBookingDragEnd={handleBookingDragEnd}
        />
      </div>

      {/* Dev Component - JSON View */}
      {/* <BillboardDev bookingsData={data.bookings} /> */}
    </div>
  );
}
