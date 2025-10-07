"use client";

import { useEffect, useMemo, useState } from "react";
import { LOCATION_ENUM_VALUES } from "@/lib/constants";
import BillboardHeader from "./BillboardHeader";
import TeacherColumn from "./TeacherColumn";
import StudentBookingColumn from "./StudentBookingColumn";
import { BillboardClass } from "@/backend/BillboardClass";
import { type BillboardData } from "@/actions/billboard-actions";
import { type EventController } from "@/backend/types";
import { createTeacherQueuesFromBillboardClasses } from "@/backend/billboardUtils";
import {
  getTodayDateString,
  getStoredDate,
  setStoredDate,
} from "@/components/formatters/DateTime";
import {
  extractShareDataFromTeacherQueues,
  generateWhatsAppMessage,
  shareToWhatsApp,
  generateMedicalEmail,
  sendMedicalEmail,
  exportBillboardEventsToCsv,
  exportBillboardEventsToXlsm,
  generatePrintHTML,
  printHTMLDocument,
} from "@/backend/BillboardExportUtils";
import { useBillboardEventListener } from "@/lib/useBillboardEventListener";

const STORAGE_KEY = "billboard-selected-date";

// Debug Component
function DebugDropdown({
  showDebugDropdown,
  setShowDebugDropdown,
  debugText,
}: {
  showDebugDropdown: boolean;
  setShowDebugDropdown: (show: boolean) => void;
  debugText: string;
}) {
  if (!showDebugDropdown) return null;

  return (
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
      {debugText.includes('<table') ? (
        <div 
          className="w-full h-64 p-2 border rounded text-sm overflow-auto"
          dangerouslySetInnerHTML={{ __html: debugText }}
        />
      ) : (
        <textarea
          value={debugText}
          readOnly
          className="w-full h-64 p-2 border rounded font-mono text-sm"
          onClick={(e) => e.currentTarget.select()}
        />
      )}
      <div className="mt-2 flex gap-2">
        <button
          onClick={() => navigator.clipboard.writeText(debugText)}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
        >
          Copy to Clipboard
        </button>
      </div>
    </div>
  );
}

interface BillboardClientProps {
  data: BillboardData;
}

