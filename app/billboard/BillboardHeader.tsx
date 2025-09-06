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
  // Calculate global stats from teacher schedules

  const handleActionClick = async (actionId: 'share' | 'medical' | 'csv' | 'print') => {
    console.log(`Billboard action: ${actionId}`);
    // TODO: Implement billboard-specific actions
  };

  return (
    <div className="mb-6 space-y-4">
      {/* Title */}
      <h1 className="text-3xl font-bold text-foreground">Billboard</h1>

      {/* Header Controls Row */}
      <div className="flex items-start gap-2">
        {/* Date Picker */}
        <div className="bg-card rounded-lg border border-border p-3">
          <SingleDatePicker
            selectedDate={selectedDate || undefined}
            onDateChange={onDateChange}
          />
        </div>


        {/* Actions with 2x2 grid styling */}
        <div className="bg-card rounded-lg border border-border p-3">
          <h3 className="text-xs font-medium text-muted-foreground mb-2">Actions</h3>
          <div className="grid grid-cols-2 gap-1">
            <button
              onClick={() => handleActionClick('share')}
              className="px-2 py-1 text-[10px] font-medium rounded transition-all duration-200 border flex items-center justify-center gap-1 text-foreground hover:bg-muted/50 border-transparent"
              title="Share to WhatsApp"
            >
              Share
            </button>
            <button
              onClick={() => handleActionClick('medical')}
              className="px-2 py-1 text-[10px] font-medium rounded transition-all duration-200 border flex items-center justify-center gap-1 text-foreground hover:bg-muted/50 border-transparent"
              title="Generate Medical Email"
            >
              Medical
            </button>
            <button
              onClick={() => handleActionClick('csv')}
              className="px-2 py-1 text-[10px] font-medium rounded transition-all duration-200 border flex items-center justify-center gap-1 text-foreground hover:bg-muted/50 border-transparent"
              title="Export CSV"
            >
              CSV
            </button>
            <button
              onClick={() => handleActionClick('print')}
              className="px-2 py-1 text-[10px] font-medium rounded transition-all duration-200 border flex items-center justify-center gap-1 text-foreground hover:bg-muted/50 border-transparent"
              title="Print Lesson Plan"
            >
              Print
            </button>
          </div>
        </div>

        <div className="flex-1">
          <ControllerSettings
            controller={controller}
            onControllerChange={onControllerChange}
          />
        </div>
      </div>
    </div>
  );
}
