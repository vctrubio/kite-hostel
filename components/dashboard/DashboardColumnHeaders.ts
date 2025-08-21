export interface TableHeader {
  title: string;
  key: string;
  sortable?: boolean;
}

export function getEntityColumnHeaders(entityName: string): TableHeader[] {
  switch (entityName.toLowerCase()) {
    case 'student':
      return [
        { title: "Select", key: "select", sortable: false },
        { title: "Date", key: "created_at", sortable: true },
        { title: "Name", key: "name", sortable: true },
        { title: "Description", key: "desc", sortable: false },
        { title: "Bookings", key: "bookings", sortable: true },
        { title: "Active Booking", key: "active_booking", sortable: false },
        { title: "Actions", key: "actions", sortable: false },
      ];
    case 'teacher':
      return [
        { title: "Date", key: "created_at", sortable: true },
        { title: "Name", key: "name", sortable: true },
        { title: "Phone", key: "phone", sortable: false },
        { title: "Commissions", key: "commissions", sortable: true },
        { title: "Actions", key: "actions", sortable: false },
      ];
    case 'package':
      return [
        { title: "Description", key: "description", sortable: true },
        { title: "Kites", key: "capacity_kites", sortable: true },
        { title: "Students", key: "capacity_students", sortable: true },
        { title: "Duration", key: "duration", sortable: true },
        { title: "Price", key: "price_per_student", sortable: true },
        { title: "Rate/h", key: "hourly_rate", sortable: true },
        { title: "Actions", key: "actions", sortable: false },
      ];
    case 'payment':
      return [
        { title: "Date", key: "created_at", sortable: true },
        { title: "Teacher", key: "teacher", sortable: true },
        { title: "Amount", key: "amount", sortable: true },
        { title: "Actions", key: "actions", sortable: false },
      ];
    case 'booking':
      return [
        { title: "Start Date", key: "date_start", sortable: true },
        { title: "Status", key: "status", sortable: true },
        { title: "Reference", key: "reference", sortable: true },
        { title: "Students", key: "students", sortable: true },
        { title: "Lessons", key: "lessons", sortable: true },
        { title: "Actions", key: "actions", sortable: false },
      ];
    default:
      return [];
  }
}
