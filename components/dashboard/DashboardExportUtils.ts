export function exportEventsToCsv(data: any[], fileName: string = 'events.csv') {
  if (!data || data.length === 0) {
    alert("No data to export");
    return;
  }

  const headers = [
    { label: "Date", key: "date" },
    { label: "Start Time", key: "startTime" },
    { label: "Duration (h)", key: "duration" },
    { label: "Location", key: "location" },
    { label: "Teacher", key: "teacher" },
    { label: "Students", key: "students" },
    { label: "Kite", key: "kite" },
    { label: "Price/Hour/Student (€)", key: "pricePerHourPerStudent" },
    { label: "Commission/Hour (€)", key: "commissionPerHour" },
  ];

  const csvData = data.map(event => {
      const eventDate = event.date ? new Date(event.date) : null;
      const durationInHours = event.duration ? event.duration / 60 : 0;
      const packageHours = event.package?.duration ? event.package.duration / 60 : 0;
      const pricePerHour = packageHours > 0 && event.package?.price_per_student ? event.package.price_per_student / packageHours : 0;
      const studentNames = event.students?.map((s: any) => `${s.name} ${s.last_name || ''}`.trim()).join(', ') || '';
      const kiteInfo = event.kite ? `${event.kite.model} ${event.kite.size}m` : '';

      return {
          date: eventDate ? eventDate.toLocaleDateString() : '',
          startTime: eventDate ? eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
          duration: durationInHours.toFixed(2),
          location: event.location || '',
          teacher: event.teacher?.name || '',
          students: studentNames,
          kite: kiteInfo,
          pricePerHourPerStudent: pricePerHour.toFixed(2),
          commissionPerHour: event.commission_per_hour || 0,
      };
  });
  
  const csvContent = [
    headers.map(h => h.label).join(','),
    ...csvData.map(row => headers.map(h => `"${row[h.key as keyof typeof row] || ''}"`).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
}

export function exportStudentsToCsv(data: any[], fileName: string = 'students.csv') {
  if (!data || data.length === 0) {
    alert("No data to export");
    return;
  }

  const headers = [
    { label: "First Name", key: "name" },
    { label: "Last Name", key: "last_name" },
    { label: "Country", key: "country" },
    { label: "Phone", key: "phone" },
    { label: "Passport", key: "passport_number" },
    { label: "Bookings", key: "bookingCount" },
    { label: "Kiting Hours", key: "kitingHours" },
  ];

  const csvData = data.map(student => {
      const totalMinutes = student.bookings?.reduce((total: number, booking: any) => {
          const bookingMinutes = booking.lessons?.reduce((lessonTotal: number, lesson: any) => {
              const lessonMinutes = lesson.events?.reduce((eventTotal: number, event: any) => {
                  return eventTotal + (event.duration || 0);
              }, 0) || 0;
              return lessonTotal + lessonMinutes;
          }, 0) || 0;
          return total + bookingMinutes;
      }, 0) || 0;
      const kitingHours = totalMinutes / 60;

      return {
          name: student.name || '',
          last_name: student.last_name || '',
          country: student.country || '',
          phone: student.phone || '',
          passport_number: student.passport_number || '',
          bookingCount: student.bookings?.length || 0,
          kitingHours: parseFloat(kitingHours.toFixed(2)),
      };
  });
  
  const csvContent = [
    headers.map(h => h.label).join(','),
    ...csvData.map(row => {
        return headers.map(h => {
            const key = h.key as keyof typeof row;
            const value = row[key];

            if (key === 'phone' && value) {
                return `="${value}"`;
            }
            
            return `"${value || ''}"`;
        }).join(',');
    })
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
}

export function exportTeachersToCsv(data: any[], fileName: string = 'teachers.csv') {
  if (!data || data.length === 0) {
    alert("No data to export");
    return;
  }

  const headers = [
    { label: "Name", key: "name" },
    { label: "Passport", key: "passport_number" },
    { label: "Country", key: "country" },
    { label: "Phone", key: "phone" },
    { label: "Lesson Count", key: "lessonCount" },
    { label: "Event Count", key: "eventCount" },
    { label: "Total Event Hours", key: "totalEventHours" },
  ];

  const csvData = data.map(teacher => {
      const totalEventHours = teacher.totalEventHours || 0;
      return {
          name: teacher.name || '',
          passport_number: teacher.passport_number || '',
          country: teacher.country || '',
          phone: teacher.phone || '',
          lessonCount: teacher.lessonCount || 0,
          eventCount: teacher.eventCount || 0,
          totalEventHours: parseFloat(totalEventHours.toFixed(2)),
      };
  });
  
  const csvContent = [
    headers.map(h => h.label).join(','),
    ...csvData.map(row => {
        return headers.map(h => {
            const key = h.key as keyof typeof row;
            const value = row[key];

            if (key === 'phone' && value) {
                return `="${value}"`;
            }
            
            return `"${value || ''}"`;
        }).join(',');
    })
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
}

export function exportPackagesToCsv(data: any[], fileName: string = 'packages.csv') {
  if (!data || data.length === 0) {
    alert("No data to export");
    return;
  }

  const headers = [
    { label: "Description", key: "description" },
    { label: "Duration (min)", key: "duration" },
    { label: "Price per Student (€)", key: "price_per_student" },
    { label: "Student Capacity", key: "capacity_students" },
    { label: "Kite Capacity", key: "capacity_kites" },
    { label: "Booking Count", key: "bookingCount" },
  ];

  const csvData = data.map(pkg => {
      return {
          description: pkg.description || '',
          duration: pkg.duration || 0,
          price_per_student: pkg.price_per_student || 0,
          capacity_students: pkg.capacity_students || 0,
          capacity_kites: pkg.capacity_kites || 0,
          bookingCount: pkg.bookingCount || 0,
      };
  });
  
  const csvContent = [
    headers.map(h => h.label).join(','),
    ...csvData.map(row => headers.map(h => `"${row[h.key as keyof typeof row] || ''}"`).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
}

export function exportBookingsToCsv(data: any[], fileName: string = 'bookings.csv') {
  if (!data || data.length === 0) {
    alert("No data to export");
    return;
  }

  const headers = [
    { label: "Start Date", key: "date_start" },
    { label: "End Date", key: "date_end" },
    { label: "Students", key: "studentNames" },
    { label: "Package", key: "packageDescription" },
    { label: "Package Hours", key: "packageHours" },
    { label: "Progression", key: "progression" },
  ];

  const csvData = data.map(booking => {
      const packageDuration = booking.package?.duration || 0;
      const packageHours = packageDuration / 60;

      const eventsDuration = booking.lessons?.reduce((lessonTotal: number, lesson: any) => {
          const lessonMinutes = lesson.events?.reduce((eventTotal: number, event: any) => {
              return eventTotal + (event.duration || 0);
          }, 0) || 0;
          return lessonTotal + lessonMinutes;
      }, 0) || 0;
      const progress = packageDuration > 0 ? (eventsDuration / packageDuration) * 100 : 0;

      return {
          date_start: booking.date_start ? new Date(booking.date_start).toLocaleDateString() : '',
          date_end: booking.date_end ? new Date(booking.date_end).toLocaleDateString() : '',
          studentNames: booking.students?.map((bs: any) => bs.student.name).join(", ") || 'No students',
          packageDescription: booking.package?.description || '',
          packageHours: parseFloat(packageHours.toFixed(2)),
          progression: `${progress.toFixed(0)}%`,
      };
  });
  
  const csvContent = [
    headers.map(h => h.label).join(','),
    ...csvData.map(row => headers.map(h => `"${row[h.key as keyof typeof row] || ''}"`).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
}

export function exportLessonsToCsv(data: any[], fileName: string = 'lessons.csv') {
  if (!data || data.length === 0) {
    alert("No data to export");
    return;
  }

  const headers = [
    { label: "Teacher", key: "teacherName" },
    { label: "Commission per Hour (€)", key: "commissionRate" },
    { label: "Students", key: "studentNames" },
    { label: "Package", key: "packageDescription" },
    { label: "Event Count", key: "eventCount" },
    { label: "Total Event Hours", key: "totalEventHours" },
  ];

  const csvData = data.map(lesson => {
      const totalEventMinutes = lesson.events?.reduce((sum: number, event: any) => sum + event.duration, 0) || 0;
      const totalEventHours = totalEventMinutes / 60;

      return {
          teacherName: lesson.teacher?.name || '',
          commissionRate: lesson.commission?.price_per_hour || 0,
          studentNames: lesson.booking?.students?.map((bs: any) => bs.student.name).join(", ") || 'No students',
          packageDescription: lesson.booking?.package?.description || '',
          eventCount: lesson.events?.length || 0,
          totalEventHours: parseFloat(totalEventHours.toFixed(2)),
      };
  });
  
  const csvContent = [
    headers.map(h => h.label).join(','),
    ...csvData.map(row => headers.map(h => `"${row[h.key as keyof typeof row] || ''}"`).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
}