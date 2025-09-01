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
