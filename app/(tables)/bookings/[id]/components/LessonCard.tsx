import { HeadsetIcon, FlagIcon } from "@/svgs";
import { Duration } from "@/components/formatters/Duration";

interface LessonCardProps {
  lesson: any;
  formatEventDate: (dateString: string) => string;
}

export function LessonCard({ lesson, formatEventDate }: LessonCardProps) {
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
      {hasEvents ? (
        <div className="space-y-2 mt-2 bg-muted/20 rounded-md p-2">
          <div className="ml-2 space-y-2">
            {lesson.events.map((event: any) => (
              <div
                key={event.id}
                className="flex items-center gap-3 text-sm"
              >
                <FlagIcon className="w-3.5 h-3.5 text-orange-500" />
                <span>{formatEventDate(event.date)}</span>
                <Duration minutes={event.duration || 0} />
                <span className="text-muted-foreground">{event.location}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-sm text-muted-foreground text-center py-2">
          No events scheduled yet
        </div>
      )}
    </div>
  );
}
