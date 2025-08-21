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

    case 'kite':
      return (kite: any, searchTerm: string) => {
        const term = searchTerm.toLowerCase();
        const modelMatch = kite.model?.toLowerCase().includes(term);
        const serialIdMatch = kite.serial_id?.toLowerCase().includes(term);
        const sizeMatch = kite.size?.toString().includes(term);
        const teacherMatch = kite.assignedTeachers?.some((teacher: any) => 
          teacher.name?.toLowerCase().includes(term)
        );
        return modelMatch || serialIdMatch || sizeMatch || teacherMatch;
      };

    case 'event':
      return (event: any, searchTerm: string) => {
        const term = searchTerm.toLowerCase();
        const teacherMatch = event.teacher?.name?.toLowerCase().includes(term);
        const locationMatch = event.location?.toLowerCase().includes(term);
        const statusMatch = event.status?.toLowerCase().includes(term);
        const studentMatch = event.students?.some((student: string) => 
          student.toLowerCase().includes(term)
        );
        const kiteMatch = event.kite?.model?.toLowerCase().includes(term) ||
                         event.kite?.serial_id?.toLowerCase().includes(term);
        return teacherMatch || locationMatch || statusMatch || studentMatch || kiteMatch;
      };

    case 'lesson':
      return (lesson: any, searchTerm: string) => {
        const term = searchTerm.toLowerCase();
        const teacherMatch = lesson.teacher?.name?.toLowerCase().includes(term);
        const statusMatch = lesson.status?.toLowerCase().includes(term);
        const bookingIdMatch = lesson.booking?.id?.toLowerCase().includes(term);
        const packageMatch = lesson.booking?.package?.description?.toLowerCase().includes(term);
        const studentMatch = lesson.booking?.students?.some((bs: any) => 
          bs.student?.name?.toLowerCase().includes(term)
        );
        return teacherMatch || statusMatch || bookingIdMatch || packageMatch || studentMatch;
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
