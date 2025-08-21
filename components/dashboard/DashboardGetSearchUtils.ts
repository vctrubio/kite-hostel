type SearchFunction = (item: any, searchTerm: string) => boolean;

/**
 * Default search function using JSON.stringify.
 */
const defaultSearchFunction: SearchFunction = (item: any, searchTerm: string) => {
  const searchableText = JSON.stringify(item).toLowerCase();
  return searchableText.includes(searchTerm.toLowerCase());
};

/**
 * Get a specific search function for an entity.
 * Falls back to a generic search if no specific function is defined.
 */
export function getEntitySearchFunction(entityName: string): SearchFunction {
  switch (entityName.toLowerCase()) {
    case 'student':
      return (student: any, searchTerm: string) => {
        const term = searchTerm.toLowerCase();
        const nameMatch = student.name?.toLowerCase().includes(term);
        const phoneMatch = student.phone?.toLowerCase().includes(term);
        const passportMatch = student.passport_number?.toLowerCase().includes(term);
        return nameMatch || phoneMatch || passportMatch;
      };

    case 'teacher':
      return (teacher: any, searchTerm: string) => {
        const term = searchTerm.toLowerCase();
        const nameMatch = teacher.name?.toLowerCase().includes(term);
        const phoneMatch = teacher.phone?.toLowerCase().includes(term);
        const passportMatch = teacher.passport_number?.toLowerCase().includes(term);
        return nameMatch || phoneMatch || passportMatch;
      };

    case 'package':
      return (pkg: any, searchTerm: string) => {
        const term = searchTerm.toLowerCase();
        const descriptionMatch = pkg.description?.toLowerCase().includes(term);
        const priceMatch = pkg.price_per_student?.toString().includes(term);
        const durationMatch = pkg.duration?.toString().includes(term);
        return descriptionMatch || priceMatch || durationMatch;
      };

    case 'payment':
      return (payment: any, searchTerm: string) => {
        const term = searchTerm.toLowerCase();
        const teacherMatch = payment.teacher?.name?.toLowerCase().includes(term);
        const amountMatch = payment.amount?.toString().includes(term);
        return teacherMatch || amountMatch;
      };

    case 'booking':
      return (booking: any, searchTerm: string) => {
        const term = searchTerm.toLowerCase();
        
        if (booking.students && Array.isArray(booking.students)) {
          const studentMatch = booking.students.some((student: any) => {
            const nameMatch = student.name?.toLowerCase().includes(term);
            const passportMatch = student.passport_number?.toLowerCase().includes(term);
            return nameMatch || passportMatch;
          });
          if (studentMatch) return true;
        }

        const referenceNameMatch = booking.reference?.teacher?.name?.toLowerCase().includes(term);
        if (referenceNameMatch) return true;

        return defaultSearchFunction(booking, searchTerm);
      };

    default:
      return defaultSearchFunction;
  }
}
