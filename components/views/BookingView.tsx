import { useRouter } from "next/navigation";
import { BookingIcon } from "@/svgs/BookingIcon";
import { FormatDateRange } from "@/components/formatters/DateRange";
import { BookingStatusLabel } from "@/components/label/BookingStatusLabel";
import { BookingWithRelations } from "@/backend/types";
import { UsersIcon } from "@/svgs/UsersIcon";
import { Duration } from "@/components/formatters/Duration";
import { BookingToLessonModal } from "@/components/modals/BookingToLessonModal";
import { useState } from "react";
import { HeadsetIcon } from "@/svgs/HeadsetIcon";

interface BookingViewProps {
  booking: BookingWithRelations;
}

export function BookingView({ booking }: BookingViewProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const hasLessons = booking.lessons && booking.lessons.length > 0;
  const activeLesson = booking.lessons.find(
    (lesson) => lesson.status === "planned" || lesson.status === "rest",
  );
  const teacherName = activeLesson ? activeLesson.teacher.name : "N/A";
  const lessonStatus = activeLesson ? activeLesson.status : "N/A";

  const totalLessonEventDuration = booking.lessons.reduce((sum, lesson) => {
    return sum + lesson.events.reduce((eventSum, event) => eventSum + event.duration, 0);
  }, 0);

  const packageDuration = booking.package?.duration || 0;

  const handleBookingClick = () => {
    if (!hasLessons) {
      setIsModalOpen(true);
    } else {
      router.push(`/bookings/${booking.id}`);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <div
        className="flex items-center space-x-2 cursor-pointer"
        onClick={handleBookingClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <BookingIcon className={`w-5 h-5 ${isHovered ? "text-gray-500" : "text-blue-500"}`} />
        <FormatDateRange startDate={booking.date_start} endDate={booking.date_end} />
      </div>
      <BookingStatusLabel bookingId={booking.id} currentStatus={booking.status} />
      <div className="h-4 border-r border-gray-300 mx-2"></div>
      {activeLesson && (
        <span className="flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-700 border border-gray-200">
          {Array.from({ length: booking.lessons.length }).map((_, i) => (
            <HeadsetIcon key={i} className="w-3 h-3" />
          ))}
          <span>{teacherName}</span>
          <span className="ml-1">({lessonStatus})</span>
        </span>
      )}
      {booking.package?.capacity_students && (
        <div className="flex items-center">
          {Array.from({ length: booking.package.capacity_students }).map((_, i) => (
            <UsersIcon key={i} className="w-4 h-4 text-gray-400" />
          ))}
        </div>
      )}
      <span>
        {hasLessons ? (
          <>
            <Duration minutes={totalLessonEventDuration} /> / <Duration minutes={packageDuration} />
          </>
        ) : (
          <span className="cursor-pointer text-blue-600 hover:underline" onClick={() => setIsModalOpen(true)}>
            No Lesson Plan / <Duration minutes={packageDuration} />
          </span>
        )}
      </span>
      {isModalOpen && (
        <BookingToLessonModal
          bookingId={booking.id}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
