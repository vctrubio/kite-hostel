"use client";

import { SingleDatePicker } from "@/components/pickers/single-date-picker";
import ControllerSettings from "@/components/whiteboard-usage/ControllerSettings";
import GlobalStatsHeader from "@/components/whiteboard-usage/GlobalStatsHeader";
import { TeacherSchedule } from "@/backend/TeacherSchedule";
import { type EventController } from "@/backend/types";
import { useMemo } from "react";

interface BillboardHeaderProps {
  selectedDate: string | null;
  onDateChange: (date: string) => void;
  controller: EventController;
  onControllerChange: (controller: EventController) => void;
}

export default function BillboardHeader({
  selectedDate,
  onDateChange,
  controller,
  onControllerChange,
}: BillboardHeaderProps) {
  return (
    <div className="mb-6">
      <div className="grid grid-cols-4 gap-4">
        {/* Left Section - Date Picker (spans 3 cols like TeacherColumnComplex) */}
        <div className="col-span-3">
          <div className="border border-border rounded-lg bg-card">
            <div className="flex min-h-[100px]">
              {/* Left Column - Date Picker (matches teacher info width) */}
              <div className="w-72 p-4 border-r border-border flex-shrink-0">
                <div className="space-y-2">
                  <h3 className="font-medium text-foreground">Date Selection</h3>
                  <SingleDatePicker
                    selectedDate={selectedDate || undefined}
                    onDateChange={onDateChange}
                  />
                </div>
              </div>

              {/* Right Column - Controller (matches events section) */}
              <div className="flex-1 p-4">
                <div className="space-y-2">
                  <h3 className="font-medium text-foreground">Event Settings</h3>
                  <ControllerSettings
                    controller={controller}
                    onControllerChange={onControllerChange}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Stats (spans 1 col like StudentBookingColumn) */}
        <div className="col-span-1">
          <div className="border border-border rounded-lg bg-card p-4 min-h-[100px]">
            <div className="space-y-2">
              <h3 className="font-medium text-foreground">Daily Stats</h3>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-lg font-bold">Hello Stats</div>
                <div className="text-xs text-muted-foreground">placeholder</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
