"use client";

import { BookingProgressBar } from "@/components/formatters/BookingProgressBar";
import { BillboardClass } from "@/backend/BillboardClass";
import {
  HelmetIcon,
  BookingIcon,
} from "@/svgs";
import { FormatedDateExp } from "@/components/label/FormatedDateExp";
import { LessonFormatter } from "@/getters/lesson-formatters";
import { PackageDetails } from "@/getters/package-details";
import {
  Plus,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { BOOKING_STATUSES, getBookingStatusColor } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { BookmarkIcon } from "@/svgs";
import { toast } from "sonner";

interface MockStudentsBookingCardProps {
  billboardClass: BillboardClass;
  selectedDate?: string;
  teachers: any[];
}

interface MockStudentCardFooterProps {
  billboardClass: BillboardClass;
  availableTeachers: any[];
}

function MockStudentCardFooter({
  billboardClass,
  availableTeachers,
}: MockStudentCardFooterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const booking = billboardClass.booking;

  const handleDropdownToggle = () => setIsOpen(!isOpen);

  const handleAssignTeacherClick = () => {
    toast.info("This assigns a new teacher to booking");
  };

  const handleStatusChange = () => {
    toast.info("This changes the status");
  };

  const handleBookingDetailsClick = () => {
    toast.info(`This goes to booking ${booking.id}`);
  };

  // Use BillboardClass methods for calculations
  const packageMinutes = billboardClass.getPackageMinutes();
  const eventMinutes = billboardClass.getEventMinutes();
  
  // Calculate event hours for PackageDetails component
  const eventHours = eventMinutes.completed / 60;
  const pricePerHourPerStudent = packageMinutes.expected.pricePerHourPerStudent;
  const priceToPay = eventHours * pricePerHourPerStudent;

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
            onClick={handleAssignTeacherClick}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer opacity-50"
            title="Mock: Assign Teacher (disabled)"
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
                className="flex items-center transition-colors opacity-50 cursor-pointer"
                title="Mock: Booking status (disabled)"
                onClick={handleStatusChange}
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
                Change Status (Mock)
              </div>
              <DropdownMenuSeparator />
              {BOOKING_STATUSES.map((status: any) => (
                <DropdownMenuItem
                  key={status}
                  onClick={handleStatusChange}
                  className={cn(
                    "cursor-pointer opacity-50",
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

            <PackageDetails 
              packageData={booking.package}
              eventHours={eventHours}
              pricePerHourPerStudent={pricePerHourPerStudent}
              totalPrice={booking.package ? booking.package.price_per_student * booking.package.capacity_students : 0}
              priceToPay={priceToPay}
              referenceId={booking.reference?.id}
              variant="simple"
            />
          </div>

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

          {/* Booking Link - Disabled */}
          <div className="mt-4 pt-3 border-t border-border/30">
            <button 
              onClick={handleBookingDetailsClick}
              className="flex items-center justify-center gap-1.5 w-full py-2 rounded-md bg-primary/10 hover:bg-primary/20 text-primary font-medium text-sm transition-colors opacity-50 cursor-pointer"
              title="Mock: Go to Booking Details (disabled)"
            >
              <span>Go to Booking Details</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MockStudentsBookingCard({
  billboardClass,
  selectedDate,
  teachers,
}: MockStudentsBookingCardProps) {
  const booking = billboardClass.booking;

  // Extract students using BillboardClass method
  const students = useMemo(() => 
    billboardClass.getStudents(), 
    [billboardClass]
  );
  
  const existingLessons = useMemo(() => billboardClass.lessons || [], [billboardClass]);
  
  const assignedTeacherIds = useMemo(() => {
    return new Set(
      existingLessons.map((lesson: any) => lesson.teacher?.id).filter(Boolean),
    );
  }, [existingLessons]);

  // Filter teachers to only show those not already assigned to this booking
  const availableTeachers = useMemo(() => {
    return teachers.filter((teacher) => !assignedTeacherIds.has(teacher.id));
  }, [teachers, assignedTeacherIds]);

  return (
    <div
      className="p-4 bg-card rounded-lg border border-border transition-shadow opacity-75 border-orange-200 dark:border-orange-800"
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
            {students.map((_: any, index: number) => (
              <HelmetIcon key={index} className="w-4 h-4" />
            ))}
          </div>

          {/* Student names */}
          <div className="flex flex-wrap gap-1">
            {students.map((student: any, index: number) => (
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

      <MockStudentCardFooter
        billboardClass={billboardClass}
        availableTeachers={availableTeachers}
      />
    </div>
  );
}