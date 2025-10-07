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
  const [isWaiting, setIsWaiting] = useState(false);

  const handleStatusChange = async (newStatus: EventStatus) => {
    if (!eventId || isWaiting) return;
    setIsWaiting(true);
    try {
      await updateEvent(eventId, { status: newStatus });
    } catch (error) {
      console.error("Error updating event status:", error);
    } finally {
      setIsWaiting(false);
    }
  };

  const handleLocationChange = async (newLocation: Location) => {
    if (!eventId || isWaiting) return;
    setIsWaiting(true);
    try {
      await updateEvent(eventId, { location: newLocation });
    } catch (error) {
      console.error("Error updating event location:", error);
    } finally {
      setIsWaiting(false);
    }
  };

  const handleDelete = async () => {
    if (!eventId || isWaiting) return;
    setIsWaiting(true);
    try {
      await deleteEvent(eventId);
    } catch (error) {
      console.error("Error deleting event:", error);
    } finally {
      setIsWaiting(false);
    }
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
              disabled={isWaiting || statusKey === status}
              className={`px-2 py-1 text-xs rounded-md font-medium transition-colors ${
                statusKey === status
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
              disabled={isWaiting || locationValue === location}
              className={`px-2 py-1 text-xs rounded-md font-medium transition-colors ${
                locationValue === location
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
          disabled={isWaiting}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
          {isWaiting ? "Please wait..." : "Delete Event"}
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
      className={`w-[269px] bg-background dark:bg-card border border-border rounded-lg overflow-hidden relative ${
        hasGap && hasGap > 0
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
