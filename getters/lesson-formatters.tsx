import { HeadsetIcon, FlagIcon } from "@/svgs";
import { Duration } from "@/components/formatters/Duration";

interface LessonFormatterProps {
  lessons: any[];
  variant?: "card" | "row";
}

export function LessonFormatter({ 
  lessons, 
  variant = "row"
}: LessonFormatterProps) {
  if (lessons.length === 0) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    return `${day}-${month}`;
  };

  return (
    <div className="space-y-2 mt-3">
      {lessons.map((lesson) => (
        <div key={lesson.id} className="bg-background/50 rounded p-2 space-y-2">
          {/* Lesson info */}
          <div className="flex items-center gap-2 text-xs">
            <HeadsetIcon className="w-4 h-4 text-green-600" />
            <span className="font-medium flex-1">
              {lesson.teacher?.name || "Unknown Teacher"}
            </span>
            {lesson.commission && (
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                €{lesson.commission.price_per_hour}/h
              </span>
            )}
          </div>

          {/* Events for this lesson */}
          {lesson.events && lesson.events.length > 0 && (
            <div className="ml-6 space-y-1">
              {lesson.events.map((event: any) => (
                <div
                  key={event.id}
                  className="flex items-center gap-2 text-xs text-muted-foreground"
                >
                  <FlagIcon className="w-3 h-3" />
                  <Duration minutes={event.duration || 0} />
                  <span>{formatDate(event.date)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}