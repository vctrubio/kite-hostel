"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus, ChevronDown, ChevronUp, Filter } from "lucide-react";
import { BookmarkIcon, HelmetIcon, HeadsetIcon } from "@/svgs";
import { FormatDateRange } from "@/components/formatters/DateRange";
import { Duration } from "@/components/formatters/Duration";
import { BookingStatusLabel } from "@/components/label/BookingStatusLabel";
import { LessonStatusLabel } from "@/components/label/LessonStatusLabel";
import { BookingToLessonModal } from "@/components/modals/BookingToLessonModal";
import { BookingWithRelations } from "@/backend/types";
import { getUserWalletName } from "@/lib/getters";

interface Booking4LessonTableProps {
  bookings: BookingWithRelations[];
  onRefresh?: () => void;
}

type FilterType = "all" | "no-lessons" | "with-lessons" | "active-only";

export function Booking4LessonTable({
  bookings,
  onRefresh,
}: Booking4LessonTableProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null,
  );
  const [filter, setFilter] = useState<FilterType>("all");

  const filteredBookings = useMemo(() => {
    switch (filter) {
      case "no-lessons":
        return bookings.filter(
          (booking) => !booking.lessons || booking.lessons.length === 0,
        );
      case "with-lessons":
        return bookings.filter(
          (booking) => booking.lessons && booking.lessons.length > 0,
        );
      case "active-only":
        return bookings.filter((booking) => booking.status === "active");
      default:
        return bookings;
    }
  }, [bookings, filter]);

  const toggleExpand = (bookingId: string) => {
    if (expandedRow === bookingId) {
      setExpandedRow(null);
    } else {
      setExpandedRow(bookingId);
    }
  };

  const handleAddLesson = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm">
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <HeadsetIcon className="h-5 w-5 text-cyan-500" />
              Bookings for Lesson Management
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              ({filteredBookings.length} of {bookings.length})
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as FilterType)}
              className="text-sm border border-border rounded px-2 py-1 bg-background"
            >
              <option value="all">All Bookings</option>
              <option value="no-lessons">No Lessons</option>
              <option value="with-lessons">With Lessons</option>
              <option value="active-only">Active Only</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr className="border-b border-border">
              <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">
                Booking Period
              </th>
              <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">
                Status
              </th>
              <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">
                Reference
              </th>
              <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">
                Students
              </th>
              <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">
                Lessons
              </th>
              <th className="py-3 px-4 text-center text-sm font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-8 px-4 text-center text-muted-foreground"
                >
                  {bookings.length === 0
                    ? "No bookings found"
                    : "No bookings match the selected filter"}
                </td>
              </tr>
            ) : (
              //BUG: Each child in list shuold have unique key
              filteredBookings.map((booking) => (
                <>
                  <tr
                    key={booking.id}
                    className="border-b border-border hover:bg-muted/20"
                  >
                    <td className="py-3 px-4">
                      <FormatDateRange
                        startDate={booking.date_start}
                        endDate={booking.date_end}
                      />
                    </td>
                    <td className="py-3 px-4">
                      <BookingStatusLabel
                        bookingId={booking.id}
                        currentStatus={booking.status}
                      />
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {getUserWalletName(booking.reference) || "No reference"}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <HelmetIcon className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">
                          {booking.students && booking.students.length > 0
                            ? booking.students
                              .map((bs: any) => bs.student.name)
                              .join(", ")
                            : "No students"}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {booking.lessons && booking.lessons.length > 0 ? (
                        <div className="flex items-center gap-2">
                          <HeadsetIcon className="h-4 w-4 text-cyan-500" />
                          <span className="text-sm font-medium">
                            {booking.lessons.length} lesson
                            {booking.lessons.length === 1 ? "" : "s"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground italic">
                          No lessons
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1">
                        {(!booking.lessons || booking.lessons.length === 0) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddLesson(booking.id)}
                            className="text-xs"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add Lesson
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpand(booking.id)}
                        >
                          {expandedRow === booking.id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>

                  {expandedRow === booking.id && (
                    <tr>
                      <td colSpan={6} className="py-4 px-4 bg-background/30">
                        <div className="space-y-4">
                          {/* Package Information */}
                          {booking.package && (
                            <div className="flex items-center gap-4 p-3 bg-background/50 rounded-md border-l-4 border-amber-500">
                              <BookmarkIcon className="w-5 h-5 text-amber-500 flex-shrink-0" />
                              <div className="flex items-center gap-4 flex-wrap">
                                <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded text-sm font-medium">
                                  <Duration
                                    minutes={booking.package.duration || 0}
                                  />
                                </span>
                                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded text-sm font-medium">
                                  €{booking.package.price_per_student}/student
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  Students: {booking.package.capacity_students}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  Kites: {booking.package.capacity_kites}
                                </span>
                                {booking.package.description && (
                                  <span className="text-sm text-muted-foreground italic">
                                    "{booking.package.description}"
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Students List */}
                          {booking.students && booking.students.length > 0 && (
                            <div className="p-3 bg-background/50 rounded-md border-l-4 border-yellow-500">
                              <div className="flex flex-wrap gap-2">
                                {booking.students.map((bs: any) => (
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

                          {/* Lessons Details */}
                          {booking.lessons && booking.lessons.length > 0 ? (
                            <div className="p-3 bg-background/50 rounded-md border-l-4 border-cyan-500">
                              <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                                <HeadsetIcon className="w-4 h-4 text-cyan-500" />
                                Lessons ({booking.lessons.length})
                              </h4>
                              <div className="space-y-3">
                                {booking.lessons.map((lesson: any) => (
                                  <div
                                    key={lesson.id}
                                    className="flex items-center justify-between p-2 bg-background rounded border"
                                  >
                                    <div className="flex items-center gap-3">
                                      <span className="text-sm font-medium">
                                        {lesson.teacher?.name ||
                                          "Unassigned Teacher"}
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
                                      {lesson.events &&
                                        lesson.events.length > 0 && (
                                          <span className="text-xs text-muted-foreground">
                                            {lesson.events.length} event
                                            {lesson.events.length === 1
                                              ? ""
                                              : "s"}
                                          </span>
                                        )}
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Add Another Lesson Button */}
                              <div className="mt-3 pt-3 border-t border-border">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleAddLesson(booking.id)}
                                  className="text-xs w-full"
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Add Another Lesson
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="p-3 bg-background/50 rounded-md border-l-4 border-gray-500">
                              <div className="text-center">
                                <p className="text-sm text-muted-foreground mb-3">
                                  No lessons assigned to this booking
                                </p>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleAddLesson(booking.id)}
                                  className="text-xs"
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Create First Lesson
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for Creating Lessons */}
      {isModalOpen && selectedBookingId && (
        <BookingToLessonModal
          bookingId={selectedBookingId}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedBookingId(null);
            // Refresh the bookings after modal closes (lesson might have been created)
            if (onRefresh) {
              onRefresh();
            }
          }}
        />
      )}
    </div>
  );
}
