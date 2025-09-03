import { HeadsetIcon, FlagIcon } from "@/svgs";
import { Duration } from "@/components/formatters/Duration";

interface LessonCardProps {
  lesson: any;
  formatEventDate: (dateString: string) => string;
}

export function LessonCard({ lesson, formatEventDate }: LessonCardProps) {
  // Check if commission exists on the lesson object
  const hasCommission = 'commission' in lesson && lesson.commission;
  
  return (
    <div className="bg-background/50 rounded p-3 space-y-3">
      {/* Lesson header */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HeadsetIcon className="w-4 h-4 text-green-600" />
            <span className="font-medium">{lesson.teacher?.name || "Unknown Teacher"}</span>
          </div>
          <div className="text-sm px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">
            {lesson.status}
          </div>
        </div>
        
        {/* Hours and commission calculation */}
        {lesson.events && lesson.events.length > 0 && (
          <div className="flex flex-wrap items-center justify-between mt-1">
            <div className="flex items-center space-x-1.5 text-sm">
              {/* Always show hours */}
              <span className="px-2 py-1 border border-border rounded-l-md bg-muted/30 font-medium">
                {(lesson.events.reduce((sum, event) => sum + (event.duration || 0), 0) / 60).toFixed(1)}h
              </span>
              
              {/* Show commission rate if available */}
              {hasCommission ? (
                <>
                  <span className="px-2 py-1 border-y border-border bg-muted/20">
                    €{lesson.commission.price_per_hour}/h
                  </span>
                  <span className="px-2 py-1 border border-border rounded-r-md bg-muted/30 font-medium">
                    €{((lesson.events.reduce((sum, event) => sum + (event.duration || 0), 0) / 60) * lesson.commission.price_per_hour).toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="px-2 py-1 border border-border rounded-r-md bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100 text-xs">
                  No commission data
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Events list */}
      {lesson.events && lesson.events.length > 0 && (
        <div className="space-y-2 mt-2">
          <div className="ml-3 space-y-2">
            {lesson.events.map((event: any) => (
              <div
                key={event.id}
                className="flex items-center gap-3 text-sm"
              >
                <FlagIcon className="w-4 h-4 text-orange-500" />
                <span>{formatEventDate(event.date)}</span>
                <Duration minutes={event.duration || 0} />
                <span className="text-muted-foreground">{event.location}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
