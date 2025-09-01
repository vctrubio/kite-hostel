export function exportEventsToCsv(data: any[], fileName: string = 'events.csv') {
  if (!data || data.length === 0) {
    alert("No data to export");
    return;
  }

  const headers = [
    { label: "Date", key: "date" },
    { label: "Teacher", key: "teacher" },
    { label: "Students", key: "students" },
    { label: "Location", key: "location" },
    { label: "Duration", key: "duration" },
    { label: "Kite", key: "kite" },
    { label: "Price Per Hour Per Student", key: "pricePerHourPerStudent" },
    { label: "Commission Per Hour", key: "commissionPerHour" },
  ];

  const csvData = data.map(event => {
      const packageHours = event.package?.duration ? event.package.duration / 60 : 0;
      const pricePerHour = packageHours > 0 && event.package?.price_per_student ? event.package.price_per_student / packageHours : 0;
      const studentNames = event.students?.map((s: any) => `${s.name} ${s.last_name || ''}`.trim()).join(', ') || '';
      const kiteInfo = event.kite ? `${event.kite.model} ${event.kite.size}m` : '';

      return {
          date: event.date ? new Date(event.date).toLocaleDateString() : '',
          teacher: event.teacher?.name || '',
          students: studentNames,
          location: event.location || '',
          duration: event.duration || 0,
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