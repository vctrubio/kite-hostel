import { BookingIcon } from "@/svgs";
import { BookingProgressBar } from "@/components/formatters/BookingProgressBar";
import { BookingStatusLabel } from "@/components/label/BookingStatusLabel";

interface BookingHeaderProps {
  bookingId: string;
  status: "active" | "uncomplete" | "completed";
  eventMinutes: any; // Using any to match the output of calculateBookingLessonEventMinutes
  totalMinutes: number;
  dateStart: string;
  dateEnd: string;
  formatReadableDate: (dateString: string) => string;
}

export function BookingHeader({
  bookingId,
  status,
  eventMinutes,
  totalMinutes,
  dateStart,
  dateEnd,
  formatReadableDate
}: BookingHeaderProps) {
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
        <BookingStatusLabel bookingId={bookingId} currentStatus={status} />
      </div>

      {/* Dates and Progress bar */}
      <div className="w-full max-w-2xl mb-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="text-base font-medium flex items-center gap-2">
            <span>{formatReadableDate(dateStart)}</span>
            <span>to</span>
            <span>{formatReadableDate(dateEnd)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
