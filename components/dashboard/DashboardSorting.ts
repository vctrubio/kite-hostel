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
