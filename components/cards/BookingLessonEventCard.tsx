"use client";

import Link from "next/link";
import { BookingIcon, HeadsetIcon, FlagIcon, BookmarkIcon, HelmetIcon } from "@/svgs";
import { BookingProgressBar } from "@/components/formatters/BookingProgressBar";
import { BookingStatusLabel } from "@/components/label/BookingStatusLabel";
import { EventStatusLabel } from "@/components/label/EventStatusLabel";
import { Duration } from "@/components/formatters/Duration";
import { ElegantDate } from "@/components/formatters/DateTime";
import { PackageDetails } from "@/getters/package-details";
import { BillboardClass } from "@/backend/BillboardClass";

interface BookingLessonEventCardProps {
  booking: any;
  showStudents?: boolean; // for student view, if students length > 1, (not itself = show more studfents)
  compact?: boolean;      // For compact view mode
}

interface ViewProps {
  booking: any;
  bookingClass: BillboardClass;
  eventHours: number;
  pricePerHourPerStudent: number;
  priceToPay: number;
  showStudents?: boolean;
}

// Compact View Sub-component
function CompactView({ booking, bookingClass }: ViewProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
      {/* Compact Booking Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/bookings/${booking.id}`}>
            <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
              <BookingIcon className="w-5 h-5 text-blue-500" />
              <BookingProgressBar
                eventMinutes={bookingClass.getEventMinutes()}
                totalMinutes={bookingClass.package?.duration || 0}
              />
            </div>
          </Link>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <ElegantDate dateString={booking.date_start} /> - <ElegantDate dateString={booking.date_end} />
          </div>
        </div>
        <BookingStatusLabel bookingId={booking.id} currentStatus={booking.status} />
      </div>

      {/* Student Names Only */}
      {booking.students && booking.students.length > 0 && (
        <div className="flex items-center gap-2 mt-2">
          <div className="flex gap-1">
            {Array.from({ length: booking.students.length }, (_, index) => (
              <HelmetIcon key={index} className="w-4 h-4 text-yellow-500" />
            ))}
          </div>
          <div className="text-sm font-medium">
            {booking.students.map((bookingStudent: any, index: number) => (
              <Link key={bookingStudent.student.id} href={`/students/${bookingStudent.student.id}`} className="hover:text-blue-600 transition-colors">
                {bookingStudent.student.name} {bookingStudent.student.last_name || ''}
                {index < booking.students.length - 1 && ', '}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Teacher Names (iterate like students) */}
      {booking.lessons && booking.lessons.length > 0 && (
        <div className="flex items-center gap-2 mt-2">
          <div className="flex gap-1">
            {Array.from({ length: booking.lessons.length }, (_, index) => (
              <HeadsetIcon key={index} className="w-4 h-4 text-green-600" />
            ))}
          </div>
          <div className="text-sm font-medium">
            {booking.lessons.map((lesson: any, index: number) => (
              <span key={lesson.id}>
                {lesson.teacher?.id ? (
                  <Link href={`/teachers/${lesson.teacher.id}`} className="hover:text-blue-600 transition-colors cursor-pointer">
                    {lesson.teacher.name || "Unknown Teacher"}
                  </Link>
                ) : (
                  <span>{lesson.teacher?.name || "Unknown Teacher"}</span>
                )}
                {index < booking.lessons.length - 1 && ', '}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Full View Sub-component
function FullView({ booking, bookingClass, eventHours, pricePerHourPerStudent, priceToPay, showStudents }: ViewProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border p-6 space-y-6">
      {/* Booking Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/bookings/${booking.id}`}>
              <h3 className="text-xl font-semibold flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors">
                <BookingIcon className="w-6 h-6 text-blue-500" />
                <span>Booking</span>
              </h3>
            </Link>
            <div className="pt-1">
              <BookingProgressBar
                eventMinutes={bookingClass.getEventMinutes()}
                totalMinutes={bookingClass.package?.duration || 0}
              />
            </div>
          </div>
          <BookingStatusLabel bookingId={booking.id} currentStatus={booking.status} />
        </div>

        {/* Dates */}
        <div className="flex items-center gap-3 text-sm font-medium text-gray-600 dark:text-gray-400">
          <ElegantDate dateString={booking.date_start} />
          <span>to</span>
          <ElegantDate dateString={booking.date_end} />
        </div>
      </div>

      {/* Package Details */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold flex items-center gap-2">
          <BookmarkIcon className="w-5 h-5 text-orange-500" />
          <span>Package Details</span>
        </h4>
        <PackageDetails
          packageData={booking.package}
          eventHours={eventHours}
          pricePerHourPerStudent={pricePerHourPerStudent}
          totalPrice={booking.package ? booking.package.price_per_student * booking.package.capacity_students : 0}
          priceToPay={priceToPay}
          referenceId={booking.reference?.id}
          variant="full"
        />
      </div>

      {/* Students Section - show when there are multiple students or when showing students to teachers */}
      {booking.students && booking.students.length > 0 && (showStudents || booking.students.length > 1) && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold flex items-center gap-2">
            <div className="flex items-center gap-1">
              {Array.from({ length: booking.students.length }, (_, index) => (
                <HelmetIcon key={index} className="w-4 h-4 text-yellow-500" />
              ))}
            </div>
            <span>Students</span>
          </h4>
          <div className="space-y-4">
            {booking.students.map((bookingStudent: any) => (
              <Link key={bookingStudent.student.id} href={`/students/${bookingStudent.student.id}`}>
                <div className="border-b border-gray-200 dark:border-gray-600 pb-3 mb-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <HelmetIcon className="w-4 h-4 text-yellow-500" />
                    <span className="font-medium">{bookingStudent.student.name} {bookingStudent.student.last_name || ''}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <div>Country: {bookingStudent.student.country || 'N/A'}</div>
                    <div>Size: {bookingStudent.student.size || 'N/A'}</div>
                    {bookingStudent.student.languages && bookingStudent.student.languages.length > 0 && (
                      <div className="col-span-2">Languages: {bookingStudent.student.languages.join(', ')}</div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Lessons Section */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold flex items-center gap-2">
          <div className="flex items-center gap-1">
            {Array.from({ length: booking.lessons?.length || 0 }, (_, index) => (
              <HeadsetIcon key={index} className="w-4 h-4 text-green-600" />
            ))}
          </div>
          <span>Lessons</span>
        </h4>

        {booking.lessons && booking.lessons.length > 0 ? (
          <div className="space-y-4">
            {booking.lessons.map((lesson: any) => (
              <div key={lesson.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg border p-4 space-y-3">
                {/* Lesson Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HeadsetIcon className="w-4 h-4 text-green-600" />
                    {lesson.teacher?.id ? (
                      <Link href={`/teachers/${lesson.teacher.id}`} className="font-medium hover:text-blue-600 transition-colors cursor-pointer">
                        {lesson.teacher.name || "Unknown Teacher"}
                      </Link>
                    ) : (
                      <span className="font-medium">{lesson.teacher?.name || "Unknown Teacher"}</span>
                    )}
                    <span className="text-xs text-gray-500 px-1.5 py-0.5 bg-gray-200 dark:bg-gray-600 rounded-full">
                      {lesson.status}
                    </span>
                  </div>

                  {/* Commission calculation */}
                  {lesson.commission && (
                    <div className="flex items-center gap-1 text-sm bg-white dark:bg-gray-800 rounded-md px-2.5 py-1 shadow-sm border">
                      <span className="font-semibold text-green-600">€{lesson.commission.price_per_hour}</span>
                      <span className="text-gray-500">×</span>
                      <span className="font-semibold text-orange-500">
                        {lesson.events ? (lesson.events.reduce((sum: number, event: any) => sum + (event.duration || 0), 0) / 60).toFixed(1) : "0.0"}h
                      </span>
                      <span className="text-gray-500">=</span>
                      <span className="font-semibold text-gray-600">
                        €{lesson.commission ? (
                          ((lesson.events?.reduce((sum: number, event: any) => sum + (event.duration || 0), 0) || 0) / 60) * lesson.commission.price_per_hour
                        ).toFixed(2) : "0.00"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Events list */}
                {lesson.events && lesson.events.length > 0 ? (
                  <div className="space-y-2 bg-white dark:bg-gray-800 rounded-md p-3">
                    {lesson.events.map((event: any) => (
                      <div key={event.id} className="flex items-center gap-3 text-sm">
                        <FlagIcon className="w-3.5 h-3.5 text-orange-500" />
                        <ElegantDate dateString={event.date} />
                        <Duration minutes={event.duration || 0} />
                        <span className="text-gray-500">{event.location}</span>
                        <EventStatusLabel eventId={event.id} currentStatus={event.status} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 text-center py-2">
                    No events scheduled yet
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No lessons associated with this booking.</p>
        )}
      </div>
    </div>
  );
}

export function BookingLessonEventCard({
  booking,
  showStudents = false,
  compact = false
}: BookingLessonEventCardProps) {
  // Initialize BillboardClass for calculations
  const bookingClass = new BillboardClass(booking);

  // Calculate event hours (used hours) from booking's lessons and events
  const eventHours = booking.lessons?.reduce((total: number, lesson: any) => {
    const lessonEventMinutes = lesson.events?.reduce((sum: number, event: any) => sum + (event.duration || 0), 0) || 0;
    return total + lessonEventMinutes / 60;
  }, 0) || 0;

  // Calculate package and pricing details
  const packageHours = booking.package ? booking.package.duration / 60 : 0;
  const pricePerHourPerStudent = packageHours > 0
    ? (booking.package?.price_per_student || 0) / packageHours
    : 0;
  const priceToPay = pricePerHourPerStudent * eventHours;

  // Common props for both views
  const commonProps: ViewProps = {
    booking,
    bookingClass,
    eventHours,
    pricePerHourPerStudent,
    priceToPay,
    showStudents
  };

  // Render appropriate view based on compact prop
  if (compact) {
    return <CompactView {...commonProps} />;
  }

  return <FullView {...commonProps} />;
}
