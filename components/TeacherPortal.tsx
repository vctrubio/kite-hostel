"use client";

import { useState, useMemo } from "react";
import { Eye, EyeOff, Share } from "lucide-react";
import { HeadsetIcon } from "@/svgs/HeadsetIcon";
import { FlagIcon } from "@/svgs/FlagIcon";
import { KiteIcon } from "@/svgs/KiteIcon";
import { PaymentIcon } from "@/svgs/PaymentIcon";
import { SeparatorIcon } from "@/svgs";
import { TeacherPortal as TeacherPortalClass } from "@/backend/TeacherPortal";
import { type TeacherPortalData } from "@/actions/teacher-actions";
import TeacherEventCard from "@/components/cards/TeacherEventCard";
import TeacherLessonCard from "@/components/cards/TeacherLessonCard";
import { SingleDatePicker } from "@/components/pickers/single-date-picker";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, BarChart3, Clock } from "lucide-react";
import { Duration } from "@/components/formatters/Duration";

interface TeacherPortalProps {
  teacherData: TeacherPortalData;
}

function TeacherHeader({
  name,
  lessonsCount,
  eventsCount,
  totalDuration,
  totalEarnings,
}: {
  name: string;
  lessonsCount: number;
  eventsCount: number;
  totalDuration: number;
  totalEarnings: number;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center space-x-4">
            <HeadsetIcon className="h-8 w-8 text-green-600" />
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                {name}
              </h1>
            </div>
          </div>

          {/* Stats moved to where eye icon was */}
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center">
              <SeparatorIcon className="w-5 h-8 text-muted-foreground/30" />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <FlagIcon className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">{lessonsCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <KiteIcon className="w-4 h-4 text-green-800" />
                <span className="text-sm font-medium">{eventsCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium">
                  <Duration minutes={totalDuration} />
                </span>
              </div>
              <div className="flex items-center gap-1">
                <PaymentIcon className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium">
                  €{Math.round(totalEarnings)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const DailyView = ({
  teacherPortal,
}: {
  teacherPortal: TeacherPortalClass;
}) => {
  const [filterEnabled, setFilterEnabled] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  const allEvents = teacherPortal.getAllEvents();

  const filteredEvents = useMemo(() => {
    if (!filterEnabled || !selectedDate) return allEvents;

    return allEvents.filter((eventDetail) => {
      const eventDate = new Date(eventDetail.event.date);
      const filterDate = new Date(selectedDate);

      // Compare dates only (ignore time)
      return eventDate.toDateString() === filterDate.toDateString();
    });
  }, [allEvents, filterEnabled, selectedDate]);

  // Sort events by time (earliest first)
  const sortedEvents = useMemo(() => {
    return [...filteredEvents].sort((a, b) => {
      return (
        new Date(a.event.date).getTime() - new Date(b.event.date).getTime()
      );
    });
  }, [filteredEvents]);

  const handleToggleFilter = () => {
    setFilterEnabled(!filterEnabled);
  };

  const handleShareEvents = () => {
    if (filterEnabled && selectedDate) {
      // Filter is ON - share events for selected date
      teacherPortal.shareEventsViaWhatsApp(selectedDate);
    } else {
      // Filter is OFF - share ALL events (no date parameter)
      teacherPortal.shareEventsViaWhatsApp();
    }
  };

  return (
    <div className="space-y-6">
      {/* Date picker with filter toggle and share button on same line */}
      {filterEnabled ? (
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <SingleDatePicker
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
            />
          </div>
          <button
            onClick={handleToggleFilter}
            className="p-2 rounded-lg transition-all duration-200 bg-primary/15 text-primary border border-primary/30 shadow-lg"
            title="Date Filter On"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={handleShareEvents}
            className="p-2 rounded-lg transition-all duration-200 bg-green-100 text-green-700 border border-green-300 hover:bg-green-200"
            title="Share Events"
          >
            <Share className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="flex justify-end gap-2">
          <button
            onClick={handleToggleFilter}
            className="p-2 rounded-lg transition-all duration-200 bg-muted/80 text-muted-foreground border border-muted-foreground/20 hover:bg-muted"
            title="Date Filter Off"
          >
            <EyeOff className="h-4 w-4" />
          </button>
          <button
            onClick={handleShareEvents}
            className="p-2 rounded-lg transition-all duration-200 bg-green-100 text-green-700 border border-green-300 hover:bg-green-200"
            title="Share Today's Events"
          >
            <Share className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Events list */}
      {sortedEvents.length > 0 ? (
        <div className="space-y-3">
          {sortedEvents.map((eventDetail) => (
            <TeacherEventCard
              key={eventDetail.event.id}
              eventDetail={eventDetail}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          {filterEnabled && selectedDate
            ? `No events found for selected date`
            : "No events found"}
        </div>
      )}
    </div>
  );
};

const StatsView = ({
  teacherPortal,
}: {
  teacherPortal: TeacherPortalClass;
}) => {
  const lessonsWithDetails = teacherPortal.getLessonsWithDetails();
  const teacher = teacherPortal.getTeacher();

  return (
    <div className="space-y-4">
      {lessonsWithDetails.length > 0 ? (
        <div className="space-y-4">
          {lessonsWithDetails.map((lessonDetail) => {
            const commission = teacher.commissions.find(
              (c) => c.id === lessonDetail.lesson.commission_id,
            );
            return (
              <TeacherLessonCard
                key={lessonDetail.lesson.id}
                lessonDetail={lessonDetail}
                commission={commission}
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">No lessons found</div>
      )}
    </div>
  );
};

export default function TeacherPortal({ teacherData }: TeacherPortalProps) {
  const [activeView, setActiveView] = useState<"daily" | "stats">("daily");

  const teacherPortal = useMemo(
    () => new TeacherPortalClass(teacherData),
    [teacherData],
  );
  const stats = teacherPortal.getStats();

  return (
    <div className="space-y-6">
      <TeacherHeader
        name={teacherPortal.getName()}
        lessonsCount={stats.lessonsCount}
        eventsCount={stats.eventsCount}
        totalDuration={stats.totalDuration}
        totalEarnings={stats.totalEarnings}
      />

      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveView("daily")}
          className={`flex items-center gap-2 px-4 py-2 font-medium text-sm transition-colors ${activeView === "daily"
            ? "text-blue-600 border-b-2 border-blue-600"
            : "text-gray-600 hover:text-gray-800"
            }`}
        >
          <Calendar className="w-4 h-4" />
          Events
        </button>

        <button
          onClick={() => setActiveView("stats")}
          className={`flex items-center gap-2 px-4 py-2 font-medium text-sm transition-colors ${activeView === "stats"
            ? "text-blue-600 border-b-2 border-blue-600"
            : "text-gray-600 hover:text-gray-800"
            }`}
        >
          <BarChart3 className="w-4 h-4" />
          Stats
        </button>
      </div>

      <div className="min-h-96">
        {activeView === "daily" ? (
          <DailyView teacherPortal={teacherPortal} />
        ) : (
          <StatsView teacherPortal={teacherPortal} />
        )}
      </div>
    </div>
  );
}
