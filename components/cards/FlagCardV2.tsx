"use client";

import { useState } from "react";
import Link from "next/link";
import { Duration } from "@/components/formatters/Duration";
import { DateTime } from "@/components/formatters/DateTime";
import { FlagIcon } from "@/svgs";
import { HelmetIcon } from "@/svgs/HelmetIcon";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { deleteEvent, updateEvent } from "@/actions/event-actions";
import {
  type EventStatus,
  LOCATION_ENUM_VALUES,
  type Location,
} from "@/lib/constants";

interface FlagCardV2Props {
  startTime: string;
  duration: number;
  students: Array<{ id: string; name: string }>;
  status: EventStatus;
  location: Location;
  eventId?: string;
  hasGap?: number;
}

// Update Mode Component - just the controls
function UpdateMode({
  status,
  location,
  eventId,
}: {
  status: EventStatus;
  location: Location;
  eventId?: string;
}) {
  // Local state for immediate UI feedback
  const [localState, setLocalState] = useState({
    status,
    location,
    isUpdating: false,
  });

  const handleStatusChange = async (newStatus: EventStatus) => {
    if (!eventId || localState.isUpdating) return;
    
    // Optimistically update UI immediately
    setLocalState({ ...localState, status: newStatus, isUpdating: true });
    
    try {
      await updateEvent(eventId, { status: newStatus });
      // Real-time listener will handle the actual update
    } catch (error) {
      console.error("Error updating event status:", error);
      // Revert on error
      setLocalState({ status, location, isUpdating: false });
    } finally {
      setLocalState((prev) => ({ ...prev, isUpdating: false }));
    }
  };

  const handleLocationChange = async (newLocation: Location) => {
    if (!eventId || localState.isUpdating) return;
    
    // Optimistically update UI immediately
    setLocalState({ ...localState, location: newLocation, isUpdating: true });
    
    try {
      await updateEvent(eventId, { location: newLocation });
      // Real-time listener will handle the actual update
    } catch (error) {
      console.error("Error updating event location:", error);
      // Revert on error
      setLocalState({ status, location, isUpdating: false });
    } finally {
      setLocalState((prev) => ({ ...prev, isUpdating: false }));
    }
  };

  const handleDelete = async () => {
    if (!eventId || localState.isUpdating) return;
    setLocalState({ ...localState, isUpdating: true });
    
    try {
      await deleteEvent(eventId);
      // Real-time listener will handle the removal from UI
    } catch (error) {
      console.error("Error deleting event:", error);
      setLocalState((prev) => ({ ...prev, isUpdating: false }));
    }
    // Note: We don't setIsUpdating(false) on success because the component will unmount
  };

  return (
    <div className="p-3 space-y-3">
      {/* Status Update */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">
          STATUS
        </label>
        <div className="flex flex-wrap gap-1">
          {Object.entries({
            planned: 1,
            tbc: 1,
            completed: 1,
            cancelled: 1,
          }).map(([statusKey, _]) => (
            <button
              key={statusKey}
              onClick={() => handleStatusChange(statusKey as EventStatus)}
              disabled={localState.isUpdating || statusKey === localState.status}
              className={`px-2 py-1 text-xs rounded-md font-medium transition-colors ${statusKey === localState.status
                ? "bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200"
                : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
                } disabled:opacity-50`}
            >
              {statusKey}
            </button>
          ))}
        </div>
      </div>

      {/* Location Update */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">
          LOCATION
        </label>
        <div className="flex flex-wrap gap-1">
          {LOCATION_ENUM_VALUES.map((locationValue) => (
            <button
              key={locationValue}
              onClick={() => handleLocationChange(locationValue)}
              disabled={localState.isUpdating || locationValue === localState.location}
              className={`px-2 py-1 text-xs rounded-md font-medium transition-colors ${locationValue === localState.location
                ? "bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200"
                : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
                } disabled:opacity-50`}
            >
              {locationValue}
            </button>
          ))}
        </div>
      </div>

      {/* Delete Button */}
      {eventId && (
        <button
          onClick={handleDelete}
          disabled={localState.isUpdating}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
          {localState.isUpdating ? "Updating..." : "Delete Event"}
        </button>
      )}
    </div>
  );
}

export default function FlagCardV2({
  startTime,
  duration,
  students,
  status,
  location,
  eventId,
  hasGap,
}: FlagCardV2Props) {
  const [viewMode, setViewMode] = useState<"view" | "update">("view");

  return (
    <div
      className={`w-[311px] bg-background dark:bg-card border border-border rounded-lg overflow-hidden relative ${hasGap && hasGap > 0
        ? "border-l-4 border-l-orange-300 dark:border-l-orange-500"
        : ""
        }`}
    >
      <div className="overflow-hidden">
        {/* First Row: Flag + Time + Duration + Edit Button */}
        <div className="flex items-center gap-2 p-4 border-b-2 border-dashed border-gray-300 dark:border-gray-600">
          <FlagIcon className="w-10 h-10" status={status} />
          <div className="flex flex-col relative">
            <span className="font-bold text-2xl">
              <DateTime dateString={startTime} formatType="time" />
            </span>
            {hasGap && hasGap > 0 && (
              <span className="text-xs text-orange-600 dark:text-orange-400 font-medium absolute top-full left-0 whitespace-nowrap">
                +<Duration minutes={hasGap} /> delay
              </span>
            )}
          </div>
          <span className="text-sm px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300">
            +<Duration minutes={duration} />
          </span>
          <button
            onClick={() => setViewMode(viewMode === "view" ? "update" : "view")}
            className="ml-auto p-1.5 rounded hover:bg-muted/50 text-muted-foreground hover:text-foreground"
            title={
              viewMode === "view"
                ? "Switch to update mode"
                : "Switch to view mode"
            }
          >
            {viewMode === "view" ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronUp className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Content - either students or update controls */}
        {viewMode === "view" ? (
          /* Students Rows */
          students.map((student, index) => (
            <div key={index} className="flex items-center gap-3 px-6 py-2">
              <HelmetIcon className="w-8 h-8 text-yellow-500" />
              <div className="overflow-x-auto flex-1">
                <Link
                  href={`/students/${student.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base font-medium text-foreground whitespace-nowrap hover:underline"
                >
                  {student.name}
                </Link>
              </div>
            </div>
          ))
        ) : (
          <UpdateMode status={status} location={location} eventId={eventId} />
        )}
      </div>
    </div>
  );
}
