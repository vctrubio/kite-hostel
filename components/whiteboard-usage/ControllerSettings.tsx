"use client";

import { useState, useCallback, useMemo } from "react";
import { ChevronDown, ChevronUp, Timer, MapPin } from "lucide-react";
import { addMinutesToTime } from "@/components/formatters/TimeZone";
import { FlagIcon } from "@/svgs/FlagIcon";
import { formatHours } from "@/components/formatters/Duration";
import { LOCATION_ENUM_VALUES } from "@/lib/constants";
import type { EventController } from "@/backend/types";
import { TeacherSchedule } from "@/backend/TeacherSchedule";

interface ControllerSettingsProps {
  controller: EventController;
  onControllerChange: (controller: EventController) => void;
}

const MIN_DURATION = 60; // 1 hour minimum
const MAX_DURATION = 360; // 6 hours maximum
const DURATION_INCREMENT = 30; // 30 minute increments

export default function ControllerSettings({
  controller,
  onControllerChange,
}: ControllerSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Use useCallback to prevent re-renders
  const updateController = useCallback(
    (updates: Partial<EventController>) => {
      onControllerChange({ ...controller, ...updates });
    },
    [controller, onControllerChange],
  );

  const adjustDuration = useCallback(
    (key: keyof EventController, increment: number) => {
      const currentValue = controller[key] as number;
      const newValue = Math.max(
        MIN_DURATION,
        Math.min(MAX_DURATION, currentValue + increment),
      );
      updateController({ [key]: newValue });
    },
    [controller, updateController],
  );

  // Time adjustment functions with useCallback
  const adjustTimeUp = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const newTime = addMinutesToTime(controller.submitTime, 30);
      updateController({ submitTime: newTime });
    },
    [controller.submitTime, updateController],
  );

  const adjustTimeDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const newTime = addMinutesToTime(controller.submitTime, -30);
      updateController({ submitTime: newTime });
    },
    [controller.submitTime, updateController],
  );

  const handleLocationChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      e.stopPropagation();
      updateController({ location: e.target.value as any });
    },
    [updateController],
  );


  return (
    <div className="relative">
      {/* Professional Header with Icon and Controls */}
      <div className="border border-border rounded-lg">
        <div className="p-3 flex items-center justify-between">
          {/* Left: Earliest Start Time Display */}
 
          {/* Center: Professional Controls Row */}
          <div className="flex items-center gap-4">
            {/* Flag Time Control - Professional Design */}
            <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 rounded-md border">
              <FlagIcon className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-mono font-medium min-w-[45px]">
                {controller.submitTime}
              </span>
              <div className="flex flex-col gap-0.5">
                <button
                  type="button"
                  onClick={adjustTimeUp}
                  className="p-0.5 hover:bg-blue-50 rounded transition-colors group"
                >
                  <ChevronUp className="w-3 h-3 text-muted-foreground group-hover:text-blue-600" />
                </button>
                <button
                  type="button"
                  onClick={adjustTimeDown}
                  className="p-0.5 hover:bg-blue-50 rounded transition-colors group"
                >
                  <ChevronDown className="w-3 h-3 text-muted-foreground group-hover:text-blue-600" />
                </button>
              </div>
            </div>

            {/* Location Control - Clean Dropdown */}
            <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 rounded-md border">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <select
                value={controller.location}
                onChange={handleLocationChange}
                className="text-sm font-medium bg-transparent border-none focus:outline-none cursor-pointer min-w-[80px]"
              >
                {LOCATION_ENUM_VALUES.map((location) => (
                  <option
                    key={location}
                    value={location}
                    className="bg-background"
                  >
                    {location}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Right: Dropdown Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 hover:bg-muted/50 rounded-md transition-colors"
            title="Duration Settings"
          >
            <Timer
              className={`w-4 h-4 transition-colors ${
                isOpen ? "text-blue-600" : "text-muted-foreground"
              }`}
            />
          </button>
        </div>

        {/* Professional Dropdown Panel */}
        {isOpen && (
          <div className="border-t border-border bg-muted/20">
            <div className="p-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <Timer className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-foreground">
                    Duration Settings
                  </span>
                </div>

                {/* Professional Duration Controls */}
                <div className="grid grid-cols-1 gap-3">
                  {/* Single Student - Clean Row */}
                  <div className="flex items-center justify-between p-3 bg-background rounded-md border">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-muted-foreground w-6">
                        1
                      </span>
                      <span className="text-sm font-medium">
                        Private Lesson
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          adjustDuration("durationCapOne", -DURATION_INCREMENT)
                        }
                        className="w-8 h-8 flex items-center justify-center border border-border hover:bg-muted rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={controller.durationCapOne <= MIN_DURATION}
                      >
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <span className="text-sm font-mono font-bold min-w-[50px] text-center px-2 py-1 bg-muted rounded">
                        {formatHours(controller.durationCapOne)}h
                      </span>
                      <button
                        onClick={() =>
                          adjustDuration("durationCapOne", DURATION_INCREMENT)
                        }
                        className="w-8 h-8 flex items-center justify-center border border-border hover:bg-muted rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={controller.durationCapOne >= MAX_DURATION}
                      >
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  </div>

                  {/* Semi-Private - Clean Row */}
                  <div className="flex items-center justify-between p-3 bg-background rounded-md border">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-muted-foreground w-6">
                        2-3
                      </span>
                      <span className="text-sm font-medium">Semi-Private</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          adjustDuration("durationCapTwo", -DURATION_INCREMENT)
                        }
                        className="w-8 h-8 flex items-center justify-center border border-border hover:bg-muted rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={controller.durationCapTwo <= MIN_DURATION}
                      >
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <span className="text-sm font-mono font-bold min-w-[50px] text-center px-2 py-1 bg-muted rounded">
                        {formatHours(controller.durationCapTwo)}h
                      </span>
                      <button
                        onClick={() =>
                          adjustDuration("durationCapTwo", DURATION_INCREMENT)
                        }
                        className="w-8 h-8 flex items-center justify-center border border-border hover:bg-muted rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={controller.durationCapTwo >= MAX_DURATION}
                      >
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  </div>

                  {/* Group Lesson - Clean Row */}
                  <div className="flex items-center justify-between p-3 bg-background rounded-md border">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-muted-foreground w-6">
                        4+
                      </span>
                      <span className="text-sm font-medium">Group Lesson</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          adjustDuration(
                            "durationCapThree",
                            -DURATION_INCREMENT,
                          )
                        }
                        className="w-8 h-8 flex items-center justify-center border border-border hover:bg-muted rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={controller.durationCapThree <= MIN_DURATION}
                      >
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <span className="text-sm font-mono font-bold min-w-[50px] text-center px-2 py-1 bg-muted rounded">
                        {formatHours(controller.durationCapThree)}h
                      </span>
                      <button
                        onClick={() =>
                          adjustDuration("durationCapThree", DURATION_INCREMENT)
                        }
                        className="w-8 h-8 flex items-center justify-center border border-border hover:bg-muted rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={controller.durationCapThree >= MAX_DURATION}
                      >
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
