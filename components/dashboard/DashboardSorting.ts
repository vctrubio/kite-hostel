export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

type Sorter = (a: any, b: any, sortConfig: SortConfig) => number;

const defaultSorter: Sorter = (a: any, b: any, sortConfig: SortConfig) => {
  const aValue = a[sortConfig.key];
  const bValue = b[sortConfig.key];

  if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
  if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
  return 0;
};

export function getEntitySorter(entityName: string): Sorter {
  switch (entityName.toLowerCase()) {
    case 'student':
      return (a, b, sortConfig) => {
        const { key } = sortConfig;
        if (key === 'bookings') {
          const aLength = a.bookings?.length || 0;
          const bLength = b.bookings?.length || 0;
          if (aLength < bLength) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aLength > bLength) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        }
        return defaultSorter(a, b, sortConfig);
      };
    case 'teacher':
      return (a, b, sortConfig) => {
        const { key } = sortConfig;
        if (key === 'commissions') {
          const aLength = a.commissions?.length || 0;
          const bLength = b.commissions?.length || 0;
          if (aLength < bLength) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aLength > bLength) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        }
        return defaultSorter(a, b, sortConfig);
      };
    case 'package':
      return (a, b, sortConfig) => {
        const { key } = sortConfig;
        if (key === 'hourly_rate') {
          // Calculate hourly rate for each package
          const aRate = a.duration > 0 ? (a.price_per_student / (a.duration / 60)) : 0;
          const bRate = b.duration > 0 ? (b.price_per_student / (b.duration / 60)) : 0;
          if (aRate < bRate) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aRate > bRate) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        }
        return defaultSorter(a, b, sortConfig);
      };
    case 'payment':
      return (a, b, sortConfig) => {
        const { key } = sortConfig;
        if (key === 'teacher') {
          const aName = a.teacher?.name || '';
          const bName = b.teacher?.name || '';
          if (aName < bName) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aName > bName) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        }
        return defaultSorter(a, b, sortConfig);
      };
    case 'kite':
      return (a, b, sortConfig) => {
        const { key } = sortConfig;
        if (key === 'assignedTeachers') {
          const aLength = a.assignedTeachers?.length || 0;
          const bLength = b.assignedTeachers?.length || 0;
          if (aLength < bLength) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aLength > bLength) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        }
        if (key === 'events') {
          const aLength = a.events?.length || 0;
          const bLength = b.events?.length || 0;
          if (aLength < bLength) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aLength > bLength) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        }
        return defaultSorter(a, b, sortConfig);
      };
    case 'event':
      return (a, b, sortConfig) => {
        const { key } = sortConfig;
        if (key === 'teacher') {
          const aName = a.teacher?.name || '';
          const bName = b.teacher?.name || '';
          if (aName < bName) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aName > bName) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        }
        if (key === 'total') {
          // Calculate total for sorting
          const calculateTotal = (event: any) => {
            if (event.package?.price_per_student && event.student_count && event.duration && event.package?.duration) {
              const hours = event.duration / 60;
              const packageHours = event.package.duration / 60;
              const pricePerHour = event.package.price_per_student / packageHours;
              return pricePerHour * hours * event.student_count;
            }
            return 0;
          };
          const aTotal = calculateTotal(a);
          const bTotal = calculateTotal(b);
          if (aTotal < bTotal) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aTotal > bTotal) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        }
        return defaultSorter(a, b, sortConfig);
      };
    case 'lesson':
      return (a, b, sortConfig) => {
        const { key } = sortConfig;
        if (key === 'teacher') {
          const aName = a.teacher?.name || '';
          const bName = b.teacher?.name || '';
          if (aName < bName) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aName > bName) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        }
        if (key === 'events') {
          const aLength = a.events?.length || 0;
          const bLength = b.events?.length || 0;
          if (aLength < bLength) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aLength > bLength) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        }
        return defaultSorter(a, b, sortConfig);
      };
    case 'booking':
      return (a, b, sortConfig) => {
        const { key } = sortConfig;
        if (key === 'students' || key === 'lessons') {
          const aLength = a[key]?.length || 0;
          const bLength = b[key]?.length || 0;
          if (aLength < bLength) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aLength > bLength) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        }
        if (key === 'reference') {
          const aRef = a.reference?.teacher?.name || a.reference?.role || '';
          const bRef = b.reference?.teacher?.name || b.reference?.role || '';
          if (aRef < bRef) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aRef > bRef) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        }
        return defaultSorter(a, b, sortConfig);
      };
    case 'reference':
      return (a, b, sortConfig) => {
        const { key } = sortConfig;
        if (key === 'price') {
          const aPrice = a.packagePrice || 0;
          const bPrice = b.packagePrice || 0;
          if (aPrice < bPrice) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aPrice > bPrice) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        }
        if (key === 'capacity') {
          const aCapacity = a.packageCapacity || 0;
          const bCapacity = b.packageCapacity || 0;
          if (aCapacity < bCapacity) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aCapacity > bCapacity) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        }
        if (key === 'created_at') {
          const aDate = new Date(a.bookingCreatedAt || 0).getTime();
          const bDate = new Date(b.bookingCreatedAt || 0).getTime();
          if (aDate < bDate) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aDate > bDate) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        }
        if (key === 'start_date') {
          const aDate = new Date(a.bookingStartDate || 0).getTime();
          const bDate = new Date(b.bookingStartDate || 0).getTime();
          if (aDate < bDate) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aDate > bDate) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        }
        if (key === 'name') {
          const aName = a.teacherName || '';
          const bName = b.teacherName || '';
          if (aName < bName) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aName > bName) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        }
        return defaultSorter(a, b, sortConfig);
      };
    default:
      return defaultSorter;
  }
}
