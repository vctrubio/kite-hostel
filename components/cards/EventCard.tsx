import { useState, useEffect } from "react";
import { Duration } from "@/components/formatters/Duration";
import { DateTime } from "@/components/formatters/DateTime";
import { createUTCDateTime, extractDateFromUTC } from "@/components/formatters/TimeZone";
import { HelmetIcon } from "@/svgs/HelmetIcon";
import {
  Trash2,
  Clock,
  MapPin,
  ArrowRight,
  Zap,
  X,
  CheckCircle,
  Minus,
  Loader,
  Plus,
  Send,
  Check,
} from "lucide-react";
import { type ReorganizationOption } from "@/backend/types";
import { deleteEvent, updateEvent } from "@/actions/event-actions";

interface EventCardProps {
  students: string;
  location: string;
  duration: number;
  date: string;
  status: string;
  eventId?: string;
  teacherSchedule?: any; // TeacherSchedule - contains all the info we need
  nextEvent?: {
    id: string;
    startTime: string;
    duration: number;
  };
  onDelete?: () => void;
  onStatusChange?: (
    newStatus: "planned" | "completed" | "tbc" | "cancelled",
  ) => void;
  reorganizationOptions?: ReorganizationOption[];
  onReorganize?: (option: ReorganizationOption) => void;
  onDismissReorganization?: () => void;
  onCancelReorganization?: () => void;
}

const STATUS_COLORS = {
  planned: "bg-blue-500",
  tbc: "bg-purple-500",
  completed: "bg-green-500",
  cancelled: "bg-orange-500",
} as const;

