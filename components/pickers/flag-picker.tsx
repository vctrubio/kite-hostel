"use client";

import { ChevronUp, ChevronDown, MapPin } from "lucide-react";
import { FlagIcon } from "@/svgs/FlagIcon";
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

interface FlagPickerProps {
  controller: EventController;
  onControllerChange: (controller: EventController) => void;
  showLocation?: boolean;
  variant?: "default" | "compact";
  overrideTime?: string; // Override the controller's submitTime
}

export default function FlagPicker({
  controller,
  onControllerChange,
  showLocation = true,
  variant = "default",
  overrideTime,
}: FlagPickerProps) {
  // Get the display time (use overrideTime if provided, otherwise controller.submitTime)
  const displayTime = overrideTime || controller.submitTime;

  // Time adjustment function
  const adjustTime = (hours: number, minutes: number) => {
    const totalMinutesToAdd = hours * 60 + minutes;
    const newTime = addMinutesToTime(displayTime, totalMinutesToAdd);
    onControllerChange({ ...controller, submitTime: newTime });
  };

  // Time Controller Component
  const TimeController = () => {
    const baseClass =
      variant === "compact"
        ? "flex items-center gap-2 p-2 rounded bg-muted/50 border border-border h-10"
        : "flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border h-12";

    return (
      <div className={baseClass}>
        <FlagIcon className="w-5 h-5 opacity-30" />
        <span
          className={
            variant === "compact" ? "text-xs font-mono" : "text-sm font-mono"
          }
        >
          {displayTime}
        </span>
        <div className="flex flex-col ml-auto">
          <button
            onClick={() => adjustTime(0, 30)}
            className={
              variant === "compact"
                ? "px-1 py-0.5 text-xs hover:bg-background rounded transition-colors"
                : "px-2 py-1 text-xs hover:bg-background rounded transition-colors"
            }
          >
            <ChevronUp className="w-3 h-3" />
          </button>
          <button
            onClick={() => adjustTime(0, -30)}
            className={
              variant === "compact"
                ? "px-1 py-0.5 text-xs hover:bg-background rounded transition-colors"
                : "px-2 py-1 text-xs hover:bg-background rounded transition-colors"
            }
          >
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  };

  // Location Controller Component
  const LocationController = () => {
    const triggerClass =
      variant === "compact"
        ? "w-28 h-6 text-xs bg-muted border-border hover:bg-background"
        : "w-36 h-8 text-sm bg-muted border-border hover:bg-background";

    return (
      <div className="flex items-center gap-3">
        <Select
          value={controller.location}
          onValueChange={(value) =>
            onControllerChange({ ...controller, location: value as Location })
          }
        >
          <SelectTrigger className={triggerClass}>
            <MapPin className="w-4 h-4 opacity-30" />
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

  const containerClass =
    variant === "compact" ? "flex items-center gap-2" : "space-y-2";

  return (
    <div className={containerClass}>
      <TimeController />
      {showLocation && <LocationController />}
    </div>
  );
}
