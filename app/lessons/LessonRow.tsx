"use client";

import { format } from "date-fns";
import { InferSelectModel } from "drizzle-orm";
import { Lesson, Teacher, Event } from "@/drizzle/migrations/schema";
import { Duration } from "@/components/formatters/Duration";
import { PackageView } from "@/components/views/PackageView";

import { LessonStatusLabel } from "@/components/label/LessonStatusLabel";

interface LessonRowProps {
  lesson: InferSelectModel<typeof Lesson> & {
    teacher: InferSelectModel<typeof Teacher>;
    events: InferSelectModel<typeof Event>[];
    totalEventHours: number;
    packageCapacity: number | null;
    packageDuration: number | null;
  };
}

export function LessonRow({ lesson }: LessonRowProps) {
  return (
    <tr>
      <td className="py-2 px-4 text-left border-b border-r border-border text-foreground">{lesson.teacher.name}</td>
      <td className="py-2 px-4 text-left border-b border-r border-border text-foreground">
        <LessonStatusLabel lessonId={lesson.id} currentStatus={lesson.status} />
      </td>
      <td className="py-2 px-4 text-left border-b border-r border-border text-foreground">
        {lesson.events.length > 0 ? (
          <ul className="list-disc list-inside">
            {lesson.events.map((event) => (
              <li key={event.id}>
                {format(new Date(event.date), "PPP")} - {event.location} ({event.duration} min)
              </li>
            ))}
          </ul>
        ) : (
          "No events"
        )}
      </td>
      <td className="py-2 px-4 text-left border-b border-r border-border text-foreground"><Duration minutes={lesson.totalEventHours * 60} /></td>
      <td className="py-2 px-4 text-left border-b border-r border-border text-foreground">
        <PackageView capacity={lesson.packageCapacity} duration={lesson.packageDuration} />
      </td>
    </tr>
  );
}
