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
    default:
      return defaultSorter;
  }
}
