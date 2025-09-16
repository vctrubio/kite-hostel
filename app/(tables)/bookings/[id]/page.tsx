import { getBookingById } from "@/actions/booking-actions";
import { getBookingExportData, getEventsExportData } from "@/actions/export-actions";
import { WhiteboardClass, extractStudents } from "@/backend/WhiteboardClass";
import { Receipt } from "@/components/export/Receipt";
import { ExportButtons } from "@/components/export/ExportButtons";
import { ShowEventsInLessons } from "@/components/cards/BookingLessonEventCard";
import { DateSince } from "@/components/formatters/DateSince";
import { ElegantDate } from "@/components/formatters/DateTime";
import { BookingProgressBar } from "@/components/formatters/BookingProgressBar";
import { BookingStatusLabel } from "@/components/label/BookingStatusLabel";
import { PackageDetails } from "@/getters/package-details";
import {
  BookmarkIcon,
  BookingIcon,
  HeadsetIcon,
  HelmetIcon
} from "@/svgs";

// ===== SUB-COMPONENTS =====

// Component for displaying lesson information
function LessonCard({ lesson }: { lesson: any }) {
  // Check if commission exists on the lesson object
  const hasCommission = 'commission' in lesson && lesson.commission;
  
  // Calculate total hours
  const hasEvents = lesson.events && lesson.events.length > 0;
  const totalHours = hasEvents 
    ? (lesson.events.reduce((sum, event) => sum + (event.duration || 0), 0) / 60).toFixed(1)
    : "0.0";
    
  // Calculate total earnings
  const totalEarnings = hasCommission 
    ? (parseFloat(totalHours) * lesson.commission.price_per_hour).toFixed(2)
    : "0.00";
  
  return (
    <div className="bg-background/50 rounded-lg border border-muted/40 p-3 space-y-3 hover:shadow-sm transition-shadow">
      {/* Lesson header */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HeadsetIcon className="w-4 h-4 text-green-600" />
            <span className="font-medium">{lesson.teacher?.name || "Unknown Teacher"}</span>
            <span className="text-xs text-muted-foreground px-1.5 py-0.5 bg-muted/30 rounded-full">
              {lesson.status}
            </span>
          </div>
          
          {/* Commission calculation - replacing status */}
          {hasCommission ? (
            <div className="flex items-center gap-1 text-sm bg-gray-50 dark:bg-gray-800 rounded-md px-2.5 py-1 shadow-sm">
              <span className="font-semibold text-green-600">€{lesson.commission.price_per_hour}</span>
              <span className="text-gray-500">×</span>
              <span className="font-semibold text-orange-500">{totalHours}h</span>
              <span className="text-gray-500">=</span>
              <span className="font-semibold text-gray-600">€{totalEarnings}</span>
            </div>
          ) : (
            <div className="text-sm px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100 rounded-md">
              No commission data
            </div>
          )}
        </div>
      </div>

            {/* Events list */}
      <ShowEventsInLessons events={lesson.events || []} lessonId={lesson.id} />
    </div>
  );
}



// Component for displaying lessons
function Lessons({ lessons }: { 
  lessons: any[]; 
}) {
  return (
    <div className="bg-card rounded-lg border border-border p-4 space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <div className="flex items-center gap-1">
          {Array.from({ length: lessons.length }, (_, index) => (
            <HeadsetIcon key={index} className="w-4 h-4 text-green-600" />
          ))}
        </div>
        <span>Lessons</span>
      </h2>

      {lessons.length > 0 ? (
        <div className="space-y-4">
          {lessons.map((lesson) => (
            <LessonCard 
              key={lesson.id} 
              lesson={lesson} 
            />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No lessons associated with this booking.</p>
      )}
    </div>
  );
}

// Component for displaying students
function Students({ students }: { students: any[] }) {
  return (
    <div className="bg-card rounded-lg border border-border p-4 space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <div className="flex items-center gap-1">
          {Array.from({ length: students.length }, (_, index) => (
            <HelmetIcon key={index} className="w-5 h-5 text-yellow-500" />
          ))}
        </div>
        <span>Students</span>
      </h2>
      <div className="space-y-4">
        {students.map((student) => (
          <div 
            key={student.id} 
            className="p-3 rounded-md border border-border hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <a 
                href={`/students/${student.id}`} 
                className="flex items-center gap-2 group"
              >
                <HelmetIcon className="w-5 h-5 text-yellow-500 group-hover:text-yellow-600" />
                <span className="font-medium text-lg group-hover:underline">{student.name} {student.last_name || ''}</span>
              </a>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="space-y-1">
                <p className="text-muted-foreground">Passport:</p>
                <p className="font-medium">{student.passport_number || 'N/A'}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-muted-foreground">Phone:</p>
                <p className="font-medium">
                  {student.phone ? (
                    <a 
                      href={`https://wa.me/${student.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-600 hover:underline"
                    >
                      {student.phone}
                    </a>
                  ) : 'N/A'}
                </p>
              </div>
              
              <div className="space-y-1">
                <p className="text-muted-foreground">Country:</p>
                <p className="font-medium">{student.country || 'N/A'}</p>
              </div>
              
              {student.languages && student.languages.length > 0 && (
                <div className="space-y-1">
                  <p className="text-muted-foreground">Languages:</p>
                  <p className="font-medium">{student.languages.join(', ')}</p>
                </div>
              )}
              
              <div className="space-y-1">
                <p className="text-muted-foreground">Size:</p>
                <p className="font-medium">{student.size || 'N/A'}</p>
              </div>

              <div className="space-y-1">
                <p className="text-muted-foreground">Created:</p>
                <p className="font-medium">
                  {student.created_at ? (
                    <DateSince dateString={student.created_at} />
                  ) : 'N/A'}
                </p>
              </div>
              
              {student.desc && (
                <div className="space-y-1 md:col-span-3">
                  <p className="text-muted-foreground">Description:</p>
                  <p className="font-medium">{student.desc}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


// Component for displaying booking timeline
function BookingTimeline({ 
  createdAt, 
  dateStart, 
  dateEnd,
  daysDifference
}: {
  createdAt?: string;
  dateStart: string;
  dateEnd: string;
  daysDifference: number;
}) {
  return (
    <div className="bg-card rounded-lg border border-border p-4 space-y-4">
      <h2 className="text-xl font-semibold">Booking Timeline</h2>
      <div className="grid grid-cols-1 gap-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Created:</span>
          <span className="font-medium">
            {createdAt ? <ElegantDate dateString={createdAt} /> : "N/A"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Start Date:</span>
          <span className="font-medium">
            <ElegantDate dateString={dateStart} />
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">End Date:</span>
          <span className="font-medium">
            <ElegantDate dateString={dateEnd} />
          </span>
        </div>
        <div className="flex justify-between items-center pt-1 border-t border-border">
          <span className="text-muted-foreground">Total Days:</span>
          <span className="px-2.5 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 rounded-full text-xs font-medium">
            {daysDifference} day{daysDifference !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex justify-between items-center pt-1">
          <span className="text-muted-foreground">Since Start Date:</span>
          <DateSince dateString={dateStart} />
        </div>
      </div>
    </div>
  );
}

// Component for displaying reference information
function ReferenceInformation({ reference }: {
  reference: {
    id: string;
    teacher?: {
      name: string;
    } | null;
    note?: string;
  } | null;
}) {
  if (!reference) return null;

  return (
    <div className="bg-card rounded-lg border border-border p-4 space-y-4">
      <h2 className="text-xl font-semibold">Reference Information</h2>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">Reference ID:</span>
          <p className="font-medium">{reference.id}</p>
        </div>
        {reference.teacher && (
          <div>
            <span className="text-muted-foreground">Teacher:</span>
            <p className="font-medium">
              {reference.teacher.name}
            </p>
          </div>
        )}
        {reference.note && (
          <div className="col-span-2">
            <span className="text-muted-foreground">Note:</span>
            <p className="font-medium">{reference.note}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Component for displaying booking header
function BookingHeader({
  bookingId,
  status,
  eventMinutes,
  totalMinutes,
  dateStart,
  dateEnd,
  hasAnyEvents
}: {
  bookingId: string;
  status: "active" | "uncomplete" | "completed";
  eventMinutes: any; // Using any to match the output of calculateBookingLessonEventMinutes
  totalMinutes: number;
  dateStart: string;
  dateEnd: string;
  hasAnyEvents: boolean;
}) {
  return (
    <div className="col-span-full space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookingIcon className="w-8 h-8 text-blue-500" />
            <span>Booking </span>
          </h1>
          <div className="pt-1">
            <BookingProgressBar
              eventMinutes={eventMinutes}
              totalMinutes={totalMinutes}
            />
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <BookingStatusLabel 
            bookingId={bookingId} 
            currentStatus={status} 
            showDeleteOption={!hasAnyEvents}
          />
        </div>
      </div>

      {/* Dates and Progress bar */}
      <div className="w-full max-w-2xl mb-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="text-base font-medium flex items-center gap-2">
            <ElegantDate dateString={dateStart} />
            <span>to</span>
            <ElegantDate dateString={dateEnd} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Component for displaying export section
function ExportSection({ 
  bookingId, 
  bookingData, 
  eventsData,
  receiptText 
}: {
  bookingId: string;
  bookingData: any;
  eventsData: any;
  receiptText: string;
}) {
  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <h2 className="text-xl font-semibold mb-4">Export & Share</h2>
      <ExportButtons
        bookingId={bookingId}
        bookingData={bookingData}
        eventsData={eventsData}
        receiptText={receiptText}
      />
    </div>
  );
}

// ===== MAIN PAGE COMPONENT =====

interface BookingDetailPageProps {
  params: { id: string };
}

export default async function BookingDetailPage({ params }: BookingDetailPageProps) {
  const { id } = params;
  const { data: booking, error } = await getBookingById(id);

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!booking) {
    return <div className="text-gray-500">Booking not found.</div>;
  }

  // Prepare export data (only if booking exists)
  const bookingExportData = await getBookingExportData(id);
  const eventsExportData = await getEventsExportData(id);

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

  // Check if there are any events across all lessons
  const hasAnyEvents = booking.lessons?.some(lesson => 
    lesson.events && lesson.events.length > 0
  ) || false;

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

  // Generate receipt text for export
  const receiptText = `
Students: ${students.map(s => `${s.name} ${s.last_name || ''}`).join(', ')}
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
          hasAnyEvents={hasAnyEvents}
        />

        {/* Left Column */}
        <div className="space-y-6">
          {/* Students Section */}
          <Students students={students} />

          {/* Package Details Section */}
          <div className="bg-card rounded-lg border border-border p-4 space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <BookmarkIcon className="w-5 h-5 text-orange-500" />
              <span>Package Details</span>
            </h2>
            <PackageDetails 
              packageData={booking.package}
              eventHours={eventHours}
              pricePerHourPerStudent={pricePerHourPerStudent}
              totalPrice={totalPrice}
              priceToPay={priceToPay}
              referenceId={booking.reference?.id}
              variant="full"
            />
          </div>

          {/* Booking Dates */}
          <BookingTimeline 
            createdAt={booking.created_at}
            dateStart={booking.date_start}
            dateEnd={booking.date_end}
            daysDifference={daysDifference}
          />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Reference Information */}
          <ReferenceInformation reference={booking.reference} />

          {/* Lessons Section */}
          <Lessons 
            lessons={booking.lessons} 
          />

          {/* Receipt Section */}
          <Receipt
            studentNames={students.map(s => `${s.name} ${s.last_name || ''}`).join(', ')}
            packageHours={packageHours}
            pricePerHour={pricePerHourPerStudent}
            totalKitedHours={eventHours}
            totalPriceToPay={priceToPay}
            events={receiptEvents}
          />

          {/* Export buttons - only show if export data is available */}
          {bookingExportData && eventsExportData && (
            <ExportSection
              bookingId={booking.id}
              bookingData={bookingExportData}
              eventsData={eventsExportData}
              receiptText={receiptText}
            />
          )}
        </div>
      </div>
    </div>
  );
}
