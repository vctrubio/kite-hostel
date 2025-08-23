"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus, ChevronDown, ChevronUp, Filter, Calendar } from "lucide-react";
import { KiteIcon, HelmetIcon, HeadsetIcon, BookingIcon } from "@/svgs";
import { FormatDateRange } from "@/components/formatters/DateRange";
import { Duration } from "@/components/formatters/Duration";
import { LessonStatusLabel } from "@/components/label/LessonStatusLabel";
import { BookingStatusLabel } from "@/components/label/BookingStatusLabel";
import EventToTeacherModal from "@/components/modals/EventToTeacherModal";
import { TeacherSchedule } from "@/backend/TeacherSchedule";
import { getUserWalletName } from "@/lib/getters";
import { LessonStatus, type Location } from "@/lib/constants";
import { type LessonWithDetails } from "@/actions/lesson-actions";

type FilterType =
  | "all"
  | "no-events"
  | "with-events"
  | "planned-only"
  | "active-bookings";

interface LessonFilterControlsProps {
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  lessonsCount: number;
  filteredLessonsCount: number;
}

function LessonFilterControls({
  filter,
  onFilterChange,
  lessonsCount,
  filteredLessonsCount,
}: LessonFilterControlsProps) {
  return (
    <div className="px-4 py-3 border-b border-border">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <KiteIcon className="h-5 w-5 text-teal-500" />
            Lessons for Event Management
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            ({filteredLessonsCount} of {lessonsCount})
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={filter}
              onChange={(e) => onFilterChange(e.target.value as FilterType)}
              className="text-sm border border-border rounded px-2 py-1 bg-background"
            >
              <option value="all">All Lessons</option>
              <option value="no-events">No Events</option>
              <option value="with-events">With Events</option>
              <option value="planned-only">Planned Only</option>
              <option value="active-bookings">Active Bookings</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

function LessonTableHeader() {
  return (
    <thead className="bg-muted/50">
      <tr className="border-b border-border">
        <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">
          Teacher
        </th>
        <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">
          Lesson Status
        </th>
        <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">
          Booking Period
        </th>
        <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">
          Students
        </th>
        <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">
          Events
        </th>
        <th className="py-3 px-4 text-center text-sm font-medium text-muted-foreground">
          Actions
        </th>
      </tr>
    </thead>
  );
}

interface LessonTableRowProps {
  lesson: LessonWithDetails;
  expandedRow: string | null;
  onExpand: (lessonId: string) => void;
  onAddEvent: (lesson: LessonWithDetails) => void;
}

function LessonTableRow({
  lesson,
  expandedRow,
  onExpand,
  onAddEvent,
}: LessonTableRowProps) {
  const isExpanded = expandedRow === lesson.id;

  const formatEventDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    });
  };

  return (
    <React.Fragment>
      <tr className="border-b border-border hover:bg-muted/20">
        <td className="py-3 px-4">
          <div className="flex items-center gap-2">
            <HeadsetIcon className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">
              {lesson.teacher?.name || "Unassigned"}
            </span>
          </div>
        </td>
        <td className="py-3 px-4">
          <LessonStatusLabel
            lessonId={lesson.id}
            currentStatus={lesson.status}
            lessonEvents={lesson.events}
          />
        </td>
        <td className="py-3 px-4">
          <FormatDateRange
            startDate={lesson.booking.date_start}
            endDate={lesson.booking.date_end}
          />
        </td>
        <td className="py-3 px-4">
          <div className="flex items-center gap-2">
            <HelmetIcon className="h-4 w-4 text-yellow-500" />
            <span className="text-sm">
              {lesson.booking.students
                ?.map((bs: any) => bs.student.name)
                .join(", ") || "No students"}
            </span>
          </div>
        </td>
        <td className="py-3 px-4">
          {lesson.events?.length > 0 ? (
            <div className="flex items-center gap-2">
              <KiteIcon className="h-4 w-4 text-teal-500" />
              <span className="text-sm font-medium">
                {lesson.events.length} event
                {lesson.events.length === 1 ? "" : "s"}
              </span>
              <span className="text-xs text-muted-foreground">
                (<Duration minutes={lesson.totalKiteEventDuration} />)
              </span>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground italic">
              No events
            </span>
          )}
        </td>
        <td className="py-3 px-4">
          <div className="flex items-center justify-center gap-1">
            {lesson.status === "planned" &&
              lesson.booking.status === "active" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAddEvent(lesson)}
                  className="text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Event
                </Button>
              )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onExpand(lesson.id)}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={6} className="py-4 px-4 bg-background/30">
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 bg-background/50 rounded-md border-l-4 border-blue-500">
                <BookingIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <div className="flex items-center gap-4 flex-wrap">
                  <BookingStatusLabel
                    bookingId={lesson.booking.id}
                    currentStatus={lesson.booking.status}
                  />
                  <span className="text-sm text-muted-foreground">
                    Ref:{" "}
                    {getUserWalletName(lesson.booking.reference) ||
                      "No reference"}
                  </span>
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded text-sm font-medium">
                    €{lesson.booking.package.price_per_student}/student
                  </span>
                  <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded text-sm font-medium">
                    <Duration minutes={lesson.booking.package.duration || 0} />
                  </span>
                </div>
              </div>
              {lesson.booking.students?.length > 0 && (
                <div className="p-3 bg-background/50 rounded-md border-l-4 border-yellow-500">
                  <div className="flex flex-wrap gap-2">
                    {lesson.booking.students.map((bs: any) => (
                      <div
                        key={bs.student.id}
                        className="flex items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 rounded text-sm font-medium"
                      >
                        <HelmetIcon className="w-4 h-4" />
                        {bs.student.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {lesson.events?.length > 0 ? (
                <div className="p-3 bg-background/50 rounded-md border-l-4 border-teal-500">
                  <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                    <KiteIcon className="w-4 h-4 text-teal-500" />
                    Events ({lesson.events.length})
                  </h4>
                  <div className="space-y-3">
                    {lesson.events.map((event: any) => (
                      <div
                        key={event.id}
                        className="flex items-center justify-between p-2 bg-background rounded border"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium">
                            {formatEventDate(event.date)}
                          </span>
                          <span className="text-sm">{event.startTime}</span>
                          <span className="px-2 py-1 bg-teal-100 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 rounded text-xs">
                            <Duration minutes={event.duration} />
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {event.location}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {event.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Total event time:
                      </span>
                      <span className="font-medium">
                        <Duration minutes={lesson.totalKiteEventDuration} /> of{" "}
                        <Duration minutes={lesson.packageDuration} />
                      </span>
                    </div>
                  </div>
                  {lesson.status === "planned" &&
                    lesson.booking.status === "active" && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onAddEvent(lesson)}
                          className="text-xs w-full"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Another Event
                        </Button>
                      </div>
                    )}
                </div>
              ) : (
                <div className="p-3 bg-background/50 rounded-md border-l-4 border-gray-500">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-3">
                      No events scheduled for this lesson
                    </p>
                    {lesson.status === "planned" &&
                      lesson.booking.status === "active" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onAddEvent(lesson)}
                          className="text-xs"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Create First Event
                        </Button>
                      )}
                  </div>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </React.Fragment>
  );
}

interface LessonTableProps {
  lessons: LessonWithDetails[];
  expandedRow: string | null;
  onExpand: (lessonId: string) => void;
  onAddEvent: (lesson: LessonWithDetails) => void;
}

function LessonTable({
  lessons,
  expandedRow,
  onExpand,
  onAddEvent,
}: LessonTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <LessonTableHeader />
        <tbody>
          {lessons.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                className="py-8 px-4 text-center text-muted-foreground"
              >
                No lessons match the selected filter
              </td>
            </tr>
          ) : (
            lessons.map((lesson) => (
              <LessonTableRow
                key={lesson.id}
                lesson={lesson}
                expandedRow={expandedRow}
                onExpand={onExpand}
                onAddEvent={onAddEvent}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

interface Lesson4EventTableProps {
  lessons: LessonWithDetails[];
  onRefresh?: () => void;
}

export function Lesson4EventTable({
  lessons,
  onRefresh,
}: Lesson4EventTableProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] =
    useState<LessonWithDetails | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");

  const allTeacherSchedules = useMemo(() => {
    const todayDate = new Date().toISOString().split("T")[0];
    return TeacherSchedule.createSchedulesFromLessons(todayDate, lessons);
  }, [lessons]);

  const filteredLessons = useMemo(() => {
    switch (filter) {
      case "no-events":
        return lessons.filter(
          (lesson) => !lesson.events || lesson.events.length === 0,
        );
      case "with-events":
        return lessons.filter(
          (lesson) => lesson.events && lesson.events.length > 0,
        );
      case "planned-only":
        return lessons.filter((lesson) => lesson.status === "planned");
      case "active-bookings":
        return lessons.filter((lesson) => lesson.booking.status === "active");
      default:
        return lessons;
    }
  }, [lessons, filter]);

  const toggleExpand = (lessonId: string) => {
    setExpandedRow(expandedRow === lessonId ? null : lessonId);
  };

  const handleAddEvent = (lesson: LessonWithDetails) => {
    setSelectedLesson(lesson);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedLesson(null);
    if (onRefresh) {
      onRefresh();
    } else {
      window.location.reload();
    }
  };

  const handleConfirmEvent = (eventData: any) => {
    console.log("Event created:", eventData);
    handleModalClose();
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm">
      <LessonFilterControls
        filter={filter}
        onFilterChange={setFilter}
        lessonsCount={lessons.length}
        filteredLessonsCount={filteredLessons.length}
      />
      <LessonTable
        lessons={filteredLessons}
        expandedRow={expandedRow}
        onExpand={toggleExpand}
        onAddEvent={handleAddEvent}
      />
      {isModalOpen && selectedLesson && (
        <EventToTeacherModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          lesson={{
            ...selectedLesson,
            students:
              selectedLesson.booking.students?.map((bs) => bs.student) || [],
            booking: selectedLesson.booking,
          }}
          teacherSchedule={allTeacherSchedules.get(selectedLesson.teacher?.id || '') || new TeacherSchedule(selectedLesson.teacher.id, selectedLesson.teacher.name, new Date().toISOString().split("T")[0], selectedLesson.booking)}
          controller={{
            flag: true,
            location: "Los Lances" as Location,
            submitTime: "11:00",
            durationCapOne: 120,
            durationCapTwo: 180,
            durationCapThree: 240,
          }}
          date={new Date().toISOString().split("T")[0]}
          onConfirm={handleConfirmEvent}
          remainingMinutes={
            selectedLesson.packageDuration -
            selectedLesson.totalKiteEventDuration
          }
          allowDateEdit={true}
        />
      )}
    </div>
  );
}
