"use client";

import { BookingProgressBar } from "@/components/formatters/BookingProgressBar";
import { BillboardClass } from "@/backend/BillboardClass";
import { HelmetIcon, BookingIcon } from "@/svgs";
import { FormatedDateExp } from "@/components/label/FormatedDateExp";
import { BookingToLessonModal } from "@/components/modals/BookingToLessonModal";
import { LessonFormatter } from "@/getters/lesson-formatters";
import { PackageDetails } from "@/getters/package-details";
import { Plus, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { useMemo, useState } from "react";
import Link from "next/link";
import { BookmarkIcon } from "@/svgs";
interface StudentsBookingCardProps {
  billboardClass: BillboardClass;
  selectedDate?: string;
  teachers: any[];
  isDraggable?: boolean;
  onDragStart?: (bookingId: string) => void;
  onDragEnd?: (bookingId: string, wasDropped: boolean) => void;
}

interface StudentCardFooterProps {
  billboardClass: BillboardClass;
  availableTeachers: any[];
  onAssignTeacherClick: () => void;
}

function StudentCardFooter({
  billboardClass,
  availableTeachers,
  onAssignTeacherClick,
}: StudentCardFooterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const booking = billboardClass.booking;

  // Use BillboardClass methods for calculations
  const packageMinutes = billboardClass.getPackageMinutes();
  const eventMinutes = billboardClass.getEventMinutes();

  // Calculate event hours for PackageDetails component
  const eventHours = eventMinutes.completed / 60;
  const pricePerHourPerStudent = packageMinutes.expected.pricePerHourPerStudent;
  const priceToPay = eventHours * pricePerHourPerStudent;

  const hasAvailableTeachers = availableTeachers.length > 0;

  return (
    <div className="border-t border-border/50 -mx-4 -mb-4">
      {/* Footer Icons Bar */}
      <div className="flex flex-wrap items-center justify-between p-3 bg-muted/10 gap-y-3">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          {isOpen ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
          <span className="text-sm">Details</span>
        </button>

        <div className="flex flex-wrap items-center gap-3 px-2">
          <button
            onClick={onAssignTeacherClick}
            disabled={!hasAvailableTeachers}
            className={`flex items-center gap-2 transition-colors ${
              !hasAvailableTeachers
                ? "text-muted-foreground cursor-not-allowed opacity-50"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title={
              !hasAvailableTeachers
                ? "No available teachers (all already assigned)"
                : "Assign Teacher"
            }
          >
            <Plus className="w-4 h-4" />
            <span className="text-xs">
              {!hasAvailableTeachers ? "All Teachers Assigned" : "Assign Teacher"}
            </span>
          </button>
        </div>
      </div>
      {/* Dropdown Content */}
      {isOpen && (
        <div className="p-4 bg-muted/5 space-y-4 border-t border-border/30">
          {/* Package Information */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <BookmarkIcon className="w-4 h-4" />
              <span>Package Details</span>
            </div>

            <PackageDetails
              packageData={booking.package}
              eventHours={eventHours}
              pricePerHourPerStudent={pricePerHourPerStudent}
              totalPrice={
                booking.package
                  ? booking.package.price_per_student *
                  booking.package.capacity_students
                  : 0
              }
              priceToPay={priceToPay}
              referenceId={booking.reference?.note}
              variant="compact"
            />
          </div>

          {/* Booking Dates */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-2 text-sm">
              {booking.created_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created:</span>
                  <span className="font-medium">
                    {new Date(booking.created_at).toLocaleDateString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Start Date:</span>
                <span className="font-medium">
                  {new Date(booking.date_start).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">End Date:</span>
                <span className="font-medium">
                  {new Date(booking.date_end).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Booking Link */}
          <div className="mt-4 pt-3 border-t border-border/30">
            <Link
              href={`/bookings/${booking.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 w-full py-2 rounded-md bg-primary/10 hover:bg-primary/20 text-primary font-medium text-sm transition-colors"
            >
              <span>Go to Booking Details</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StudentsBookingCard({
  billboardClass,
  selectedDate,
  teachers,
  isDraggable = false,
  onDragStart,
  onDragEnd,
}: StudentsBookingCardProps) {
  const [showLessonModal, setShowLessonModal] = useState(false);
  const booking = billboardClass.booking;

  // Extract students using BillboardClass method
  const students = useMemo(
    () => billboardClass.getStudents(),
    [billboardClass],
  );

  const existingLessons = useMemo(
    () => billboardClass.lessons || [],
    [billboardClass],
  );

  const assignedTeacherIds = useMemo(() => {
    return new Set(
      existingLessons.map((lesson) => lesson.teacher?.id).filter(Boolean),
    );
  }, [existingLessons]);

  // Filter teachers to only show those not already assigned to this booking
  const availableTeachers = useMemo(() => {
    return teachers.filter((teacher) => !assignedTeacherIds.has(teacher.id));
  }, [teachers, assignedTeacherIds]);

  const handleDragStart = (e: React.DragEvent) => {
    // Create a serializable object with the billboardClass data
    const dragData = {
      booking: billboardClass.booking,
      lessons: billboardClass.lessons,
      package: billboardClass.package,
    };

    e.dataTransfer.setData("application/json", JSON.stringify(dragData));
    onDragStart?.(booking.id);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const wasDropped = e.dataTransfer.dropEffect !== "none";
    onDragEnd?.(booking.id, wasDropped);
  };

  return (
    <div
      draggable={isDraggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`p-4 bg-card rounded-lg border border-border transition-shadow ${isDraggable
        ? "cursor-grab hover:shadow-md active:cursor-grabbing border-green-200 dark:border-green-800"
        : "opacity-75"
        }`}
      style={{ position: "relative" }}
    >
      <div className="flex flex-col gap-3 mb-2">
        {/* Date information with progress bar */}
        {selectedDate && (
          <div className="flex flex-wrap items-center gap-2 pl-2">
            <div className="flex items-center gap-2 text-xs min-w-[120px]">
              <BookingIcon className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <FormatedDateExp
                startDate={booking.date_start}
                endDate={booking.date_end}
                selectedDate={selectedDate}
                status={booking.status}
                bookingId={booking.id}
              />
            </div>
            <div className="flex-grow min-w-[150px]">
              <BookingProgressBar
                eventMinutes={billboardClass.getEventMinutes()}
                totalMinutes={billboardClass.package?.duration || 0}
              />
            </div>
          </div>
        )}

        {/* Student names with helmet icons */}
        <div className="flex items-center gap-2 px-2">
          {/* Helmet icons */}
          <div className="flex gap-1 flex-shrink-0">
            {students.map((_, index) => (
              <HelmetIcon key={index} className="w-4 h-4" />
            ))}
          </div>

          {/* Student names */}
          <div className="flex flex-wrap gap-1">
            {students.map((student, index) => (
              <span
                key={student.id}
                className="text-sm font-medium text-foreground"
              >
                {student.name}
                {index < students.length - 1 && ","}
              </span>
            ))}
          </div>
        </div>

        {/* Existing lessons */}
        <LessonFormatter lessons={existingLessons} />
      </div>

      <StudentCardFooter
        billboardClass={billboardClass}
        availableTeachers={availableTeachers}
        onAssignTeacherClick={() => {
          if (availableTeachers.length > 0) {
            setShowLessonModal(true);
          }
        }}
      />

      {/* Lesson Modal for Teacher Assignment */}
      {showLessonModal && (
        <BookingToLessonModal
          bookingId={booking.id}
          bookingReference={booking.reference}
          onClose={() => setShowLessonModal(false)}
          teachers={availableTeachers}
          onCommissionCreated={() => {
            // You can add a refresh callback here if needed
            setShowLessonModal(false);
          }}
        />
      )}
    </div>
  );
}
