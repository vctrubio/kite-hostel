"use client";

import { BookingProgressBar } from "@/components/formatters/BookingProgressBar";
import { BillboardClass } from "@/backend/BillboardClass";
import {
  HelmetIcon,
  BookingIcon,
  HeadsetIcon,
  FlagIcon,
  BookmarkIcon,
} from "@/svgs";
import { FormatedDateExp } from "@/components/label/FormatedDateExp";
import { BookingToLessonModal } from "@/components/modals/BookingToLessonModal";
import { LessonFormatter } from "@/getters/lesson-formatters";
import { Duration } from "@/components/formatters/Duration";
import {
  Plus,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { BOOKING_STATUSES, type BookingStatus, getBookingStatusColor } from "@/lib/constants";
import { updateBookingStatus } from "@/actions/booking-actions";
import { cn } from "@/lib/utils";

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
  onBookingComplete?: (bookingId: string) => void;
}

function StudentCardFooter({
  billboardClass,
  availableTeachers,
  onAssignTeacherClick,
  onBookingComplete,
}: StudentCardFooterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const booking = billboardClass.booking;

  const handleDropdownToggle = () => setIsOpen(!isOpen);

  const handleStatusChange = (newStatus: BookingStatus) => {
    if (newStatus === booking.status) return;
    startTransition(async () => {
      const { success, error } = await updateBookingStatus(
        booking.id,
        newStatus,
      );
      if (success) {
        if (newStatus === "completed" && onBookingComplete) {
          onBookingComplete(booking.id);
        }
        router.refresh();
      } else {
        console.error("Failed to update status:", error);
      }
    });
  };

  // Use BillboardClass methods for calculations
  const packageMinutes = billboardClass.getPackageMinutes();
  const eventMinutes = billboardClass.getEventMinutes();

  return (
    <div className="border-t border-border/50 -mx-4 -mb-4">
      {/* Footer Icons Bar */}
      <div className="flex flex-wrap items-center justify-between p-3 bg-muted/10 gap-y-3">
        <button
          onClick={handleDropdownToggle}
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
            disabled={availableTeachers.length === 0}
            className={`flex items-center gap-2 transition-colors ${
              availableTeachers.length === 0
                ? "text-muted-foreground cursor-not-allowed opacity-50"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title={
              availableTeachers.length === 0
                ? "No available teachers (all already assigned)"
                : "Assign Teacher"
            }
          >
            <Plus className="w-4 h-4" />
            <span className="text-xs">
              {availableTeachers.length === 0
                ? "All Teachers Assigned"
                : "Assign Teacher"}
            </span>
          </button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "flex items-center transition-colors",
                  isPending && "opacity-50 cursor-not-allowed",
                )}
                title="Booking status"
                disabled={isPending}
              >
                <div className={cn(
                  "px-2 py-0.5 rounded-full text-xs font-medium",
                  getBookingStatusColor(booking.status)
                )}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48" align="end">
              <div className="p-2 text-xs text-muted-foreground">
                Change Status
              </div>
              <DropdownMenuSeparator />
              {BOOKING_STATUSES.map((status) => (
                <DropdownMenuItem
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  disabled={isPending}
                  className={cn(
                    "cursor-pointer",
                    status === booking.status &&
                      "bg-accent text-accent-foreground",
                  )}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
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

            {booking.package && (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Description:</span>
                  <p className="font-medium">
                    {booking.package.description || "No description"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Reference:</span>
                  <p className="font-medium">
                    {booking.reference?.id || "NULL"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Duration:</span>
                  <p className="font-medium">
                    <Duration minutes={booking.package.duration} />
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Used Hours:</span>
                  <p className="font-medium">
                    <Duration minutes={eventMinutes.completed} />
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Kite Capacity:</span>
                  <p className="font-medium">
                    {booking.package.capacity_kites} kites / {booking.package.capacity_students} students
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    Price per Student:
                  </span>
                  <p className="font-medium">
                    €{booking.package.price_per_student}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    Price per Hour/Student:
                  </span>
                  <p className="font-medium">
                    €{packageMinutes.expected.pricePerHourPerStudent.toFixed(2)}/h
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Price:</span>
                  <p className="font-medium text-green-600">€{packageMinutes.expected.totalPrice}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Price to Pay/Student:</span>
                  <p className="font-medium text-blue-600">€{packageMinutes.spent.pricePerStudent.toFixed(2)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Reference Information */}
          {booking.reference && (
            <div className="space-y-3">
              <div className="text-sm font-medium text-muted-foreground">
                Reference Information
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Reference:</span>
                  <p className="font-medium">{booking.reference.id}</p>
                </div>
                {booking.reference.teacher && (
                  <div>
                    <span className="text-muted-foreground">Teacher:</span>
                    <p className="font-medium">
                      {booking.reference.teacher.name}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Booking Dates */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created:</span>
                <span className="font-medium">
                  {booking.created_at
                    ? new Date(booking.created_at).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
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
  const students = useMemo(() => 
    billboardClass.getStudents(), 
    [billboardClass]
  );
  
  const existingLessons = useMemo(() => billboardClass.lessons || [], [billboardClass]);
  
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
    
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify(dragData),
    );
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
      className={`p-4 bg-card rounded-lg border border-border transition-shadow ${
        isDraggable
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
      {showLessonModal && availableTeachers.length > 0 && (
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
