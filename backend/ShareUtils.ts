import { TeacherSchedule } from "./TeacherSchedule";
import { format } from "date-fns";

export interface StudentInfo {
  name: string;
  passport?: string;
  nationality?: string;
}

export interface EventShareData {
  teacherName: string;
  startTime: string;
  duration: number;
  studentNames: string[];
  location: string;
  date: string;
  teacherEarning: number;
  schoolRevenue: number;
  packageDescription: string;
}

export interface ShareData {
  date: string;
  events: EventShareData[];
  totalEvents: number;
  totalStudents: number;
  totalTeacherEarnings: number;
  totalSchoolRevenue: number;
}

export class ShareUtils {
  /**
   * Extract share data from teacher schedules
   */
  static extractShareData(
    selectedDate: string,
    teacherSchedules: Map<string, TeacherSchedule>,
    events: any[],
  ): ShareData {
    const shareEvents: EventShareData[] = [];
    let totalStudents = 0;
    let totalTeacherEarnings = 0;
    let totalSchoolRevenue = 0;

    // Process each teacher schedule
    teacherSchedules.forEach((schedule, teacherId) => {
      const scheduleNodes = schedule.getNodes();
      const eventNodes = scheduleNodes.filter((node) => node.type === "event");

      eventNodes.forEach((node) => {
        // Find corresponding event data
        const eventData = events.find(
          (e) => e.lesson?.id === node.eventData?.lessonId,
        );

        if (eventData) {
          const studentNames = this.extractStudentNames(eventData);
          totalStudents += studentNames.length;

          const { earning, revenue, packageDescription } =
            schedule.getEventStats(eventData);
          totalTeacherEarnings += earning;
          totalSchoolRevenue += revenue;

          shareEvents.push({
            teacherName: schedule.getSchedule().teacherName,
            startTime: node.startTime,
            duration: node.duration,
            studentNames,
            location: eventData.location || "N/A",
            date: eventData.date,
            teacherEarning: earning,
            schoolRevenue: revenue,
            packageDescription: packageDescription,
          });
        }
      });
    });

    // Sort events by time
    shareEvents.sort((a, b) => a.startTime.localeCompare(b.startTime));

    return {
      date: selectedDate,
      events: shareEvents,
      totalEvents: shareEvents.length,
      totalStudents,
      totalTeacherEarnings,
      totalSchoolRevenue,
    };
  }

  /**
   * Extract student names from event data
   */
  private static extractStudentNames(eventData: any): string[] {
    if (!eventData.booking?.students) return [];

    return eventData.booking.students.map(
      (bookingStudent: any) =>
        bookingStudent.student?.name ||
        bookingStudent.student?.first_name ||
        "N/A",
    );
  }