// Sub-components
const StudentsDisplay = ({ students, teacherSchedule }: { students: string, teacherSchedule?: any }) => {
  const studentList = students
    .split(", ")
    .filter((name) => name.trim() !== "" && name !== "No students");
  const studentCount = studentList.length;

  const handleStudentClick = (studentName: string) => {
    // TODO: Extract student details and phone number from teacherSchedule
    // For now, create a generic WhatsApp message
    // TODO: Get student phone from teacherSchedule.getStudentDetails(studentName) or similar
    
    const message = `Hi ${studentName}! This is regarding your kite lesson.`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="flex items-center gap-2 text-base">
      {studentCount > 0 ? (
        <>
          {Array.from({ length: studentCount }).map((_, index) => (
            <HelmetIcon key={index} className="w-4 h-4 text-yellow-500" />
          ))}
          <div className="flex gap-1 flex-wrap">
            {studentList.map((studentName, index) => (
              <button
                key={index}
                onClick={() => handleStudentClick(studentName.trim())}
                className="text-foreground font-medium hover:underline hover:text-blue-600"
                title={`Contact ${studentName.trim()} via WhatsApp`}
              >
                {studentName.trim()}
                {index < studentList.length - 1 && ","}
              </button>
            ))}
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

// Calculate booking date logic (like TeacherEventCard)
const calculateBookingDays = (selectedDate: string, bookingEndDate: string) => {
  const currentDateStr = extractDateFromUTC(selectedDate);
  const endDateStr = extractDateFromUTC(bookingEndDate);
  
  const currentDate = new Date(currentDateStr);
  const endDate = new Date(endDateStr);
  
  const timeDiff = endDate.getTime() - currentDate.getTime();
  const daysRemaining = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  
  return {
    daysRemaining,
    isLastDay: daysRemaining <= 0
  };
};

// Enhanced Completion Dropdown Component
const CompletionDropdown = ({
  eventId,
  duration: originalDuration,
  date,
  teacherSchedule,
  onComplete,
}: {
  eventId: string;
  duration: number;
  date: string;
  teacherSchedule?: any; // TeacherSchedule - contains all the info we need
  onComplete: () => void;
}) => {
  const [selectedKiteIds, setSelectedKiteIds] = useState<string[]>([]);
  const [duration, setDuration] = useState(originalDuration);
  const [continueTomorrow, setContinueTomorrow] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const durationDifference = duration - originalDuration;
  
  // Extract info from TeacherSchedule
  const teacherKites: any[] = []; // TODO: Get from teacherSchedule.getTeacherKites() or similar
  const packageCapacityKites = 1; // TODO: Get from teacherSchedule.getPackageInfo() or similar  
  const bookingEndDate = null; // TODO: Get from teacherSchedule.getBookingInfo() or similar
  
  // Calculate if it's the last day
  const { isLastDay } = bookingEndDate && date 
    ? calculateBookingDays(date, bookingEndDate)
    : { isLastDay: false };
  
  useEffect(() => {
    if (isLastDay) {
      setContinueTomorrow(false);
    }
  }, [isLastDay]);

  const handleKiteToggle = (kiteId: string) => {
    setSelectedKiteIds(prev => {
      if (prev.includes(kiteId)) {
        return prev.filter(id => id !== kiteId);
      } else if (prev.length < packageCapacityKites) {
        return [...prev, kiteId];
      }
      return prev;
    });
  };

  const adjustDuration = (increment: number) => {
    setDuration(prev => Math.max(30, prev + increment));
  };

  const handleComplete = async () => {
    // TODO: Add kite selection validation when kite functionality is implemented
    // if (selectedKiteIds.length !== packageCapacityKites) {
    //   setError(`Please select exactly ${packageCapacityKites} kites`);
    //   return;
    // }

    setIsSubmitting(true);
    setError(null);

    try {
      console.log("✅ Completing event:", {
        eventId,
        duration,
        continueTomorrow
      });

      // Update event status to completed and duration
      const updateResult = await updateEvent(eventId, {
        status: "completed",
        duration: duration
      });

      if (!updateResult.success) {
        setError(updateResult.error || "Failed to complete event");
        setIsSubmitting(false);
        return;
      }

      // TODO: Add kite assignment logic here
      // This would involve calling an action to create KiteEvent records
      // TODO: Handle continueTomorrow logic (create next day's lesson)
      
      console.log("✅ Event completed successfully");
      onComplete();
    } catch (error) {
      console.error("🔥 Error completing event:", error);
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-1 border-t border-green-200 bg-green-50">
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium text-green-800">
            Complete Lesson
          </span>
        </div>

        {/* Kite Selection - TODO: Implement when kite data is available */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900">
            Select Kites (TODO: Will be implemented with teacher kite data)
          </label>
          <div className="p-3 bg-gray-50 border border-gray-200 rounded text-sm text-gray-600">
            Kite selection will be available when integrated with teacher kite assignments
          </div>
        </div>

        {/* Duration Adjustment */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900">Duration</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => adjustDuration(-30)}
              className="p-1 border border-gray-300 rounded hover:bg-gray-50"
            >
              <Minus className="w-3 h-3 text-gray-600" />
            </button>
            <div className="px-3 py-1 bg-white border border-gray-300 rounded min-w-20 text-center text-sm font-medium">
              <Duration minutes={duration} />
            </div>
            <button
              onClick={() => adjustDuration(30)}
              className="p-1 border border-gray-300 rounded hover:bg-gray-50"
            >
              <Plus className="w-3 h-3 text-gray-600" />
            </button>
            {durationDifference !== 0 && (
              <div className={`text-xs px-2 py-1 rounded ${
                durationDifference > 0 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {durationDifference > 0 ? '+' : ''}<Duration minutes={Math.abs(durationDifference)} />
              </div>
            )}
          </div>
        </div>

        {/* Continue Tomorrow Toggle */}
        {!isLastDay && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setContinueTomorrow(!continueTomorrow)}
              disabled={isSubmitting}
              className={`flex items-center gap-1 px-3 py-2 text-sm rounded ${
                continueTomorrow 
                  ? 'bg-green-100 text-green-800' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              Student will {continueTomorrow ? 'Continue' : 'Rest'}
            </button>
          </div>
        )}

        {isLastDay && (
          <div className="flex items-center gap-1 px-3 py-2 bg-blue-100 text-blue-800 rounded text-sm">
            <Check className="w-4 h-4" />
            Last day of booking
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleComplete}
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 p-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              <span>Completing...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Complete Lesson</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// Enhanced Delete Dropdown Component
const EnhancedDeleteDropdown = ({
  eventId,
  nextEvent,
  onDeleteComplete,
}: {
  eventId: string;
  nextEvent?: {
    id: string;
    startTime: string;
    duration: number;
  };
  onDeleteComplete: () => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async (moveNextEvent: boolean) => {
    if (!eventId) return;
    
    setIsLoading(true);
    console.log("🗑️ Deleting event:", eventId);
    
    try {
      const deleteResult = await deleteEvent(eventId);
      
      if (!deleteResult.success) {
        console.error("❌ Delete failed:", deleteResult.error);
        setIsLoading(false);
        return;
      }

      console.log("✅ Event deleted successfully");

      // If we have a next event and user wants to move it
      if (nextEvent && moveNextEvent) {
        console.log("🔄 Moving next event to fill gap:", nextEvent.id);
        
        const updateResult = await updateEvent(nextEvent.id, {
          // Move the next event to start when this event was supposed to start
          date: new Date().toISOString(), // This should be the current event's start time
        });

        if (updateResult.success) {
          console.log("✅ Next event moved successfully");
        } else {
          console.error("❌ Failed to move next event:", updateResult.error);
        }
      }

      onDeleteComplete();
    } catch (error) {
      console.error("🔥 Error during delete operation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-1 border-t border-red-200 bg-red-50">
      <div className="pt-3 px-3 pb-3">
        <div className="flex items-center gap-2 mb-3">
          <Trash2 className="w-4 h-4 text-red-600" />
          <span className="text-sm font-medium text-red-800">
            Delete Event?
          </span>
        </div>
        
        {nextEvent ? (
          <div className="space-y-3">
            <p className="text-xs text-red-700 mb-3">
              There's a lesson scheduled after this one. What should happen to it?
            </p>
            <div className="space-y-2">
              <button
                onClick={() => handleDelete(true)}
                disabled={isLoading}
                className="w-full flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 text-left transition-colors duration-150 disabled:opacity-50"
              >
                <div className="flex items-center gap-2">
                  <ArrowRight className="w-3 h-3 text-blue-600" />
                  <span className="text-xs text-blue-800">
                    Move next lesson here
                  </span>
                </div>
                {isLoading && <Loader className="w-3 h-3 animate-spin text-blue-600" />}
              </button>
              <button
                onClick={() => handleDelete(false)}
                disabled={isLoading}
                className="w-full flex items-center justify-between p-2 bg-red-100 border border-red-200 rounded hover:bg-red-150 text-left transition-colors duration-150 disabled:opacity-50"
              >
                <div className="flex items-center gap-2">
                  <Trash2 className="w-3 h-3 text-red-600" />
                  <span className="text-xs text-red-800">
                    Just delete (keep gap)
                  </span>
                </div>
                {isLoading && <Loader className="w-3 h-3 animate-spin text-red-600" />}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => handleDelete(false)}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 p-2 bg-red-100 border border-red-200 rounded hover:bg-red-150 text-left transition-colors duration-150 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader className="w-3 h-3 animate-spin text-red-600" />
                <span className="text-xs text-red-800">Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3 h-3 text-red-600" />
                <span className="text-xs text-red-800">Yes, delete event</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

// Dropdown Card Component - Renders outside main card
const DropdownCard = ({
  reorganizationOptions,
  onReorganize,
  onDismissReorganization,
  showDeleteDropdown,
  showCompletionDropdown,
  eventId,
  duration,
  date,
  teacherSchedule,
  nextEvent,
  onDeleteComplete,
  onCompletionComplete,
}: {
  reorganizationOptions?: ReorganizationOption[];
  onReorganize?: (option: ReorganizationOption) => void;
  onDismissReorganization?: () => void;
  showDeleteDropdown?: boolean;
  showCompletionDropdown?: boolean;
  eventId?: string;
  duration?: number;
  date?: string;
  teacherSchedule?: any;
  nextEvent?: {
    id: string;
    startTime: string;
    duration: number;
  };
  onDeleteComplete?: () => void;
  onCompletionComplete?: () => void;
}) => {
  const hasReorganizationOptions =
    reorganizationOptions && reorganizationOptions.length > 0;

  if (!hasReorganizationOptions && !showDeleteDropdown && !showCompletionDropdown) return null;

  if (showCompletionDropdown && eventId && onCompletionComplete) {
    return (
      <CompletionDropdown
        eventId={eventId}
        duration={duration || 0}
        date={date || ""}
        teacherSchedule={teacherSchedule}
        onComplete={onCompletionComplete}
      />
    );
  }

  if (showDeleteDropdown && eventId && onDeleteComplete) {
    return (
      <EnhancedDeleteDropdown
        eventId={eventId}
        nextEvent={nextEvent}
        onDeleteComplete={onDeleteComplete}
      />
    );
  }

  if (hasReorganizationOptions) {
    return (
      <div className="mt-1 border-t border-muted-foreground/20">
        <div className="pt-3">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">
              Reorganization Available
            </span>
          </div>
          <div className="space-y-2">
            <button
              onClick={() => onReorganize?.(reorganizationOptions[0])}
              className="w-full flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 text-left transition-colors duration-150"
            >
              <div className="flex items-center gap-2">
                <ArrowRight className="w-3 h-3 text-blue-600" />
                <span className="text-xs text-blue-800">Shift lessons</span>
              </div>
            </button>
            <button
              onClick={onDismissReorganization}
              className="w-full p-2 bg-muted/50 border border-muted rounded hover:bg-muted text-left transition-colors duration-150"
            >
              <div className="flex items-center gap-2">
                <Trash2 className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Just delete event
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

const AdminControls = ({
  status,
  onStatusChange,
  onDelete,
  reorganizationOptions,
  onCancelReorganization,
  showDeleteDropdown,
  onShowDeleteDropdown,
  showCompletionDropdown,
  onShowCompletionDropdown,
}: {
  status: string;
  onStatusChange?: (
    status: "planned" | "completed" | "tbc" | "cancelled",
  ) => void;
  onDelete?: () => void;
  reorganizationOptions?: ReorganizationOption[];
  onCancelReorganization?: () => void;
  showDeleteDropdown?: boolean;
  onShowDeleteDropdown?: (show: boolean) => void;
  showCompletionDropdown?: boolean;
  onShowCompletionDropdown?: (show: boolean) => void;
}) => {
  const isCompleted = status === "completed";
  const hasReorganizationOptions =
    reorganizationOptions && reorganizationOptions.length > 0;

  return (
    <div className="mt-3 pt-3 border-t border-border">
      {/* Status Controls */}
      <div className="flex justify-between items-center">
        <div className="flex gap-1">
          <button
            onClick={() => onStatusChange?.("planned")}
            className={`px-2 py-1 text-xs rounded hover:opacity-80 transition-opacity ${status === "planned"
              ? "bg-blue-500 text-white"
              : "bg-blue-100 text-blue-800 hover:bg-blue-200"
              }`}
            title="Set to Planned"
          >
            Planned
          </button>
          <button
            onClick={() => onStatusChange?.("tbc")}
            className={`px-2 py-1 text-xs rounded hover:opacity-80 transition-opacity ${status === "tbc"
              ? "bg-purple-500 text-white"
              : "bg-purple-100 text-purple-800 hover:bg-purple-200"
              }`}
            title="Set to To Be Confirmed"
          >
            TBC
          </button>
          <button
            onClick={() => {
              if (showCompletionDropdown) {
                onShowCompletionDropdown?.(false);
              } else {
                onShowCompletionDropdown?.(true);
              }
            }}
            className={`px-2 py-1 text-xs rounded hover:opacity-80 transition-opacity ${
              status === "completed"
                ? "bg-green-500 text-white"
                : showCompletionDropdown
                  ? "bg-gray-100 text-gray-800"
                  : "bg-green-100 text-green-800 hover:bg-green-200"
            }`}
            title={showCompletionDropdown ? "Cancel completion" : "Complete lesson"}
            disabled={status === "completed"}
          >
            {showCompletionDropdown ? "Cancel" : "Done"}
          </button>
          <button
            onClick={() => onStatusChange?.("cancelled")}
            className={`px-2 py-1 text-xs rounded hover:opacity-80 transition-opacity ${status === "cancelled"
              ? "bg-orange-500 text-white"
              : "bg-orange-100 text-orange-800 hover:bg-orange-200"
              }`}
            title="Cancel Event"
          >
            Cancel
          </button>
        </div>
        <button
          onClick={() => {
            console.log("🗑️ Delete button clicked");
            if (hasReorganizationOptions) {
              onCancelReorganization?.();
            } else if (showDeleteDropdown) {
              onShowDeleteDropdown?.(false);
            } else {
              onShowDeleteDropdown?.(true);
            }
          }}
          disabled={isCompleted && !hasReorganizationOptions && !showDeleteDropdown}
          className={`p-1 rounded transition-colors duration-200 ${isCompleted && !hasReorganizationOptions && !showDeleteDropdown
            ? "text-gray-400 cursor-not-allowed"
            : hasReorganizationOptions
              ? "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              : showDeleteDropdown
                ? "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                : "text-red-500 hover:text-red-700 hover:bg-red-50"
            }`}
          title={
            hasReorganizationOptions
              ? "Cancel reorganization"
              : showDeleteDropdown
                ? "Cancel delete"
                : isCompleted
                  ? "Cannot delete completed event"
                  : "Delete Event"
          }
        >
          {hasReorganizationOptions || showDeleteDropdown ? (
            <X className="w-4 h-4" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
};

// Gap Card Component - Shows schedule gaps
export function GapCard({
  duration,
  startTime,
  selectedDate,
}: {
  duration: number;
  startTime: string;
  selectedDate: string;
}) {
  const dateString = createUTCDateTime(selectedDate, startTime).toISOString();

  return (
    <div className="flex bg-card border border-border rounded-lg overflow-hidden h-full">
      {/* Status Sidebar */}
      <div className="w-2 bg-orange-400" />

      {/* Card Content */}
      <div className="flex-1 p-4 flex flex-col justify-center">
        {/* "Schedule Gap" Title */}
        <div className="flex items-center gap-2 text-muted-foreground mb-3">
          <Minus className="w-4 h-4" />
          <span className="font-medium">Schedule Gap</span>
        </div>

        {/* Event Details */}
        <div className="space-y-2">
          <TimeDisplay date={dateString} duration={duration} />
        </div>
      </div>
    </div>
  );
}

export default function EventCard({
  students,
  location,
  duration,
  date,
  status,
  eventId,
  teacherSchedule,
  nextEvent,
  onDelete,
  onStatusChange,
  reorganizationOptions,
  onReorganize,
  onDismissReorganization,
  onCancelReorganization,
}: EventCardProps) {
  const [showDeleteDropdown, setShowDeleteDropdown] = useState(false);
  const [showCompletionDropdown, setShowCompletionDropdown] = useState(false);
  
  const sidebarColor =
    STATUS_COLORS[status as keyof typeof STATUS_COLORS] || "bg-gray-500";

  const handleDeleteComplete = () => {
    setShowDeleteDropdown(false);
    onDelete?.(); // Call the original onDelete callback for any additional logic
  };

  const handleCompletionComplete = () => {
    setShowCompletionDropdown(false);
    onStatusChange?.("completed"); // Update the status
  };

  return (
    <div className="space-y-0">
      {/* Main Event Card */}
      <div className="flex bg-card border border-border rounded-lg overflow-hidden">
        {/* Status Sidebar */}
        <div className={`w-2 ${sidebarColor}`} />

        {/* Card Content */}
        <div className="flex-1 p-4">
          {/* Students Display */}
          <div className="mb-3">
            <StudentsDisplay students={students} teacherSchedule={teacherSchedule} />
          </div>

          {/* Event Details */}
          <div className="space-y-2">
            <TimeDisplay date={date} duration={duration} />
            <LocationDisplay location={location} />
          </div>

          {/* Admin Controls */}
          <AdminControls
            status={status}
            onStatusChange={onStatusChange}
            onDelete={onDelete}
            reorganizationOptions={reorganizationOptions}
            onCancelReorganization={onCancelReorganization}
            showDeleteDropdown={showDeleteDropdown}
            onShowDeleteDropdown={setShowDeleteDropdown}
            showCompletionDropdown={showCompletionDropdown}
            onShowCompletionDropdown={setShowCompletionDropdown}
          />
        </div>
      </div>

      {/* Dropdown Card - Outside main card border */}
      <DropdownCard
        reorganizationOptions={reorganizationOptions}
        onReorganize={onReorganize}
        onDismissReorganization={onDismissReorganization}
        showDeleteDropdown={showDeleteDropdown}
        showCompletionDropdown={showCompletionDropdown}
        eventId={eventId}
        duration={duration}
        date={date}
        teacherSchedule={teacherSchedule}
        nextEvent={nextEvent}
        onDeleteComplete={handleDeleteComplete}
        onCompletionComplete={handleCompletionComplete}
      />
    </div>
  );
}
