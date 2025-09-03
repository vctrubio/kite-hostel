import { getBookingById } from "@/actions/booking-actions";
import { getBookingExportData, getEventsExportData } from "@/actions/export-actions";
import { WhiteboardClass, extractStudents } from "@/backend/WhiteboardClass";
import { 
  BookingHeader, 
  Students, 
  PackageDetails, 
  BookingTimeline, 
  ReferenceInformation, 
  Lessons, 
  ExportSection 
} from "./components";
import { Receipt } from "@/components/export/Receipt";

interface BookingDetailPageProps {
  params: { id: string };
}

export default async function BookingDetailPage({ params }: BookingDetailPageProps) {
  const { id } = params;
  const { data: booking, error } = await getBookingById(id);

  // Prepare export data
  const bookingExportData = await getBookingExportData(id);
  const eventsExportData = await getEventsExportData(id);

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!booking) {
    return <div className="text-gray-500">Booking not found.</div>;
  }

  // Initialize the WhiteboardClass for booking calculations
  const bookingClass = new WhiteboardClass(booking);
  const students = extractStudents(booking);

  // Calculate package and pricing details
  const packageHours = booking.package ? booking.package.duration / 60 : 0;
  const totalPrice = booking.package
    ? booking.package.price_per_student * booking.package.capacity_students
    : 0;
  const pricePerHourPerStudent = packageHours > 0
    ? (booking.package?.price_per_student || 0) / packageHours
    : 0;

  // Calculate event hours (used hours) from booking's lessons and events
  const eventHours = booking.lessons?.reduce((total, lesson) => {
    const lessonEventMinutes = lesson.events?.reduce((sum, event) => sum + (event.duration || 0), 0) || 0;
    return total + lessonEventMinutes / 60;
  }, 0) || 0;

  // Calculate price to pay per student based on used hours
  const priceToPay = pricePerHourPerStudent * eventHours;

  // Prepare receipt event data
  const receiptEvents = booking.lessons?.flatMap(lesson =>
    (lesson.events || []).map(event => {
      const eventDate = new Date(event.date);
      const durationHours = (event.duration || 0) / 60;
      const formattedDuration = durationHours % 1 === 0 ?
        `${Math.floor(durationHours)}h` :
        `${durationHours.toFixed(1)}h`;

      return {
        teacherName: lesson.teacher?.name || 'Unknown',
        date: `${eventDate.getDate()}/${eventDate.getMonth() + 1}`,
        time: `${eventDate.getHours()}:${String(eventDate.getMinutes()).padStart(2, '0')}`,
        duration: formattedDuration,
        location: event.location
      };
    })
  ) || [];
  
  // Calculate days between start and end dates
  const startDate = new Date(booking.date_start);
  const endDate = new Date(booking.date_end);
  const daysDifference = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));

  // Server-side date formatting function - for human-readable dates
  const formatReadableDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  // Format date for event dates - simplified version for events
  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    return `${day} ${month}`;
  };

  // Generate receipt text for export
  const receiptText = `
Students: ${students.map(s => s.name).join(', ')}
Package Hours: ${packageHours % 1 === 0 ? Math.floor(packageHours) : packageHours.toFixed(1)}h
Price per Hour: €${pricePerHourPerStudent.toFixed(2)}
Total Kited Hours: ${eventHours % 1 === 0 ? Math.floor(eventHours) : eventHours.toFixed(1)}h
Total Price to Pay: €${priceToPay.toFixed(2)}

*** RECEIPT ***${receiptEvents.map((event, index) => `
${index + 1}. ${event.teacherName}, ${event.date}, ${event.time}, ${event.duration}, ${event.location}`).join('')}`;

  return (
    <div className="container mx-auto p-4">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Header Section */}
        <BookingHeader 
          bookingId={booking.id}
          status={booking.status}
          eventMinutes={bookingClass.calculateBookingLessonEventMinutes()}
          totalMinutes={bookingClass.getTotalMinutes()}
          dateStart={booking.date_start}
          dateEnd={booking.date_end}
          formatReadableDate={formatReadableDate}
        />

        {/* Left Column */}
        <div className="space-y-6">
          {/* Students Section */}
          <Students students={students} />

          {/* Package Details Section */}
          <PackageDetails 
            packageData={booking.package}
            eventHours={eventHours}
            pricePerHourPerStudent={pricePerHourPerStudent}
            totalPrice={totalPrice}
            priceToPay={priceToPay}
            referenceId={booking.reference?.id}
          />

          {/* Booking Dates */}
          <BookingTimeline 
            createdAt={booking.created_at}
            dateStart={booking.date_start}
            dateEnd={booking.date_end}
            daysDifference={daysDifference}
            formatReadableDate={formatReadableDate}
          />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Reference Information */}
          <ReferenceInformation reference={booking.reference} />

          {/* Lessons Section */}
          <Lessons 
            lessons={booking.lessons} 
            formatEventDate={formatEventDate} 
          />

          {/* Receipt Section */}
          <Receipt
            studentNames={students.map(s => s.name).join(', ')}
            packageHours={packageHours}
            pricePerHour={pricePerHourPerStudent}
            totalKitedHours={eventHours}
            totalPriceToPay={priceToPay}
            events={receiptEvents}
          />

          {/* Export buttons */}
          <ExportSection
            bookingId={booking.id}
            bookingData={bookingExportData}
            eventsData={eventsExportData}
            receiptText={receiptText}
          />
        </div>
      </div>
    </div>
  );
}
