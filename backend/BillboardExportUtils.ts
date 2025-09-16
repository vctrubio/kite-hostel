"use client";

import { format } from "date-fns";
import { TeacherQueue } from "@/backend/TeacherQueue";

export interface BillboardEventData {
  startTime: string;
  duration: number;
  location: string;
  teacherName: string;
  studentNames: string[];
  packageDescription: string;
  teacherEarning: number;
  schoolRevenue: number;
  totalRevenue: number;
}

export interface BillboardShareData {
  date: string;
  events: BillboardEventData[];
  totalEvents: number;
  totalStudents: number;
  totalTeacherEarnings: number;
  totalSchoolRevenue: number;
}

export function exportBillboardEventsToCsv(
  shareData: BillboardShareData,
  fileName: string = 'billboard-events.csv'
) {
  if (!shareData.events || shareData.events.length === 0) {
    alert("No events to export");
    return;
  }

  const headers = [
    { label: "Time", key: "startTime" },
    { label: "Duration (hrs)", key: "duration" },
    { label: "Location", key: "location" },
    { label: "Teacher", key: "teacherName" },
    { label: "Students", key: "studentNames" },
    { label: "Package", key: "packageDescription" },
    { label: "Teacher Commission (€)", key: "teacherEarning" },
    { label: "School Revenue (€)", key: "schoolRevenue" },
    { label: "Total Revenue (€)", key: "totalRevenue" },
  ];

  const formatCurrency = (num: number): string => {
    const roundedNum = Math.round(num * 100) / 100;
    return roundedNum % 1 === 0 ? roundedNum.toString() : roundedNum.toFixed(2);
  };

  const csvData = shareData.events.map(event => {
    const durationInHours = (event.duration / 60).toFixed(1);

    return {
      startTime: event.startTime,
      duration: `${durationInHours}hrs`,
      location: event.location,
      teacherName: event.teacherName,
      studentNames: event.studentNames.join(" & "),
      packageDescription: event.packageDescription,
      teacherEarning: formatCurrency(event.teacherEarning),
      schoolRevenue: formatCurrency(event.schoolRevenue),
      totalRevenue: formatCurrency(event.totalRevenue),
    };
  });

  const csvContent = [
    headers.map(h => h.label).join(','),
    ...csvData.map(row => 
      headers.map(h => `"${row[h.key as keyof typeof row] || ''}"`).join(',')
    ),
    // Add totals row
    [
      '""', '""', '""', '""', '""',
      '"** TOTAL **"',
      `"${formatCurrency(shareData.totalTeacherEarnings)}"`,
      `"${formatCurrency(shareData.totalSchoolRevenue)}"`
    ].join(',')
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
}

export function exportBillboardEventsToXlsm(
  shareData: BillboardShareData,
  fileName: string = 'billboard-events.csv'  // Use .csv extension instead
) {
  if (!shareData.events || shareData.events.length === 0) {
    alert("No events to export");
    return;
  }

  const headers = [
    "Time",
    "Duration (hrs)",
    "Location", 
    "Teacher",
    "Students",
    "Package",
    "Teacher Commission (€)",
    "School Revenue (€)",
    "Total Revenue (€)"
  ];

  const formatCurrency = (num: number): string => {
    const roundedNum = Math.round(num * 100) / 100;
    return roundedNum % 1 === 0 ? roundedNum.toString() : roundedNum.toFixed(2);
  };

  // Create proper CSV content that Excel can open
  const csvContent = [
    headers.join(','),
    ...shareData.events.map(event => {
      const durationInHours = (event.duration / 60).toFixed(1);
      return [
        event.startTime,
        `${durationInHours}hrs`,
        `"${event.location}"`,
        `"${event.teacherName}"`,
        `"${event.studentNames.join(" & ")}"`,
        `"${event.packageDescription}"`,
        formatCurrency(event.teacherEarning),
        formatCurrency(event.schoolRevenue),
        formatCurrency(event.totalRevenue)
      ].join(',');
    }),
    // Add totals row
    [
      '""', '""', '""', '""', '""',
      '"** TOTAL **"',
      formatCurrency(shareData.totalTeacherEarnings),
      formatCurrency(shareData.totalSchoolRevenue),
      formatCurrency(shareData.events.reduce((sum, event) => sum + event.totalRevenue, 0))
    ].join(',')
  ].join('\n');

  // Use proper CSV MIME type
  const blob = new Blob([csvContent], { 
    type: 'text/csv;charset=utf-8;'
  });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
}

export function generateWhatsAppMessage(shareData: BillboardShareData): string {
  const dateFormatted = format(new Date(shareData.date), "MMMM do, yyyy");

  let message = `*${dateFormatted} - Tarifa Kite Hostel Lesson Schedule*\n\n`;

  if (shareData.events.length === 0) {
    message += "No lessons scheduled for today.\n";
    return message;
  }

  // Group events by teacher
  const eventsByTeacher = new Map<string, BillboardEventData[]>();
  shareData.events.forEach((event) => {
    const teacherName = event.teacherName;
    if (!eventsByTeacher.has(teacherName)) {
      eventsByTeacher.set(teacherName, []);
    }
    eventsByTeacher.get(teacherName)!.push(event);
  });

  // Sort teachers alphabetically
  const sortedTeachers = Array.from(eventsByTeacher.keys()).sort();

  sortedTeachers.forEach((teacherName, index) => {
    const teacherEvents = eventsByTeacher.get(teacherName)!;

    message += `*${teacherName}*\n`;

    // Sort events by start time
    teacherEvents.sort((a, b) => a.startTime.localeCompare(b.startTime));

    teacherEvents.forEach((event) => {
      const durationHours = Math.floor(event.duration / 60);
      const durationMinutes = event.duration % 60;
      let durationText = "";

      if (durationHours > 0 && durationMinutes > 0) {
        durationText = `${durationHours}h${durationMinutes}m`;
      } else if (durationHours > 0) {
        durationText = `${durationHours}hrs`;
      } else {
        durationText = `${durationMinutes}m`;
      }

      message += `- ${event.startTime} - ${durationText} (${event.location}) - ${event.studentNames.join(", ")}\n`;
    });

    // Add spacing between teachers (but not after the last one)
    if (index < sortedTeachers.length - 1) {
      message += "\n";
    }
  });

  return message;
}

export function generateMedicalEmail(
  selectedDate: string,
  teacherQueues: import("@/backend/TeacherQueue").TeacherQueue[]
): {
  subject: string;
  body: string;
} {
  const dateFormatted = format(new Date(selectedDate), "MMMM do, yyyy");
  
  // Extract unique students with detailed information
  const studentMap = new Map<string, {
    fullName: string;
    passportNumber?: string;
    country?: string;
  }>();

  teacherQueues.forEach((queue) => {
    queue.getAllEvents().forEach((eventNode) => {
      if (eventNode.billboardClass.booking.students) {
        eventNode.billboardClass.booking.students.forEach((bookingStudent: any) => {
          if (bookingStudent.student) {
            const student = bookingStudent.student;
            const firstName = student.name || student.first_name || "";
            const lastName = student.last_name || "";
            const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();
            
            if (fullName && !studentMap.has(fullName)) {
              studentMap.set(fullName, {
                fullName: fullName,
                passportNumber: student.passport_number || student.passport,
                country: student.country || student.nationality,
              });
            }
          }
        });
      }
    });
  });

  const students = Array.from(studentMap.values()).sort((a, b) => 
    a.fullName.localeCompare(b.fullName)
  );

  const subject = `Tarifa Kite Hostel Students @ ${dateFormatted}`;

  let body = '';

  if (students.length === 0) {
    body += "No students scheduled for today.\n";
  } else {
    students.forEach((student) => {
      body += student.fullName;
      if (student.passportNumber) {
        body += ` - ${student.passportNumber}`;
      }
      if (student.country) {
        body += ` - ${student.country}`;
      }
      body += "\n";
    });
  }

  body += "\nTotal students: " + students.length;

  return { subject, body };
}

export function shareToWhatsApp(message: string): void {
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, "_blank");
}

