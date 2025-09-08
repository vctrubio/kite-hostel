"use client";

import { useState } from "react";
import { Duration } from "@/components/formatters/Duration";
import { DateTime } from "@/components/formatters/DateTime";
import { FlagIcon } from "@/svgs";
import { HelmetIcon } from "@/svgs/HelmetIcon";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { deleteEvent, updateEvent } from "@/actions/event-actions";
import {
  getEventStatusColor,
  type EventStatus,
  LOCATION_ENUM_VALUES,
  type Location,
} from "@/lib/constants";

interface FlagCardProps {
  startTime: string;
  duration: number;
  students: string[];
  status: EventStatus;
  location: Location;
  eventId?: string;
  onStatusChange?: (newStatus: EventStatus) => void;
  onLocationChange?: (newLocation: Location) => void;
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
  location,
  eventId,
  onStatusChange,
  onLocationChange,
}: FlagCardProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  const handleStatusChange = async (newStatus: typeof status) => {
    if (!eventId) return;

    try {
      const result = await updateEvent(eventId, { status: newStatus });
      if (!result.success) {
        // TODO: Replace with toast notification
        console.error("Failed to update event status:", result.error);
      } else {
        // Call the optional callback for any parent component logic
        onStatusChange?.(newStatus);
      }
    } catch (error) {
      console.error("Error updating event status:", error);
      // TODO: Replace with toast notification
    } finally {
      setShowStatusDropdown(false);
      setShowDropdown(false);
    }
  };

  const handleLocationChange = async (newLocation: Location) => {
    if (!eventId) return;

    try {
      const result = await updateEvent(eventId, { location: newLocation });
      if (!result.success) {
        // TODO: Replace with toast notification
        console.error("Failed to update event location:", result.error);
      } else {
        // Call the optional callback for any parent component logic
        onLocationChange?.(newLocation);
      }
    } catch (error) {
      console.error("Error updating event location:", error);
      // TODO: Replace with toast notification
    } finally {
      setShowLocationDropdown(false);
      setShowDropdown(false);
    }
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
    <div
      className={`w-[285px] bg-card border border-border rounded-lg overflow-hidden transition-all duration-500 ${isDeleted
        ? "opacity-0 scale-95 translate-y-2"
        : "opacity-100 scale-100 translate-y-0"
        } ${isDeleting ? "animate-pulse" : ""}`}
    >
      <div className="p-4 flex items-start gap-4">
        <div className="flex flex-col items-center gap-2">
          <FlagIcon className="w-12 h-12" />
          <div className={`w-full gap-1 ${
            students.length === 4 ? "grid grid-cols-2 justify-center" : 
            students.length === 3 ? "grid grid-cols-2 justify-center" :
            "flex flex-row-reverse"
          }`}>
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
            <span className="text-sm font-medium">{location}</span>
          </div>
          {showDropdown ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>

        {showDropdown && (
          <div className="px-4 pb-4 space-y-3">
            {/* Status change dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
              >
                <span>Change Status: {statusLabel}</span>
                {showStatusDropdown ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
              {showStatusDropdown && (
                <div className="mt-2 space-y-1">
                  {Object.entries(STATUS_LABELS).map(([statusKey, label]) => {
                    if (statusKey === status) return null;
                    return (
                      <button
                        key={statusKey}
                        onClick={() =>
                          handleStatusChange(statusKey as typeof status)
                        }
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors flex items-center gap-2"
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${STATUS_COLORS[statusKey as keyof typeof STATUS_COLORS]}`}
                        />
                        {label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Location change dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
              >
                <span>Change Location: {location}</span>
                {showLocationDropdown ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
              {showLocationDropdown && (
                <div className="mt-2 space-y-1">
                  {LOCATION_ENUM_VALUES.map((locationValue) => {
                    if (locationValue === location) return null;
                    return (
                      <button
                        key={locationValue}
                        onClick={() => handleLocationChange(locationValue)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                      >
                        {locationValue}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

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
          </div>
        )}
      </div>
    </div>
  );
}
