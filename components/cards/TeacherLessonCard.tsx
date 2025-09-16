"use client";

import { useState } from "react";
import { Duration } from "@/components/formatters/Duration";
import { DateTime } from "@/components/formatters/DateTime";
import { ChevronDown, ChevronUp, Calendar } from "lucide-react";
import { HelmetIcon } from "@/svgs/HelmetIcon";
import { KiteIcon } from "@/svgs/KiteIcon";
import { type LessonWithDetails } from "@/backend/TeacherPortal";

interface TeacherLessonCardProps {
  lessonDetail: LessonWithDetails;
  commission: { price_per_hour: number } | undefined;
}

export default function TeacherLessonCard({
  lessonDetail,
  commission,
}: TeacherLessonCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const completedHours =
    lessonDetail.events
      .filter((event) => event.status === "completed")
      .reduce((sum, event) => sum + event.duration, 0) / 60;

  const totalEventDuration = lessonDetail.events.reduce(
    (sum, event) => sum + event.duration,
    0,
  );

  const commissionRate = commission?.price_per_hour || 0;
  const earnings = completedHours * commissionRate;

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Header with Package Info */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b border-border">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-medium text-lg">
              {lessonDetail.packageInfo.description || "Lesson Package"}
            </h3>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Duration: <Duration minutes={lessonDetail.packageInfo.duration} />{" "}
              • {lessonDetail.packageInfo.capacity_kites} kites
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-green-600">
              €{Math.round(earnings)}
            </div>
            <div className="text-xs text-gray-500">
              {completedHours.toFixed(1)}h × €{commissionRate}/h
            </div>
          </div>
        </div>

        {/* Booking Period */}
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-blue-500" />
          <DateTime
            dateString={lessonDetail.lesson.booking.date_start}
            formatType="date"
          />{" "}
          -
          <DateTime
            dateString={lessonDetail.lesson.booking.date_end}
            formatType="date"
          />
        </div>
      </div>

      {/* Students */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-medium text-sm">Students:</span>
        </div>
        <div className="flex items-center gap-2">
          {lessonDetail.students.map((_, index) => (
            <HelmetIcon key={index} className="w-5 h-5 text-yellow-500" />
          ))}
          <span className="text-sm">
            {lessonDetail.students.map((s) => s.student.name).join(", ")}
          </span>
        </div>
      </div>

      {/* Events Toggle */}
      <div className="p-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full text-left"
        >
          <span className="font-medium">
            Events ({lessonDetail.events.length}) •{" "}
            <Duration minutes={totalEventDuration} />
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {isExpanded && (
          <div className="mt-4 space-y-3">
            {lessonDetail.events.map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <KiteIcon className="w-4 h-4 text-green-600" />

                <div className="flex items-center gap-4 text-sm flex-1">
                  <DateTime dateString={event.date} formatType="date" />
                  <DateTime dateString={event.date} formatType="time" />

                  <span
                    className={`px-2 py-1 text-xs rounded-full ${event.status === "completed"
                      ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                      : event.status === "planned"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
                        : event.status === "tbc"
                          ? "bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100"
                          : "bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100"
                      }`}
                  >
                    {event.status}
                  </span>

                  {event.kites.length > 0 && (
                    <span className="text-gray-600 dark:text-gray-400">
                      {event.kites
                        .map((k) => `${k.kite.model} ${k.kite.size}m`)
                        .join(", ")}
                    </span>
                  )}
                </div>

                <div className="text-sm font-medium">
                  <Duration minutes={event.duration} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
