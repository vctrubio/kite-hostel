"use client";
// NO Equipment CHECKING YET
import { useState, useEffect } from "react";
import { Duration } from "@/components/formatters/Duration";
import { DateTime } from "@/components/formatters/DateTime";
import { extractDateFromUTC } from "@/components/formatters/TimeZone";
import { HelmetIcon } from "@/svgs/HelmetIcon";
import {
  Clock,
  MapPin,
  Euro,
  Phone,
  Send,
  Settings,
  X,
  Plus,
  Minus,
  Loader,
  Check,
  CheckCircle,
} from "lucide-react";
import { type EventWithDetails } from "@/backend/TeacherPortal";
import {
  teacherportalupdate,
  cancelTeacherEvent,
} from "@/actions/teacher-actions";

interface TeacherEventCardProps {
  eventDetail: EventWithDetails;
  teacherId: string;
  teacherKites: Array<{
    id: string;
    kite: {
      id: string;
      model: string;
      size: number;
      serial_id: string;
    };
  }>;
}

const STATUS_COLORS = {
  planned: "bg-blue-500",
  tbc: "bg-purple-500",
  completed: "bg-green-500",
  cancelled: "bg-orange-500",
} as const;

// DRY function to calculate booking date logic
const calculateBookingDays = (selectedDate: string, bookingEndDate: string) => {
  const currentDateStr = extractDateFromUTC(selectedDate);
  const endDateStr = extractDateFromUTC(bookingEndDate);

  const currentDate = new Date(currentDateStr);
  const endDate = new Date(endDateStr);

  const timeDiff = endDate.getTime() - currentDate.getTime();
  const daysRemaining = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

  return {
    daysRemaining,
    isLastDay: daysRemaining <= 0,
  };
};

