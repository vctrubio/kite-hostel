"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Send } from "lucide-react";
import { BookmarkIcon, HelmetIcon, HeadsetIcon } from "@/svgs";
import { DateSince } from "@/components/formatters/DateSince";
import { Duration } from "@/components/formatters/Duration";
import { FormatDateRange } from "@/components/formatters/DateRange";
import { BookingStatusLabel } from "@/components/label/BookingStatusLabel";
import { BookingToLessonModal } from "@/components/modals/BookingToLessonModal";
import { LessonView } from "@/components/views/LessonView";
import { BookingWithRelations } from "@/backend/types";
import { getUserWalletName } from "@/lib/getters";

interface BookingRowProps {
  data: BookingWithRelations;
  expandedRow: string | null;
  setExpandedRow: (id: string | null) => void;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
}

export function BookingRow({
  data: booking,
  expandedRow,
  setExpandedRow,
}: BookingRowProps) {
  const isExpanded = expandedRow === booking.id;
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleExpand = () => {
    if (isExpanded) {
      setExpandedRow(null);
    } else {
      setExpandedRow(booking.id);
    }
  };

  return (
    <>
      <tr className="border-b border-border">
        <td className="py-2 px-4 text-left">
          <FormatDateRange
            startDate={booking.date_start}
            endDate={booking.date_end}
          />
        </td>
        <td className="py-2 px-4 text-left">
          <BookingStatusLabel
            bookingId={booking.id}
            currentStatus={booking.status}
          />
        </td>
        <td className="py-2 px-4 text-left">
          {getUserWalletName(booking.reference)}
        </td>
        <td className="py-2 px-4 text-left">
          {booking.students && booking.students.length > 0 ? (
            <span>
              {booking.students.map((bs: any) => bs.student.name).join(", ")}
            </span>
          ) : (
            <span>No students</span>
          )}
        </td>
        <td className="py-2 px-4 text-left">
          {booking.lessons && booking.lessons.length > 0 ? (
            <LessonView booking={booking} />
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedRow(null); // Collapse row if expanded
                  setIsModalOpen(true);
                }}
              >
                Add Lesson Plan
              </Button>
              {isModalOpen && (
                <BookingToLessonModal
                  bookingId={booking.id}
                  onClose={() => setIsModalOpen(false)}
                />
              )}
            </>
          )}
        </td>
        <td className="py-2 px-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleExpand}
              className="h-8 w-8"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/bookings/${booking.id}`);
              }}
              className="h-8 w-8"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={6} className="py-4 px-4 bg-background/30">
            <div className="w-full space-y-3">
              {/* Package Info - First Line */}
              {booking.package && (
                <div className="flex items-center gap-4 w-full p-3 bg-background/50 rounded-md border-l-4 border-amber-500">
                  <BookmarkIcon className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded text-sm font-medium">
                      <Duration minutes={booking.package.duration || 0} />
                    </span>
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded text-sm font-medium">
                      €{booking.package.price_per_student}/student
                    </span>
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded text-sm font-medium">
                      €
                      {booking.package.duration
                        ? Math.round(
                          (booking.package.price_per_student /
                            (booking.package.duration / 60)) *
                          100,
                        ) / 100
                        : 0}
                      /h
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Students: {booking.package.capacity_students}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Kites: {booking.package.capacity_kites}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Created:{" "}
                      {new Date(booking.created_at).toLocaleDateString()}
                    </span>
                    {booking.package.description && (
                      <span className="text-sm text-muted-foreground italic">
                        "{booking.package.description}"
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Students - Second Line */}
              <div className="flex items-center gap-4 w-full p-3 bg-background/50 rounded-md border-l-4 border-yellow-500">
                <div className="flex items-center gap-2 flex-wrap">
                  {booking.students && booking.students.length > 0 ? (
                    booking.students.map((bs: any) => (
                      <button
                        key={bs.student.id}
                        onClick={() =>
                          router.push(`/students/${bs.student.id}`)
                        }
                        className="flex items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 rounded text-sm font-medium hover:bg-yellow-200 dark:hover:bg-yellow-900/30 transition-colors"
                      >
                        <HelmetIcon className="w-4 h-4" />
                        {bs.student.name}
                      </button>
                    ))
                  ) : (
                    <div className="flex items-center gap-2">
                      <HelmetIcon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        No students assigned
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Lessons - Third Line */}
              {booking.lessons && booking.lessons.length > 0 && (
                <div className="w-full p-3 bg-background/50 rounded-md border-l-4 border-green-500">
                  <div className="space-y-2">
                    {booking.lessons.map((lesson: any) => (
                      <div key={lesson.id} className="flex items-center gap-4">
                        <div className="flex items-center gap-2 min-w-0">
                          <HeadsetIcon className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-green-600">
                            {lesson.teacher?.name || "Unassigned"}
                          </span>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${lesson.status === "planned"
                              ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                              : lesson.status === "completed"
                                ? "bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300"
                                : lesson.status === "cancelled"
                                  ? "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300"
                                  : lesson.status === "rest"
                                    ? "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                                    : lesson.status === "delegated"
                                      ? "bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300"
                                      : "bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300"
                              }`}
                          >
                            {lesson.status}
                          </span>
                        </div>
                        {lesson.events && lesson.events.length > 0 && (
                          <div className="flex items-center gap-2 flex-wrap">
                            {lesson.events.map((event: any) => (
                              <span
                                key={event.id}
                                className="px-2 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded text-xs font-medium flex items-center gap-1"
                              >
                                <span>
                                  {new Date(event.date).toLocaleDateString()}
                                </span>
                                <span>•</span>
                                <Duration minutes={event.duration || 0} />
                                <span>•</span>
                                <span>{event.location}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
