"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Send } from "lucide-react";
import { HelmetIcon, HeadsetIcon } from "@/svgs";
import { FormatDateRange } from "@/components/formatters/DateRange";
import { BookingStatusLabel } from "@/components/label/BookingStatusLabel";
import { BookingToLessonModal } from "@/components/modals/BookingToLessonModal";
import { BookingProgressBar } from "@/components/formatters/BookingProgressBar";
import { WhiteboardClass } from "@/backend/WhiteboardClass";
import { BookingWithRelations } from "@/backend/types";
import { getUserWalletName } from "@/getters/user-wallet-getters";
import { ENTITY_DATA } from "@/lib/constants";
import { DropdownExpandableRow } from "./DropdownExpandableRow";
import { LessonFormatter } from "@/getters/lesson-formatters";
import { PackageDetails } from "@/getters/package-details";

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

  const packageEntity = ENTITY_DATA.find(entity => entity.name === "Package");
  const studentEntity = ENTITY_DATA.find(entity => entity.name === "Student");
  const teacherEntity = ENTITY_DATA.find(entity => entity.name === "Teacher");

    
  // Calculate expected total (package duration * price per student * number of students)
  const expectedTotal = booking.package
    ? booking.package.price_per_student * (booking.students?.length || 0)
    : 0;

  const toggleExpand = () => {
    if (isExpanded) {
      setExpandedRow(null);
    } else {
      setExpandedRow(booking.id);
    }
  };

  // Create WhiteboardClass instance for progress calculations
  const bookingClass = new WhiteboardClass(booking);

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
          <div className="flex flex-col">
            <span>{getUserWalletName(booking.reference)}</span>
            {booking.reference?.note && (
              <span className="text-xs text-muted-foreground">
                {booking.reference.note}
              </span>
            )}
          </div>
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
            <BookingProgressBar
              eventMinutes={bookingClass.calculateBookingLessonEventMinutes()}
              totalMinutes={bookingClass.getTotalMinutes()}
            />
          ) : (
            <span className="text-muted-foreground">No progress</span>
          )}
        </td>
        <td className="py-2 px-4 text-left">
          {booking.lessons && booking.lessons.length > 0 ? (
            <div className="flex items-center gap-2">
              {booking.lessons.map((lesson: any) => (
                <span key={lesson.id} className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-700 border border-gray-200">
                  <HeadsetIcon className="w-3 h-3" />
                  <span>{lesson.teacher?.name || "N/A"}</span>
                </span>
              ))}
            </div>
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
      <DropdownExpandableRow
        isExpanded={isExpanded}
        colSpan={7}
        sections={[
          ...(booking.package ? [{
            title: "Package Details",
            icon: packageEntity?.icon,
            color: packageEntity?.color || "text-orange-500",
            children: (
              <PackageDetails 
                packageData={booking.package}
                variant="simple"
                totalPrice={expectedTotal}
              />
            )
          }] : []),
          {
            title: (
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {booking.students && booking.students.length > 0 ? (
                    booking.students.map((_, index) => (
                      <HelmetIcon key={index} className="w-4 h-4" />
                    ))
                  ) : (
                    <HelmetIcon className="w-4 h-4" />
                  )}
                </div>
                <span>Students</span>
              </div>
            ),
            color: studentEntity?.color || "text-yellow-500",
            children: (
              <div className="flex flex-wrap gap-2">
                {booking.students && booking.students.length > 0 ? (
                  booking.students.map((bs: any) => (
                    <button
                      key={bs.student.id}
                      onClick={() => router.push(`/students/${bs.student.id}`)}
                      className="px-2 py-1 text-sm font-medium border border-yellow-500 rounded hover:bg-muted transition-colors"
                    >
                      {bs.student.name}
                    </button>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">
                    No students assigned
                  </span>
                )}
              </div>
            )
          },
          ...(booking.lessons && booking.lessons.length > 0 ? [{
            title: (
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {booking.lessons.map((_, index) => (
                    <HeadsetIcon key={index} className="w-4 h-4" />
                  ))}
                </div>
                <span>Lessons</span>
              </div>
            ),
            color: teacherEntity?.color || "text-green-500",
            children: (
              <LessonFormatter lessons={booking.lessons} />
            )
          }] : [])
        ]}
      />
    </>
  );
}