export function sendMedicalEmail(subject: string, body: string): void {
  const mailto = `mailto:helloworld@me.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailto;
}

export function generatePrintHTML(shareData: BillboardShareData): string {
  const dateFormatted = format(
    new Date(shareData.date),
    "EEEE, MMMM do, yyyy",
  );

  if (shareData.events.length === 0) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Tarifa Kite Hostel - Lesson Schedule</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 20px; color: #1f2937; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; }
            .title { font-size: 24px; font-weight: bold; color: #1e40af; margin-bottom: 5px; }
            .subtitle { font-size: 18px; color: #6b7280; }
            .no-lessons { text-align: center; padding: 40px; color: #6b7280; font-size: 16px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">Tarifa Kite Hostel - Lesson Schedule</div>
            <div class="subtitle">${dateFormatted}</div>
          </div>
          <div class="no-lessons">
            <p>No lessons scheduled for this date.</p>
          </div>
        </body>
      </html>
    `;
  }

  // Group events by teacher
  const eventsByTeacher = new Map<string, BillboardEventData[]>();
  shareData.events.forEach((event) => {
    if (!eventsByTeacher.has(event.teacherName)) {
      eventsByTeacher.set(event.teacherName, []);
    }
    eventsByTeacher.get(event.teacherName)!.push(event);
  });

  const sortedTeachers = Array.from(eventsByTeacher.keys()).sort();
  let eventsHTML = "";

  sortedTeachers.forEach((teacherName, teacherIndex) => {
    const teacherEvents = eventsByTeacher.get(teacherName)!;

    eventsHTML += `
      <div class="teacher-section">
        <h2 class="teacher-name">${teacherName}</h2>
        <div class="events-grid">
    `;

    teacherEvents.sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

    teacherEvents.forEach((event) => {
      const durationHours = Math.floor(event.duration / 60);
      const durationMinutes = event.duration % 60;
      let durationText = "";

      if (durationHours > 0 && durationMinutes > 0) {
        durationText = `${durationHours}h ${durationMinutes}m`;
      } else if (durationHours > 0) {
        durationText = `${durationHours}h`;
      } else {
        durationText = `${durationMinutes}m`;
      }

      eventsHTML += `
        <div class="event-card">
          <div class="students-section">
            <div class="student-names">${event.studentNames.join(", ")}</div>
          </div>
          <div class="event-details">
            <div class="time-info">
              <span class="time">${event.startTime}</span>
              <span class="duration">${durationText}</span>
            </div>
            <div class="location-info">
              <span class="location">${event.location}</span>
            </div>
          </div>
        </div>
      `;
    });

    eventsHTML += `
        </div>
      </div>
    `;

    if (teacherIndex < sortedTeachers.length - 1) {
      eventsHTML += '<div class="teacher-separator"></div>';
    }
  });

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Tarifa Kite Hostel - Lesson Schedule</title>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 15px; 
            color: #1f2937; 
            line-height: 1.2;
            font-size: 12px;
          }
          .header { 
            text-align: center; 
            margin-bottom: 20px; 
            border-bottom: 2px solid #3b82f6; 
            padding-bottom: 15px; 
          }
          .title { 
            font-size: 20px; 
            font-weight: bold; 
            color: #1e40af; 
            margin-bottom: 5px; 
          }
          .subtitle { 
            font-size: 16px; 
            color: #6b7280; 
          }
          .teacher-section { 
            margin-bottom: 20px; 
          }
          .teacher-name { 
            font-size: 16px; 
            font-weight: bold; 
            color: #059669; 
            margin-bottom: 10px; 
            padding-bottom: 5px; 
            border-bottom: 1px solid #d1d5db; 
          }
          .events-grid { 
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 10px; 
          }
          .event-card { 
            background: #f9fafb; 
            border: 1px solid #d1d5db; 
            border-radius: 4px; 
            padding: 8px; 
            break-inside: avoid; 
            page-break-inside: avoid;
          }
          .students-section { 
            margin-bottom: 6px; 
            padding-bottom: 6px; 
            border-bottom: 1px solid #e5e7eb; 
          }
          .student-names { 
            font-weight: 600; 
            font-size: 12px; 
            color: #111827; 
          }
          .event-details { 
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px; 
          }
          .time-info, .location-info { 
            display: flex; 
            align-items: center; 
            gap: 4px; 
          }
          .time { 
            font-weight: 600; 
            font-size: 11px; 
          }
          .duration { 
            background: #e5e7eb; 
            color: #374151; 
            padding: 1px 6px; 
            border-radius: 8px; 
            font-size: 10px; 
            font-weight: 600; 
          }
          .location { 
            font-weight: 500; 
            font-size: 11px; 
          }
          .teacher-separator { 
            height: 15px; 
          }
          @media print { 
            body { margin: 10px; font-size: 10px; } 
            .event-card { break-inside: avoid; page-break-inside: avoid; }
            .teacher-section { break-inside: avoid; page-break-inside: avoid; }
            .events-grid { grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 8px; }
            @page { 
              size: A4 landscape; 
              margin: 0.5cm; 
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">Tarifa Kite Hostel - Lesson Schedule</div>
          <div class="subtitle">${dateFormatted}</div>
        </div>
        ${eventsHTML}
      </body>
    </html>
  `;
}

export function printHTMLDocument(htmlContent: string): void {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  printWindow.document.write(htmlContent);
  printWindow.document.close();

  printWindow.onload = () => {
    printWindow.print();
  };
}

export function extractShareDataFromTeacherQueues(
  selectedDate: string,
  teacherQueues: TeacherQueue[]
): BillboardShareData {
  const events: BillboardEventData[] = [];
  let totalStudents = 0;
  let totalTeacherEarnings = 0;
  let totalSchoolRevenue = 0;

  teacherQueues.forEach((queue) => {
    const teacherName = queue.teacher.name;
    const teacherStats = queue.getTeacherStats();
    
    queue.getAllEvents().forEach((eventNode) => {
      // Get student names from booking
      if (!eventNode.billboardClass.booking.students) {
        throw new Error(`No students found for event ${eventNode.id}`);
      }
      
      const studentNames = eventNode.billboardClass.booking.students.map(
        (bookingStudent: any) => {
          if (!bookingStudent.student) {
            throw new Error(`Student data missing for booking ${eventNode.billboardClass.booking.id}`);
          }
          return bookingStudent.student.name || bookingStudent.student.first_name;
        }
      );
      
      totalStudents += studentNames.length;
      
      // Calculate per-event values correctly
      const eventDurationHours = eventNode.eventData.duration / 60;
      
      // Calculate total revenue first
      let eventTotalRevenue = 0;
      const eventPkg = eventNode.billboardClass?.booking.package;
      if (eventPkg?.price_per_student && eventPkg?.duration) {
        const packageHours = eventPkg.duration / 60;
        const pricePerHourPerStudent = eventPkg.price_per_student / packageHours;
        // Use actual number of students attending this event
        eventTotalRevenue = pricePerHourPerStudent * studentNames.length * eventDurationHours;
      }

      // Teacher earning: Use the average for now (this comes from commission rate * hours)
      const eventTeacherEarning = teacherStats.eventCount > 0 
        ? (teacherStats.earnings.teacher / teacherStats.eventCount) 
        : 0;

      // School revenue = Total revenue - Teacher earning
      const eventSchoolRevenue = Math.max(0, eventTotalRevenue - eventTeacherEarning);
      
      totalTeacherEarnings += eventTeacherEarning;
      totalSchoolRevenue += eventSchoolRevenue;

      // Get proper start time from TeacherQueue method
      const startTime = queue.getStartTime(eventNode);
      if (!startTime) {
        throw new Error(`No start time found for event ${eventNode.id}`);
      }

      if (!eventNode.eventData.duration) {
        throw new Error(`No duration found for event ${eventNode.id}`);
      }

      if (!eventNode.eventData.location) {
        throw new Error(`No location found for event ${eventNode.id}`);
      }

      if (!eventNode.billboardClass.booking.package?.description) {
        throw new Error(`No package description found for booking ${eventNode.billboardClass.booking.id}`);
      }

      // Use the total revenue we already calculated above
      const totalRevenue = eventTotalRevenue;

      events.push({
        teacherName,
        startTime,
        duration: eventNode.eventData.duration,
        studentNames,
        location: eventNode.eventData.location,
        packageDescription: eventNode.billboardClass.booking.package.description,
        teacherEarning: eventTeacherEarning,
        schoolRevenue: eventSchoolRevenue,
        totalRevenue: totalRevenue,
      });
    });
  });

  // Sort events by time
  events.sort((a, b) => a.startTime.localeCompare(b.startTime));

  return {
    date: selectedDate,
    events,
    totalEvents: events.length,
    totalStudents,
    totalTeacherEarnings,
    totalSchoolRevenue,
  };
}