export default function BillboardClient({ data }: BillboardClientProps) {
  // Use real-time listener hook
  const { billboardData: realtimeBillboardData } = useBillboardEventListener({
    initialData: data,
  });

  // Core state
  const [selectedDate, setSelectedDate] = useState(() => getTodayDateString());
  const [draggedBooking, setDraggedBooking] = useState<BillboardClass | null>(
    null,
  );
  const [exportDebugMode, setExportDebugMode] = useState(true);
  const [debugText, setDebugText] = useState<string>("");
  const [showDebugDropdown, setShowDebugDropdown] = useState(false);
  const [lastDebugAction, setLastDebugAction] = useState<string>("");
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
    return realtimeBillboardData.bookings.map((booking) => new BillboardClass(booking));
  }, [realtimeBillboardData.bookings]);

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
      realtimeBillboardData.teachers || [],
      filteredBillboardClasses,
      selectedDate,
    );
  }, [realtimeBillboardData.teachers, filteredBillboardClasses, selectedDate]);

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
    const plannedIds: string[] = [];
    const tbcIds: string[] = [];

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
            plannedIds.push(eventId);
            break;
          case "completed":
            completed++;
            break;
          case "tbc":
            tbc++;
            incompleteIds.push(eventId);
            tbcIds.push(eventId);
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
      plannedIds,
      tbcIds,
    };
  }, [teacherQueues]);

  const bookingStats = useMemo(() => {
    return {
      totalBookings: filteredBillboardClasses.length,
      totalRevenue: globalStats.earnings.teacher + globalStats.earnings.school,
    };
  }, [filteredBillboardClasses.length, globalStats.earnings.teacher, globalStats.earnings.school]);

  // Update debug content when date changes (if debug dropdown is open)
  useEffect(() => {
    if (showDebugDropdown && lastDebugAction && exportDebugMode) {
      try {
        const shareData = extractShareDataFromTeacherQueues(
          selectedDate,
          teacherQueues,
        );

        let debugContent = "";

        switch (lastDebugAction) {
          case "share":
            debugContent = generateWhatsAppMessage(shareData);
            break;
          case "medical":
            const { subject, body } = generateMedicalEmail(
              selectedDate,
              teacherQueues,
            );
            debugContent = `${subject}\n\n${body}`;
            break;
          case "csv":
            const csvHeaders =
              "Time,Duration (hrs),Location,Teacher,Students,Package,Teacher Commission (€),School Revenue (€),Total Revenue (€)";
            const csvRows = shareData.events
              .map((event) => {
                const durationHrs = (event.duration / 60).toFixed(1);
                const formatCurrency = (num: number): string => {
                  const roundedNum = Math.round(num * 100) / 100;
                  return roundedNum % 1 === 0 ? roundedNum.toString() : roundedNum.toFixed(2);
                };
                return `${event.startTime},${durationHrs}hrs,${event.location},${event.teacherName},"${event.studentNames.join(" & ")}",${event.packageDescription},${formatCurrency(event.teacherEarning)},${formatCurrency(event.schoolRevenue)},${formatCurrency(event.totalRevenue)}`;
              })
              .join("\n");
            debugContent = `${csvHeaders}\n${csvRows}`;
            break;
          case "xlsm":
            const formatCurrency = (num: number): string => {
              const roundedNum = Math.round(num * 100) / 100;
              return roundedNum % 1 === 0 ? roundedNum.toString() : roundedNum.toFixed(2);
            };
            
            // Create HTML table for better visualization
            const tableHeaders = ["Time", "Duration", "Location", "Teacher", "Students", "Package", "Teacher €", "School €", "Total €"];
            const tableRows = shareData.events.map((event) => {
              const durationHrs = (event.duration / 60).toFixed(1);
              return [
                event.startTime,
                `${durationHrs}hrs`,
                event.location,
                event.teacherName,
                event.studentNames.join(" & "),
                event.packageDescription,
                formatCurrency(event.teacherEarning),
                formatCurrency(event.schoolRevenue),
                formatCurrency(event.totalRevenue)
              ];
            });
            
            const totalRow = [
              "", "", "", "", "",
              "** TOTAL **",
              formatCurrency(shareData.totalTeacherEarnings),
              formatCurrency(shareData.totalSchoolRevenue),
              formatCurrency(shareData.events.reduce((sum, event) => sum + event.totalRevenue, 0))
            ];
            
            debugContent = `
              <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; font-family: monospace; font-size: 12px;">
                <thead>
                  <tr style="background-color: #f5f5f5;">
                    ${tableHeaders.map(h => `<th>${h}</th>`).join('')}
                  </tr>
                </thead>
                <tbody>
                  ${tableRows.map(row => `
                    <tr>
                      ${row.map(cell => `<td>${cell}</td>`).join('')}
                    </tr>
                  `).join('')}
                  <tr style="background-color: #e8f4f8; font-weight: bold;">
                    ${totalRow.map(cell => `<td>${cell}</td>`).join('')}
                  </tr>
                </tbody>
              </table>
            `;
            break;
          case "print":
            debugContent = generatePrintHTML(shareData);
            break;
          default:
            debugContent = `Unknown action: ${lastDebugAction}`;
        }

        setDebugText(debugContent);
      } catch (error) {
        console.error(`Error updating debug content for ${lastDebugAction}:`, error);
      }
    }
  }, [selectedDate, teacherQueues, showDebugDropdown, lastDebugAction, exportDebugMode]);

  // Close debug dropdown when debug mode is turned off
  useEffect(() => {
    if (!exportDebugMode && showDebugDropdown) {
      setShowDebugDropdown(false);
    }
  }, [exportDebugMode, showDebugDropdown]);

  const handleActionClick = async (actionId: string) => {
    try {
      // Handle nowind action separately since it doesn't need share data
      if (actionId === "nowind") {
        if (eventStatus.allIds.length === 0) {
          console.warn("No events to delete");
          return;
        }
        try {
          const { deleteEvent } = await import("@/actions/event-actions");
          for (const eventId of eventStatus.allIds) {
            await deleteEvent(eventId);
          }
          console.log(`✅ Deleted ${eventStatus.allIds.length} events due to NO WIND`);
        } catch (error) {
          console.error("❌ Error deleting events:", error);
        }
        return;
      }

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
            debugContent = `${subject}\n\n${body}`;
            break;
          case "csv":
            const csvHeaders =
              "Time,Duration (hrs),Location,Teacher,Students,Package,Teacher Commission (€),School Revenue (€),Total Revenue (€)";
            const csvRows = shareData.events
              .map((event) => {
                const durationHrs = (event.duration / 60).toFixed(1);
                const formatCurrency = (num: number): string => {
                  const roundedNum = Math.round(num * 100) / 100;
                  return roundedNum % 1 === 0 ? roundedNum.toString() : roundedNum.toFixed(2);
                };
                return `${event.startTime},${durationHrs}hrs,${event.location},${event.teacherName},"${event.studentNames.join(" & ")}",${event.packageDescription},${formatCurrency(event.teacherEarning)},${formatCurrency(event.schoolRevenue)},${formatCurrency(event.totalRevenue)}`;
              })
              .join("\n");
            debugContent = `${csvHeaders}\n${csvRows}`;
            break;
          case "xlsm":
            const formatCurrency = (num: number): string => {
              const roundedNum = Math.round(num * 100) / 100;
              return roundedNum % 1 === 0 ? roundedNum.toString() : roundedNum.toFixed(2);
            };
            
            // Create HTML table for better visualization
            const tableHeaders = ["Time", "Duration", "Location", "Teacher", "Students", "Package", "Teacher €", "School €", "Total €"];
            const tableRows = shareData.events.map((event) => {
              const durationHrs = (event.duration / 60).toFixed(1);
              return [
                event.startTime,
                `${durationHrs}hrs`,
                event.location,
                event.teacherName,
                event.studentNames.join(" & "),
                event.packageDescription,
                formatCurrency(event.teacherEarning),
                formatCurrency(event.schoolRevenue),
                formatCurrency(event.totalRevenue)
              ];
            });
            
            const totalRow = [
              "", "", "", "", "",
              "** TOTAL **",
              formatCurrency(shareData.totalTeacherEarnings),
              formatCurrency(shareData.totalSchoolRevenue),
              formatCurrency(shareData.events.reduce((sum, event) => sum + event.totalRevenue, 0))
            ];
            
            debugContent = `
              <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; font-family: monospace; font-size: 12px;">
                <thead>
                  <tr style="background-color: #f5f5f5;">
                    ${tableHeaders.map(h => `<th>${h}</th>`).join('')}
                  </tr>
                </thead>
                <tbody>
                  ${tableRows.map(row => `
                    <tr>
                      ${row.map(cell => `<td>${cell}</td>`).join('')}
                    </tr>
                  `).join('')}
                  <tr style="background-color: #e8f4f8; font-weight: bold;">
                    ${totalRow.map(cell => `<td>${cell}</td>`).join('')}
                  </tr>
                </tbody>
              </table>
            `;
            break;
          case "print":
            debugContent = generatePrintHTML(shareData);
            break;
          default:
            debugContent = `Unknown action: ${actionId}`;
        }

        setDebugText(debugContent);
        setLastDebugAction(actionId);
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
            const xlsmFilename = `tkh-billboard-excel-${selectedDate}.csv`;
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

  const handleBookingDragEnd = () => {
    setDraggedBooking(null);
  };

  return (
    <div className="min-h-screen p-4">
      <DebugDropdown
        showDebugDropdown={showDebugDropdown}
        setShowDebugDropdown={setShowDebugDropdown}
        debugText={debugText}
      />

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
        bookingStats={bookingStats}
      />

      <div className="grid grid-cols-4 gap-4">
        <TeacherColumn
          teachers={realtimeBillboardData.teachers || []}
          teacherQueues={teacherQueues}
          controller={controller}
          selectedDate={selectedDate}
          draggedBooking={draggedBooking}
        />

        <StudentBookingColumn
          billboardClasses={filteredBillboardClasses}
          selectedDate={selectedDate}
          teachers={realtimeBillboardData.teachers || []}
          onBookingDragStart={handleBookingDragStart}
          onBookingDragEnd={handleBookingDragEnd}
        />
      </div>
    </div>
  );
}
