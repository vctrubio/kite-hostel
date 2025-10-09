"use client";

import { useState, useMemo } from "react";
import { Eye, EyeOff, Share, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { HeadsetIcon } from "@/svgs/HeadsetIcon";
import { FlagIcon } from "@/svgs/FlagIcon";
import { KiteIcon } from "@/svgs/KiteIcon";
import { PaymentIcon } from "@/svgs/PaymentIcon";
import { SeparatorIcon } from "@/svgs";
import { TeacherPortal as TeacherPortalClass } from "@/backend/TeacherPortal";
import { type TeacherPortalData } from "@/actions/teacher-actions";
import { useTeacherEventListener } from "@/lib/useTeacherEventListener";
import TeacherEventCard from "@/components/cards/TeacherEventCard";
import TeacherLessonCard from "@/components/cards/TeacherLessonCard";
import TeacherPaymentCard from "@/components/cards/TeacherPaymentCard";
import { SingleDatePicker } from "@/components/pickers/single-date-picker";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, BarChart3, Clock, TrendingUp, TrendingDown, Euro } from "lucide-react";
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
  totalPayments,
  balance,
  teacherId,
}: {
  name: string;
  lessonsCount: number;
  eventsCount: number;
  totalDuration: number;
  totalEarnings: number;
  totalPayments: number;
  balance: number;
  teacherId: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center space-x-4">
            <Link href={`/teachers/${teacherId}`}>
              <div className="p-2 rounded-lg border-2 border-transparent cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200">
                <HeadsetIcon className="h-8 w-8 text-green-600" />
              </div>
            </Link>
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

            <div className="flex flex-col gap-2">
              {/* First row: Lessons, Events, Duration */}
              <div className="flex items-center justify-end gap-4">
                <div className="flex items-center gap-1">
                  <FlagIcon className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">{lessonsCount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <KiteIcon className="w-4 h-4 text-green-800" />
                  <span className="text-sm font-medium">{eventsCount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium">
                    <Duration minutes={totalDuration} />
                  </span>
                </div>
              </div>
              
              {/* Second row: Financial stats */}
              <div className="flex items-center justify-end gap-4">
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">
                    €{Math.round(totalEarnings)}
                  </span>
                </div>
                {totalPayments > 0 && (
                  <>
                    <div className="flex items-center gap-1">
                      <TrendingDown className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium">
                        €{Math.round(totalPayments)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Euro className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium">
                        €{Math.round(balance)}
                      </span>
                    </div>
                  </>
                )}
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
              teacherId={teacherPortal.getTeacher().id}
              teacherKites={teacherPortal.getTeacher().kites}
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

const PaymentsView = ({
  teacherPortal,
}: {
  teacherPortal: TeacherPortalClass;
}) => {
  const teacher = teacherPortal.getTeacher();
  
  // Sort payments by most recent first
  const sortedPayments = [...teacher.payments].sort((a, b) => {
    const dateA = new Date(a.created_at || "");
    const dateB = new Date(b.created_at || "");
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <div className="space-y-4">
      {sortedPayments.length > 0 ? (
        <div className="space-y-4">
          {sortedPayments.map((payment) => (
            <TeacherPaymentCard
              key={payment.id}
              payment={payment}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">No payments found</div>
      )}
    </div>
  );
};

export default function TeacherPortal({ teacherData }: TeacherPortalProps) {
  const [activeView, setActiveView] = useState<"daily" | "stats" | "payments">("daily");

  // Use real-time listener hook
  const { teacherData: realtimeTeacherData, isLoading, error } = useTeacherEventListener({
    teacherId: teacherData.id,
    initialData: teacherData,
  });

  const teacherPortal = useMemo(
    () => new TeacherPortalClass(realtimeTeacherData),
    [realtimeTeacherData],
  );
  const stats = teacherPortal.getStats();
  const tbcCount = teacherPortal.getTBCEventsCount();
  
  // Calculate financial stats
  const teacher = teacherPortal.getTeacher();
  const totalPayments = teacher.payments.reduce((sum, payment) => sum + payment.amount, 0);
  const balance = stats.totalEarnings - totalPayments;

  return (
    <div className="space-y-6">
      <TeacherHeader
        name={teacherPortal.getName()}
        lessonsCount={stats.lessonsCount}
        eventsCount={stats.eventsCount}
        totalDuration={stats.totalDuration}
        totalEarnings={stats.totalEarnings}
        totalPayments={totalPayments}
        balance={balance}
        teacherId={teacherPortal.getTeacher().id}
      />
      
      {/* TBC Events Notification */}
      {tbcCount > 0 && (
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">
                You have {tbcCount} event{tbcCount > 1 ? 's' : ''} marked as TBC that need{tbcCount === 1 ? 's' : ''} completion
              </span>
            </div>
          </CardContent>
        </Card>
      )}

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

        <button
          onClick={() => setActiveView("payments")}
          className={`flex items-center gap-2 px-4 py-2 font-medium text-sm transition-colors ${activeView === "payments"
            ? "text-blue-600 border-b-2 border-blue-600"
            : "text-gray-600 hover:text-gray-800"
            }`}
        >
          <PaymentIcon className="w-4 h-4" />
          Payments
        </button>
      </div>

      <div className="min-h-96">
        {activeView === "daily" ? (
          <DailyView teacherPortal={teacherPortal} />
        ) : activeView === "stats" ? (
          <StatsView teacherPortal={teacherPortal} />
        ) : (
          <PaymentsView teacherPortal={teacherPortal} />
        )}
      </div>
    </div>
  );
}
