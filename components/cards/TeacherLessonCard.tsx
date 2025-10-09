"use client";

import { useState } from "react";
import { Duration } from "@/components/formatters/Duration";
import { DateTime } from "@/components/formatters/DateTime";
import { ChevronDown, ChevronUp, Calendar, Clock, CheckCircle, AlertCircle, HelpCircle } from "lucide-react";
import { HelmetIcon } from "@/svgs/HelmetIcon";
import { KiteIcon } from "@/svgs/KiteIcon";
import { type LessonWithDetails } from "@/backend/TeacherPortal";
import { EventStatusLabel } from "@/components/label/EventStatusLabel";

interface TeacherLessonCardProps {
  lessonDetail: LessonWithDetails;
  commission: { price_per_hour: number } | undefined;
}

// Helper function for full name
const getFullName = (name: string, lastName?: string | null) => {
  return lastName ? `${name} ${lastName}` : name;
};

// Helper function to format hours without unnecessary decimals
const formatHours = (hours: number) => {
  return hours % 1 === 0 ? hours.toString() : hours.toFixed(1);
};

// Helper function to calculate hours by status
const calculateHoursByStatus = (events: LessonWithDetails["events"], status: string) => {
  return events
    .filter((event) => event.status === status)
    .reduce((sum, event) => sum + event.duration, 0) / 60;
};

// Helper function to render status line in earnings
const renderStatusLine = (
  events: LessonWithDetails["events"], 
  status: "completed" | "planned" | "tbc", 
  commissionRate: number
) => {
  const hours = calculateHoursByStatus(events, status);
  if (hours <= 0) return null;

  const icons = {
    completed: <CheckCircle className="w-3 h-3" />,
    planned: <AlertCircle className="w-3 h-3" />,
    tbc: <HelpCircle className="w-3 h-3" />
  };

  const colors = {
    completed: "text-green-600",
    planned: "text-blue-600", 
    tbc: "text-purple-600"
  };

  return (
    <div className={`flex items-center gap-1 justify-end ${colors[status]}`}>
      {icons[status]}
      <span>{formatHours(hours)}h × €{commissionRate}/h</span>
    </div>
  );
};

// Common section wrapper component
const SectionWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="p-4 border-b border-border">
    {children}
  </div>
);

// Common icon row component
const IconRow = ({ 
  icons, 
  content 
}: { 
  icons: React.ReactNode; 
  content: React.ReactNode; 
}) => (
  <div className="flex items-center gap-3">
    <div className="flex items-center gap-2">{icons}</div>
    {content}
  </div>
);

export default function TeacherLessonCard({
  lessonDetail,
  commission,
}: TeacherLessonCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const completedHours = calculateHoursByStatus(lessonDetail.events, "completed");

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
            <div className="text-xs space-y-1">
              {renderStatusLine(lessonDetail.events, "completed", commissionRate)}
              {renderStatusLine(lessonDetail.events, "planned", commissionRate)}
              {renderStatusLine(lessonDetail.events, "tbc", commissionRate)}
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
      <SectionWrapper>
        <IconRow
          icons={lessonDetail.students.map((_, index) => (
            <HelmetIcon key={index} className="w-5 h-5 text-yellow-500" />
          ))}
          content={
            <div className="flex flex-wrap gap-1">
              {lessonDetail.students.map((student, index) => (
                <span key={student.student.id} className="text-sm font-medium">
                  {getFullName(student.student.name, student.student.last_name)}
                  {index < lessonDetail.students.length - 1 && ", "}
                </span>
              ))}
            </div>
          }
        />
      </SectionWrapper>

      {/* Events Toggle */}
      <SectionWrapper>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full text-left"
        >
          <IconRow
            icons={Array.from({ length: lessonDetail.events.length }).map((_, index) => (
              <KiteIcon key={index} className="w-5 h-5 text-green-600" />
            ))}
            content={
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  <Duration minutes={totalEventDuration} />
                </span>
              </div>
            }
          />
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {isExpanded && (
          <div className="mt-4 space-y-3">
            {lessonDetail.events
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Sort by date, newest first
              .map((event) => (
                <div
                key={event.id}
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <KiteIcon className="w-4 h-4 text-green-600" />

                <div className="flex items-center gap-4 text-sm flex-1">
                  <DateTime dateString={event.date} formatType="date" />
                  <DateTime dateString={event.date} formatType="time" />

                  <div className="text-sm font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <Duration minutes={event.duration} />
                  </div>

                  {event.kites.length > 0 && (
                    <span className="text-gray-600 dark:text-gray-400">
                      {event.kites
                        .map((k) => `${k.kite.model} ${k.kite.size}m`)
                        .join(", ")}
                    </span>
                  )}
                </div>

                <div className="flex-shrink-0">
                  <EventStatusLabel 
                    eventId={event.id}
                    currentStatus={event.status}
                  />
                </div>
                </div>
              ))}
          </div>
        )}
      </SectionWrapper>
    </div>
  );
}
