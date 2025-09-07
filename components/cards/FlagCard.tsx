"use client";

import { useState } from "react";
import { Duration } from "@/components/formatters/Duration";
import { DateTime } from "@/components/formatters/DateTime";
import { FlagIcon } from "@/svgs";
import { HelmetIcon } from "@/svgs/HelmetIcon";
import { ChevronDown, ChevronUp, DollarSign, Trash2 } from "lucide-react";
import { deleteEvent } from "@/actions/event-actions";

interface FlagCardProps {
  startTime: string;
  duration: number;
  students: string[];
  status: "planned" | "completed" | "tbc" | "cancelled";
  teacherEarnings?: number;
  schoolEarnings?: number;
  eventId?: string;
  onStatusChange?: (newStatus: "planned" | "completed" | "tbc" | "cancelled") => void;
}

const STATUS_COLORS = {
  planned: "bg-blue-500",
  tbc: "bg-purple-500", 
  completed: "bg-green-500",
  cancelled: "bg-orange-500",
} as const;

const STATUS_LABELS = {
  planned: "Planned",
  tbc: "To Be Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
} as const;

export default function FlagCard({
  startTime,
  duration,
  students,
  status,
  teacherEarnings,
  schoolEarnings,
  eventId,
  onStatusChange,
}: FlagCardProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  
  const handleStatusChange = (newStatus: typeof status) => {
    onStatusChange?.(newStatus);
    setShowDropdown(false);
  };

  const handleDelete = async () => {
    if (!eventId) return;
    
    setIsDeleting(true);
    try {
      const result = await deleteEvent(eventId);
      if (!result.success) {
        // TODO: Replace with toast notification
        console.error("Failed to delete event:", result.error);
      } else {
        // Success animation
        setIsDeleted(true);
        setShowDropdown(false);
        // Card will disappear due to revalidation after animation
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      // TODO: Replace with toast notification
    } finally {
      setIsDeleting(false);
    }
  };

  const statusColor = STATUS_COLORS[status];
  const statusLabel = STATUS_LABELS[status];

  return (
    <div className={`w-[285px] bg-card border border-border rounded-lg overflow-hidden transition-all duration-500 ${
      isDeleted ? 'opacity-0 scale-95 translate-y-2' : 'opacity-100 scale-100 translate-y-0'
    } ${isDeleting ? 'animate-pulse' : ''}`}>
      <div className="p-4 flex items-start gap-4">
        <div className="flex flex-col items-center gap-2">
          <FlagIcon className="w-12 h-12" />
          <div className="flex gap-1">
            {students.map((_, index) => (
              <HelmetIcon key={index} className="w-4 h-4 text-yellow-500" />
            ))}
          </div>
        </div>
        <div className="flex-1">
          <div className="text-xl font-bold text-foreground">
            <DateTime dateString={startTime} formatType="time" />
          </div>
          <div className="text-muted-foreground text-sm">
            +<Duration minutes={duration} />
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {students.map((student, index) => (
              <span key={index} className="text-sm font-medium text-foreground">
                {student}
                {index < students.length - 1 && ","}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Status dropdown footer */}
      <div className="border-t border-border bg-muted/30">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${statusColor}`} />
            <span className="text-sm font-medium">{statusLabel}</span>
            {status === "completed" && (teacherEarnings || schoolEarnings) && (
              <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                <DollarSign className="w-3 h-3" />
                <span>Earnings calculated</span>
              </div>
            )}
          </div>
          {showDropdown ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>

        {showDropdown && (
          <div className="px-4 pb-4 space-y-3">
            {/* Delete button */}
            {eventId && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-900/50 rounded transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                {isDeleting ? "Deleting..." : "Delete Event"}
              </button>
            )}

            {/* Earnings breakdown for completed status */}
            {status === "completed" && (teacherEarnings || schoolEarnings) && (
              <div className="pt-3 border-t border-border space-y-2">
                <div className="text-xs font-medium text-muted-foreground mb-2">
                  Earnings Breakdown:
                </div>
                {teacherEarnings && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Teacher:</span>
                    <span className="font-medium text-green-600 dark:text-green-400">
                      €{teacherEarnings.toFixed(2)}
                    </span>
                  </div>
                )}
                {schoolEarnings && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">School:</span>
                    <span className="font-medium text-blue-600 dark:text-blue-400">
                      €{schoolEarnings.toFixed(2)}
                    </span>
                  </div>
                )}
                {teacherEarnings && schoolEarnings && (
                  <div className="flex justify-between items-center text-sm pt-2 border-t border-border">
                    <span className="font-medium">Total:</span>
                    <span className="font-bold">
                      €{(teacherEarnings + schoolEarnings).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}