  /**
   * Extract detailed student information for medical purposes
   */
  static extractStudentInfo(events: any[]): StudentInfo[] {
    const studentMap = new Map<string, StudentInfo>();

    events.forEach((event) => {
      if (event.booking?.students) {
        event.booking.students.forEach((bookingStudent: any) => {
          const student = bookingStudent.student;
          if (student) {
            const name = student.name || student.first_name || "Unknown";
            if (!studentMap.has(name)) {
              studentMap.set(name, {
                name,
                passport: student.passport_number || student.passport,
                nationality: student.nationality,
              });
            }
          }
        });
      }
    });

    return Array.from(studentMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }

  /**
   * Generate WhatsApp share message
   */
  static generateWhatsAppMessage(shareData: ShareData): string {
    const dateFormatted = format(new Date(shareData.date), "MMMM do, yyyy");

    let message = `*${dateFormatted} - Tarifa Kite Hostel Lesson Schedule*\n\n`;

    if (shareData.events.length === 0) {
      message += "No lessons scheduled for today.\n";
      return message;
    }

    // Group events by teacher
    const eventsByTeacher = new Map<string, typeof shareData.events>();
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

      message += `*Teacher: ${teacherName}*\n`;

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

  /**
   * Generate medical email content
   */
  static generateMedicalEmail(
    selectedDate: string,
    events: any[],
  ): {
    subject: string;
    body: string;
  } {
    const studentInfo = this.extractStudentInfo(events);
    const dateFormatted = format(new Date(selectedDate), "MMMM do, yyyy");

    const subject = `Tarifa Kite Hostel Students @ ${dateFormatted}`;

    let body = `Dear Medical Team,\n\n`;
    body += `Please find below the list of students participating in kitesurfing lessons on ${dateFormatted}:\n\n`;

    if (studentInfo.length === 0) {
      body += "No students scheduled for today.\n";
    } else {
      studentInfo.forEach((student, index) => {
        body += `${index + 1}. ${student.name}`;
        if (student.passport) {
          body += ` - Passport: ${student.passport}`;
        }
        if (student.nationality) {
          body += ` - Nationality: ${student.nationality}`;
        }
        body += "\n";
      });
    }

    body += "\nTotal students: " + studentInfo.length + "\n\n";
    body += "Please ensure all medical protocols are in place.\n\n";
    body += "Best regards,\n";
    body += "Tarifa Kite Hostel Team";

    return { subject, body };
  }

  /**
   * Generate CSV data
   */
  static generateCSVData(shareData: ShareData): string {
    const headers = [
      "Time",
      "Duration",
      "Location",
      "Teacher",
      "Students",
      "Package",
      "Teacher Commission",
      "School Revenue",
    ];
    const rows = [headers.join(",")];

    const formatCurrency = (num: number): string => {
      // Round to 2 decimal places to handle floating point inaccuracies
      const roundedNum = Math.round(num * 100) / 100;
      // Check if it's a whole number
      if (roundedNum % 1 === 0) {
        return roundedNum.toString();
      }
      // Otherwise, return with 2 decimal places
      return roundedNum.toFixed(2);
    };

    shareData.events.forEach((event) => {
      const durationInHours = event.duration / 60;
      const durationFormatted = `${durationInHours}hrs`;

      const teacherEarningFormatted = formatCurrency(event.teacherEarning);
      const schoolRevenueFormatted = formatCurrency(event.schoolRevenue);

      const row = [
        event.startTime,
        durationFormatted,
        `"${event.location}"`,
        `"${event.teacherName}"`,
        `"${event.studentNames.join(", ")}"`,
        `"${event.packageDescription}"`,
        teacherEarningFormatted,
        schoolRevenueFormatted,
      ];
      rows.push(row.join(","));
    });

    const totalTeacherEarningsFormatted = formatCurrency(
      shareData.totalTeacherEarnings,
    );
    const totalSchoolRevenueFormatted = formatCurrency(
      shareData.totalSchoolRevenue,
    );

    rows.push(
      [
        "",
        "",
        "",
        "",
        "",
        "** TOTAL **",
        totalTeacherEarningsFormatted,
        totalSchoolRevenueFormatted,
      ].join(","),
    );

    return rows.join("\n");
  }

  /**
   * Generate print document data with card-based layout
   */
  static generatePrintDocumentData(shareData: ShareData): {
    title: string;
    subtitle: string;
    events: EventShareData[];
    summary: string;
    htmlContent: string;
  } {
    const dateFormatted = format(
      new Date(shareData.date),
      "EEEE, MMMM do, yyyy",
    );

    const htmlContent = this.generatePrintHTML(shareData, dateFormatted);

    return {
      title: `Tarifa Kite Hostel - Lesson Schedule`,
      subtitle: dateFormatted,
      events: shareData.events,
      summary: `Total: ${shareData.totalEvents} lessons, ${shareData.totalStudents} students`,
      htmlContent,
    };
  }

  /**
   * Generate HTML content for printing with card-based layout optimized for landscape
   */
  private static generatePrintHTML(
    shareData: ShareData,
    dateFormatted: string,
  ): string {
    if (shareData.events.length === 0) {
      return `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Tarifa Kite Hostel - Lesson Schedule</title>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 20px; color: #1f2937; }
              .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; }
              .logo { width: 60px; height: 60px; margin: 0 auto 15px; }
              .title { font-size: 24px; font-weight: bold; color: #1e40af; margin-bottom: 5px; }
              .subtitle { font-size: 18px; color: #6b7280; }
              .no-lessons { text-align: center; padding: 40px; color: #6b7280; font-size: 16px; }
              @media print { body { margin: 0; } .logo { width: 50px; height: 50px; } }
            </style>
          </head>
          <body>
            <div class="header">
              <img src="/logo-tkh.png" alt="Tarifa Kite Hostel Logo" class="logo" />
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

    // Group events by teacher for better organization
    const eventsByTeacher = new Map<string, EventShareData[]>();
    shareData.events.forEach((event) => {
      if (!eventsByTeacher.has(event.teacherName)) {
        eventsByTeacher.set(event.teacherName, []);
      }
      eventsByTeacher.get(event.teacherName)!.push(event);
    });

    // Sort teachers alphabetically
    const sortedTeachers = Array.from(eventsByTeacher.keys()).sort();

    let eventsHTML = "";

    sortedTeachers.forEach((teacherName, teacherIndex) => {
      const teacherEvents = eventsByTeacher.get(teacherName)!;

      // Teacher section header
      eventsHTML += `
        <div class="teacher-section">
          <h2 class="teacher-name">
            <svg viewBox="0 0 24 24" fill="none" style="width: 36px; height: 24px; display: inline-block; vertical-align: middle;">
              <path d="M6 10H6.75C7.44036 10 8 10.5596 8 11.25V14.75C8 15.4404 7.44036 16 6.75 16H6C4.34315 16 3 14.6569 3 13C3 11.3431 4.34315 10 6 10ZM6 10V9C6 5.68629 8.68629 3 12 3C15.3137 3 18 5.68629 18 9V10M18 10H17.25C16.5596 10 16 10.5596 16 11.25V14.75C16 15.4404 16.5596 16 17.25 16H18M18 10C19.6569 10 21 11.3431 21 13C21 14.6569 19.6569 16 18 16M18 16L17.3787 18.4851C17.1561 19.3754 16.3562 20 15.4384 20H13" stroke="#65a30d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            ${teacherName}
          </h2>
          <div class="events-grid">
      `;

      // Sort events by start time
      teacherEvents.sort((a, b) => a.startTime.localeCompare(b.startTime));

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
                <span class="icon">🕐</span>
                <span class="time">${event.startTime}</span>
                <span class="duration">${durationText}</span>
              </div>
              <div class="location-info">
                <span class="icon">📍</span>
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

      // Add spacing between teachers (but not after the last one)
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
            .logo { 
              width: 60px; 
              height: 60px; 
              margin: 0 auto 15px; 
              display: block;
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
            .icon { 
              font-size: 11px; 
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
              .logo { width: 50px; height: 50px; margin-bottom: 10px; } 
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
            <img src="/logo-tkh.png" alt="Tarifa Kite Hostel Logo" class="logo" />
            <div class="title">Tarifa Kite Hostel - Lesson Schedule</div>
            <div class="subtitle">${dateFormatted}</div>
          </div>
          ${eventsHTML}
        </body>
      </html>
    `;
  }

  /**
   * Share via WhatsApp Web API
   */
  static shareToWhatsApp(message: string): void {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  }

  /**
   * Open mailto link for medical email
   */
  static sendMedicalEmail(subject: string, body: string): void {
    const mailto = `mailto:helloworld@me.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  }

  /**
   * Download CSV file
   */
  static downloadCSV(csvData: string, filename: string): void {
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  /**
   * Generate and download PDF or open print dialog - optimized for landscape
   */
  static async downloadPrintTable(shareData: ShareData): Promise<void> {
    try {
      const printData = this.generatePrintDocumentData(shareData);
      this.printHTMLDocument(printData.htmlContent);
    } catch (error) {
      console.error("Failed to generate print document:", error);
      throw error;
    }
  }

  /**
   * Print HTML document using browser's print functionality
   */
  private static printHTMLDocument(htmlContent: string): void {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Auto-trigger print dialog
    printWindow.onload = () => {
      printWindow.print();
    };
  }
}
