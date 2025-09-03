import { DateSince } from "@/components/formatters/DateSince";

interface BookingTimelineProps {
  createdAt?: string;
  dateStart: string;
  dateEnd: string;
  daysDifference: number;
  formatReadableDate: (dateString: string) => string;
}

export function BookingTimeline({ 
  createdAt, 
  dateStart, 
  dateEnd,
  daysDifference,
  formatReadableDate
}: BookingTimelineProps) {
  return (
    <div className="bg-card rounded-lg border border-border p-4 space-y-4">
      <h2 className="text-xl font-semibold">Booking Timeline</h2>
      <div className="grid grid-cols-1 gap-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Created:</span>
          <span className="font-medium">
            {createdAt ? formatReadableDate(createdAt) : "N/A"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Start Date:</span>
          <span className="font-medium">
            {formatReadableDate(dateStart)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">End Date:</span>
          <span className="font-medium">
            {formatReadableDate(dateEnd)}
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
