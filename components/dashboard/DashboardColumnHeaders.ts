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
