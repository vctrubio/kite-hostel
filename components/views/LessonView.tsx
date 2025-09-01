"use client";

import { HeadsetIcon } from "@/svgs/HeadsetIcon";
import { Duration } from "@/components/formatters/Duration";
import { LessonProgressBar } from "@/components/formatters/LessonProgressBar";
import { BookingWithRelations } from "@/backend/types";

interface LessonViewProps {
  booking: BookingWithRelations;
}

export function LessonView({ booking }: LessonViewProps) {
  const hasLessons = booking.lessons && booking.lessons.length > 0;
  const activeLesson = booking.lessons.find(
    (lesson) => lesson.status === "planned" || lesson.status === "rest",
  );
  const teacherName =
    activeLesson?.teacher?.name ||
    booking.lessons?.find((lesson) => lesson.teacher)?.teacher.name ||
    "N/A";
  console.log("activeLesson:", activeLesson);
  console.log("booking.lessons:", booking.lessons);

  const totalLessonEventDuration =
    booking.lessons?.reduce((sum, lesson) => {
      return (
        sum +
        (lesson.events?.reduce(
          (eventSum, event) => eventSum + event.duration,
          0,
        ) || 0)
      );
    }, 0) || 0;

  const packageDuration = booking.package?.duration || 0;

  if (!hasLessons) {
    return null; // Or some placeholder if needed
  }

  return (
    <div className="flex items-center space-x-2">
      <span className="flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-700 border border-gray-200">
        <HeadsetIcon className="w-3 h-3" />
        <span>{teacherName}</span>
      </span>
      <LessonProgressBar
        usedMinutes={totalLessonEventDuration}
        totalMinutes={packageDuration}
      />
      <span className="text-xs text-foreground">
        <Duration minutes={totalLessonEventDuration} /> /{" "}
        <Duration minutes={packageDuration} />
      </span>
    </div>
  );
}
