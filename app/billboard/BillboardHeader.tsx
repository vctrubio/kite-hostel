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
    <div className="mb-6 space-y-4">
      {/* Header Controls Row */}
      <div className="flex items-start gap-2">
        {/* Date Picker */}
        <div className="bg-card rounded-lg border border-border p-3">
          <SingleDatePicker
            selectedDate={selectedDate || undefined}
            onDateChange={onDateChange}
          />
        </div>

        {/* <div className="flex-1"> */}
        {/*   <ControllerSettings */}
        {/*     controller={controller} */}
        {/*     onControllerChange={onControllerChange} */}
        {/*   /> */}
        {/* </div> */}
      </div>
    </div>
  );
}
