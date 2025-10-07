import { createElement } from "react";
import { BookingIcon } from "@/svgs/BookingIcon";
import { formatFriendlyDate, calculateDays } from "./utils";

interface BookingCreatedToastProps {
  dateStart: string;
  dateEnd: string;
}

export function createBookingCreatedToast(dateStart: string, dateEnd: string) {
  const formattedDate = formatFriendlyDate(dateStart);
  const totalDays = calculateDays(dateStart, dateEnd);
  const durationText = totalDays > 1 ? ` +${totalDays - 1}d` : '';

  return createElement(
    'div',
    { className: 'flex items-start gap-2' },
    createElement(BookingIcon, { className: 'w-5 h-5 flex-shrink-0 mt-0.5 text-blue-500' }),
    createElement(
      'div',
      { className: 'flex-1' },
      createElement('div', { className: 'font-semibold' }, 'New Booking'),
      createElement(
        'div',
        { className: 'text-sm text-muted-foreground flex items-center gap-1' },
        createElement('span', null, formattedDate),
        durationText && createElement(
          'span',
          { className: 'text-xs px-2 py-0.5 bg-muted rounded-md' },
          durationText
        )
      )
    )
  );
}

// Alternative: If you want to use it as a component directly
export function BookingCreatedToast({ dateStart, dateEnd }: BookingCreatedToastProps) {
  const formattedDate = formatFriendlyDate(dateStart);
  const totalDays = calculateDays(dateStart, dateEnd);
  const durationText = totalDays > 1 ? ` +${totalDays - 1}d` : '';

  return (
    <div className="flex items-start gap-2">
      <BookingIcon className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-500" />
      <div className="flex-1">
        <div className="font-semibold">New Booking</div>
        <div className="text-sm text-muted-foreground flex items-center gap-1">
          <span>{formattedDate}</span>
          {durationText && (
            <span className="text-xs px-2 py-0.5 bg-muted rounded-md">
              {durationText}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
