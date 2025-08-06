"use client";

import { InferSelectModel } from "drizzle-orm";
import { Lesson, Teacher, Event } from "@/drizzle/migrations/schema";
import { LessonRow } from "./LessonRow";

interface LessonsTableProps {
  lessons: (InferSelectModel<typeof Lesson> & {
    teacher: InferSelectModel<typeof Teacher>;
    events: InferSelectModel<typeof Event>[];
    totalEventHours: number;
    packageCapacity: number | null;
    packageDuration: number | null;
  })[];
}

export function LessonsTable({ lessons }: LessonsTableProps) {
  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="min-w-full bg-card">
        <thead>
          <tr>
            <th rowSpan={2} className="py-3 px-4 text-left text-sm font-semibold text-foreground align-bottom border-b-2 border-r border-border">Teacher Name</th>
            <th rowSpan={2} className="py-3 px-4 text-left text-sm font-semibold text-foreground align-bottom border-b-2 border-r border-border">Status</th>
            <th rowSpan={2} className="py-3 px-4 text-left text-sm font-semibold text-foreground align-bottom border-b-2 border-r border-border">Events</th>
            <th rowSpan={2} className="py-3 px-4 text-left text-sm font-semibold text-foreground align-bottom border-b-2 border-r border-border">Total Event Hours</th>
            <th rowSpan={2} className="py-3 px-4 text-left text-sm font-semibold text-foreground align-bottom border-b-2 border-border">Package</th>
          </tr>
        </thead>
        <tbody>
          {lessons.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-4 px-4 text-center text-muted-foreground border-t border-border">
                No lessons found.
              </td>
            </tr>
          ) : (
            lessons.map((lesson) => (
              <LessonRow key={lesson.id} lesson={lesson} />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
