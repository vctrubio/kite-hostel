"use client";

import { ChevronUp, ChevronDown, MapPin } from "lucide-react";
import { FlagIcon } from "@/svgs";
import { type EventController } from "@/backend/types";
import { type Location, LOCATION_ENUM_VALUES } from "@/lib/constants";
import { addMinutesToTime } from "@/components/formatters/TimeZone";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WhiteboardHeaderProps {
  controller?: EventController;
  onControllerChange?: (controller: EventController) => void;
}

export default function WhiteboardHeader({
  controller,
  onControllerChange,
}: WhiteboardHeaderProps) {
  // Time adjustment function
  const adjustTime = (hours: number, minutes: number) => {
    if (!controller || !onControllerChange) return;
    const totalMinutesToAdd = hours * 60 + minutes;
    const newTime = addMinutesToTime(controller.submitTime, totalMinutesToAdd);
    onControllerChange({ ...controller, submitTime: newTime });
  };

  // Time Controller Component
  const TimeController = () => {
    if (!controller || !onControllerChange) return null;

    return (
      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border h-12">
        <FlagIcon className="w-5 h-5 opacity-30" />
        <span className="text-sm font-mono">{controller.submitTime}</span>
        <div className="flex flex-col ml-auto">
          <button
            onClick={() => adjustTime(0, 30)}
            className="px-2 py-1 text-xs hover:bg-background rounded transition-colors"
          >
            <ChevronUp className="w-3 h-3" />
          </button>
          <button
            onClick={() => adjustTime(0, -30)}
            className="px-2 py-1 text-xs hover:bg-background rounded transition-colors"
          >
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  };

  // Location Controller Component
  const LocationController = () => {
    if (!controller || !onControllerChange) return null;

    return (
      <div className="flex items-center gap-3">
        <Select
          value={controller.location}
          onValueChange={(value) =>
            onControllerChange({
              ...controller,
              location: value as Location,
            })
          }
        >
          <SelectTrigger className="w-36 h-8 text-sm bg-muted border-border hover:bg-background">
            <MapPin className="w-5 h-5 opacity-30" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LOCATION_ENUM_VALUES.map((location) => (
              <SelectItem key={location} value={location} className="text-sm">
                {location}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 mb-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Whiteboard</h1>
          <p className="text-sm text-muted-foreground">
            Manage bookings, lessons, and events.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <TimeController />
          <LocationController />
        </div>
      </div>
    </div>
  );
}