const StudentsDisplay = ({
  students,
  studentDetails,
  onStudentClick,
}: {
  students: string[];
  studentDetails: EventWithDetails["studentDetails"];
  onStudentClick: (student: EventWithDetails["studentDetails"][0]) => void;
}) => {
  return (
    <div className="flex items-center gap-2 text-base">
      {students.length > 0 ? (
        <>
          {Array.from({ length: students.length }).map((_, index) => (
            <HelmetIcon key={index} className="w-4 h-4 text-yellow-500" />
          ))}
          <div className="flex gap-1 flex-wrap">
            {students.map((studentName, index) => {
              const studentDetail = studentDetails.find(
                (sd) => sd.student.name === studentName,
              );
              return (
                <button
                  key={index}
                  onClick={() => studentDetail && onStudentClick(studentDetail)}
                  className="text-foreground font-medium hover:underline hover:text-blue-600"
                >
                  {studentName}
                  {index < students.length - 1 && ","}
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <span className="text-muted-foreground">No students</span>
      )}
    </div>
  );
};

const TimeDisplay = ({
  date,
  duration,
}: {
  date: string;
  duration: number;
}) => (
  <div className="flex items-center gap-2">
    <Clock className="w-4 h-4 text-muted-foreground" />
    <div className="flex items-center gap-1">
      <span className="text-foreground font-medium">
        <DateTime dateString={date} formatType="time" />
      </span>
      <span className="px-2 py-0.5 text-xs font-semibold bg-slate-100 text-slate-700 rounded-full border border-slate-200">
        +<Duration minutes={duration} />
      </span>
    </div>
  </div>
);

const LocationDisplay = ({ location }: { location: string }) => (
  <div className="flex items-center gap-2">
    <MapPin className="w-4 h-4 text-muted-foreground" />
    <span className="text-foreground font-medium">{location}</span>
  </div>
);

const EarningsDisplay = ({ earnings }: { earnings: number }) => (
  <div className="flex items-center gap-2">
    <Euro className="w-4 h-4 text-muted-foreground" />
    <span className="text-foreground font-medium">€{Math.round(earnings)}</span>
  </div>
);

const StudentDropdown = ({
  student,
  isOpen,
  onClose,
}: {
  student: EventWithDetails["studentDetails"][0];
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen) return null;

  const handleWhatsAppClick = (phone: string) => {
    // Clean phone number (remove spaces, dashes, etc.)
    const cleanPhone = phone.replace(/\D/g, "");
    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/${cleanPhone}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-sm">{student.student.name}</h4>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
        <div>
          <strong>Languages:</strong> {student.student.languages.join(", ")}
        </div>
        {student.student.country && (
          <div>
            <strong>Country:</strong> {student.student.country}
          </div>
        )}
        {student.student.phone && (
          <div className="flex items-center gap-2">
            <strong>Phone:</strong>
            <span>{student.student.phone}</span>
            <button
              onClick={() => handleWhatsAppClick(student.student.phone!)}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
            >
              <Phone className="w-3 h-3" />
              WhatsApp
            </button>
          </div>
        )}
        {student.student.passport_number && (
          <div>
            <strong>Passport:</strong> {student.student.passport_number}
          </div>
        )}
        {student.student.size && (
          <div>
            <strong>Size:</strong> {student.student.size}
          </div>
        )}
        {student.student.desc && (
          <div>
            <strong>Notes:</strong> {student.student.desc}
          </div>
        )}
      </div>
    </div>
  );
};

const EventControlsDropdown = ({
  eventDetail,
  teacherId,
  teacherKites,
  onClose,
  isOpen,
}: {
  eventDetail: EventWithDetails;
  teacherId: string;
  teacherKites: Array<{
    id: string;
    kite: {
      id: string;
      model: string;
      size: number;
      serial_id: string;
    };
  }>;
  onClose: () => void;
  isOpen: boolean;
}) => {
  const [selectedKiteIds, setSelectedKiteIds] = useState<string[]>([]);
  const [duration, setDuration] = useState(eventDetail.event.duration);
  const [continueTomorrow, setContinueTomorrow] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requiredKites = eventDetail.packageInfo.capacity_kites;
  const originalDuration = eventDetail.event.duration;
  const durationDifference = duration - originalDuration;

  // Use DRY function for consistent date calculation
  const { isLastDay } = calculateBookingDays(
    eventDetail.event.date,
    eventDetail.lesson.booking.date_end,
  );

  useEffect(() => {
    if (isLastDay) {
      setContinueTomorrow(false);
    }
  }, [isLastDay]);

  if (!isOpen) return null;

  const handleKiteToggle = (kiteId: string) => {
    setSelectedKiteIds((prev) => {
      if (prev.includes(kiteId)) {
        return prev.filter((id) => id !== kiteId);
      } else if (prev.length < requiredKites) {
        return [...prev, kiteId];
      }
      return prev;
    });
  };

  const adjustDuration = (increment: number) => {
    setDuration((prev) => Math.max(30, prev + increment));
  };

  const handleSubmit = async () => {
    // if (selectedKiteIds.length !== requiredKites) {
    //   setError(`Please select exactly ${requiredKites} kites`);
    //   return;
    // }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await teacherportalupdate({
        eventId: eventDetail.event.id,
        teacherId,
        selectedKiteIds,
        duration,
        continueTomorrow,
      });

      if (result.success) {
        onClose();
      } else {
        setError(result.error || "Failed to update event");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this event?")) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await cancelTeacherEvent({
        eventId: eventDetail.event.id,
        teacherId,
      });

      if (result.success) {
        onClose();
      } else {
        setError(result.error || "Failed to cancel event");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h4 className="font-medium text-gray-900 dark:text-gray-100">
          Confirm Class
        </h4>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Kite Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Select Kites ({selectedKiteIds.length}/{requiredKites})
          </label>
          <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
            {teacherKites.map((teacherKite) => (
              <button
                key={teacherKite.kite.id}
                onClick={() => handleKiteToggle(teacherKite.kite.id)}
                disabled={
                  !selectedKiteIds.includes(teacherKite.kite.id) &&
                  selectedKiteIds.length >= requiredKites
                }
                className={`p-2 text-xs rounded border text-left ${selectedKiteIds.includes(teacherKite.kite.id)
                  ? "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-200"
                  : "bg-white border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
                  }`}
              >
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {teacherKite.kite.model}
                </div>
                <div className="text-gray-500 dark:text-gray-400">
                  {teacherKite.kite.size}m • {teacherKite.kite.serial_id}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Duration Adjustment */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Duration
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => adjustDuration(-30)}
              className="p-1 border border-gray-300 rounded hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              <Minus className="w-3 h-3 text-gray-600 dark:text-gray-400" />
            </button>
            <div className="px-3 py-1 bg-white border border-gray-300 rounded min-w-20 text-center text-sm font-medium dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
              <Duration minutes={duration} />
            </div>
            <button
              onClick={() => adjustDuration(30)}
              className="p-1 border border-gray-300 rounded hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              <Plus className="w-3 h-3 text-gray-600 dark:text-gray-400" />
            </button>
            {durationDifference !== 0 && (
              <div
                className={`text-xs px-2 py-1 rounded ${durationDifference > 0
                  ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                  : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                  }`}
              >
                {durationDifference > 0 ? "+" : ""}
                <Duration minutes={Math.abs(durationDifference)} />
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
            {error}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-2">
          <button
            onClick={handleCancel}
            disabled={isSubmitting}
            className="px-3 py-2 text-sm text-red-600 hover:text-red-800 disabled:opacity-50 dark:text-red-400 dark:hover:text-red-300"
          >
            Cancel Lesson
          </button>

          {!isLastDay && (
            <button
              onClick={() => setContinueTomorrow(!continueTomorrow)}
              disabled={isSubmitting}
              className={`flex items-center gap-1 px-3 py-2 text-sm rounded ${continueTomorrow
                ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                }`}
            >
              <CheckCircle className="w-4 h-4" />
              Student will {continueTomorrow ? "Continue" : "Rest"}
            </button>
          )}

          {isLastDay && (
            <div className="flex items-center gap-1 px-3 py-2 bg-blue-100 text-blue-800 rounded text-sm dark:bg-blue-900/20 dark:text-blue-400">
              <Check className="w-4 h-4" />
              Last day of booking
            </div>
          )}

          <button
            onClick={handleSubmit}
            // disabled={isSubmitting || selectedKiteIds.length !== requiredKites}
            disabled={isSubmitting}
            className="ml-auto p-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            {isSubmitting ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function TeacherEventCard({
  eventDetail,
  teacherId,
  teacherKites,
}: TeacherEventCardProps) {
  const [selectedStudent, setSelectedStudent] = useState<
    EventWithDetails["studentDetails"][0] | null
  >(null);
  const [showControls, setShowControls] = useState(
    eventDetail.event.status === "tbc",
  );

  const sidebarColor =
    STATUS_COLORS[eventDetail.event.status as keyof typeof STATUS_COLORS] ||
    "bg-gray-500";

  const handleStudentClick = (
    student: EventWithDetails["studentDetails"][0],
  ) => {
    setSelectedStudent(
      selectedStudent?.student.id === student.student.id ? null : student,
    );
  };

  const canComplete =
    eventDetail.event.status === "planned" ||
    eventDetail.event.status === "tbc";
  const isTBC = eventDetail.event.status === "tbc";

  return (
    <div className="space-y-0">
      <div
        className={`bg-card border rounded-lg overflow-hidden ${isTBC ? "border-purple-300 shadow-lg" : "border-border"}`}
      >
        {/* Date Header with muted background */}
        <div
          className={`px-4 py-2 border-b border-border ${isTBC ? "bg-purple-50" : "bg-muted"}`}
        >
          <div className="flex justify-between items-center">
            <div className="text-sm font-medium text-muted-foreground">
              <DateTime dateString={eventDetail.event.date} formatType="date" />
              {isTBC && (
                <span className="ml-2 text-purple-600 font-medium">• TBC</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm font-medium text-muted-foreground">
                {eventDetail.packageInfo.capacity_kites} kites
              </div>
              {canComplete && (
                <button
                  onClick={() => setShowControls(!showControls)}
                  className={`p-1 rounded transition-colors ${showControls
                    ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  title={showControls ? "Close Controls" : "Confirm Class"}
                >
                  <Settings className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex">
          <div className={`w-2 ${sidebarColor}`} />

          <div className="flex-1 p-4">
            <div className="mb-3">
              <StudentsDisplay
                students={eventDetail.students}
                studentDetails={eventDetail.studentDetails}
                onStudentClick={handleStudentClick}
              />
            </div>

            <div className="space-y-2">
              <TimeDisplay
                date={eventDetail.event.date}
                duration={eventDetail.event.duration}
              />
              <LocationDisplay location={eventDetail.event.location} />
              {eventDetail.event.status === "completed" && (
                <EarningsDisplay earnings={eventDetail.earnings} />
              )}
              {eventDetail.kites.length > 0 && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Kites:</strong>{" "}
                  {eventDetail.kites
                    .map((k) => `${k.kite.model} ${k.kite.size}m`)
                    .join(", ")}
                </div>
              )}
            </div>

            {selectedStudent && (
              <StudentDropdown
                student={selectedStudent}
                isOpen={true}
                onClose={() => setSelectedStudent(null)}
              />
            )}

            {canComplete && (
              <EventControlsDropdown
                eventDetail={eventDetail}
                teacherId={teacherId}
                teacherKites={teacherKites}
                isOpen={showControls}
                onClose={() => setShowControls(false)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
