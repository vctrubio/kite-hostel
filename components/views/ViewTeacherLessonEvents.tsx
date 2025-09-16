"use client";

import { KiteIcon, FlagIcon } from "@/svgs";
import { Duration } from "@/components/formatters/Duration";
import { LessonStatusLabel } from "@/components/label/LessonStatusLabel";

interface LessonEvent {
  id: string;
  date: string;
  startTime: string;
  duration: number;
  location: string;
  status: string;
}

interface Lesson {
  id: string;
  status: string;
  teacher?: {
    id: string;
    name: string;
  } | null;
  commission?: {
    price_per_hour: number;
  } | null;
  events?: LessonEvent[];
}

interface ViewTeacherLessonEventsProps {
  lessons: Lesson[];
}

export function ViewTeacherLessonEvents({ lessons }: ViewTeacherLessonEventsProps) {
  if (!lessons || lessons.length === 0) {
    return null;
  }


  const formatEventDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', { 
      weekday: 'short', 
      day: '2-digit', 
      month: 'short' 
    });
  };

  return (
    <div className="space-y-3">
      {lessons.map((lesson) => (
        <div key={lesson.id} className="space-y-2">
          {/* Teacher/Lesson Header */}
          <div className="flex items-center justify-between p-2 bg-background rounded border">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">
                {lesson.teacher?.name || "Unassigned Teacher"}
              </span>
              <LessonStatusLabel
                lessonId={lesson.id}
                currentStatus={lesson.status}
                lessonEvents={lesson.events || []}
              />
              {lesson.commission && (
                <span className="text-xs text-muted-foreground">
                  €{lesson.commission.price_per_hour}/h
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {lesson.events && lesson.events.length > 0 ? (
                <div className="flex items-center gap-1">
                  <KiteIcon className="w-3 h-3 text-teal-500" />
                  <span className="text-xs text-muted-foreground">
                    {lesson.events.length} event{lesson.events.length === 1 ? "" : "s"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    (<Duration minutes={lesson.events.reduce((sum, event) => sum + event.duration, 0)} />)
                  </span>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground italic">
                  No events
                </span>
              )}
            </div>
          </div>

          {/* Events for this lesson */}
          {lesson.events && lesson.events.length > 0 && (
            <div className="ml-4 space-y-1">
              {lesson.events.map((event) => (
                <div key={event.id} className="flex items-center gap-2">
                  <FlagIcon className="w-3 h-3 text-cyan-500 flex-shrink-0" />
                  <div className="flex items-center gap-2 p-2 bg-background/50 rounded border text-xs flex-1">
                    <span className="font-medium">
                      {formatEventDate(event.date)}
                    </span>
                    <span>{event.startTime}</span>
                    <span className="px-2 py-1 bg-teal-100 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 rounded">
                      <Duration minutes={event.duration} />
                    </span>
                    <span className="text-muted-foreground">
                      {event.location}
                    </span>
                    <span className="px-2 py-1 bg-muted rounded text-xs ml-auto">
                      {event.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}