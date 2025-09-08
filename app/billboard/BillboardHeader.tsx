"use client";

import { SingleDatePicker } from "@/components/pickers/single-date-picker";
import ControllerSettings from "@/components/whiteboard-usage/ControllerSettings";
import { type EventController } from "@/backend/types";
import { HeadsetIcon } from "@/svgs/HeadsetIcon";
import { HelmetIcon } from "@/svgs/HelmetIcon";
import BillboardActions from "@/components/whiteboard-usage/BillboardActions";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

// Props Interface
interface BillboardHeaderProps {
  selectedDate: string | null;
  onDateChange: (date: string) => void;
  controller: EventController;
  onControllerChange: (controller: EventController) => void;
  globalStats: {
    eventCount: number;
    totalHours: number;
    earnings: {
      teacher: number;
      school: number;
    };
  };
  teacherCount: number;
  studentCount: number;
  onActionClick: (action: string) => void;
  exportDebugMode: boolean;
  onExportDebugModeChange: (enabled: boolean) => void;
}

// Sub-components
function StatsSection({
  globalStats,
  teacherCount,
  studentCount,
}: Pick<BillboardHeaderProps, "globalStats" | "teacherCount" | "studentCount">) {
  return (
    <div className="w-72">
      <div className="border border-border rounded-lg bg-card min-h-[100px] h-full">
        <div className="space-y-2">
          <h3 className="font-medium text-foreground p-4 pb-0">Stats</h3>
          <div className="border-t border-border p-3">
            <div className="space-y-2">
              <div className="flex justify-around items-center">
                <div className="flex items-center gap-2">
                  <HeadsetIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="font-semibold">{teacherCount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <HelmetIcon className="w-5 h-5" />
                  <span className="font-semibold">{studentCount}</span>
                </div>
              </div>
              <div className="py-2">
                <div className="grid grid-cols-4 gap-2 text-sm">
                  <div className="text-center">
                    <div className="font-semibold text-indigo-600 dark:text-indigo-400">
                      {globalStats.eventCount}
                    </div>
                    <div className="text-xs text-muted-foreground">Events</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-purple-600 dark:text-purple-400">
                      {globalStats.totalHours}h
                    </div>
                    <div className="text-xs text-muted-foreground">Duration</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-green-600 dark:text-green-400">
                      €{Math.round(globalStats.earnings.teacher)}
                    </div>
                    <div className="text-xs text-muted-foreground">Teacher</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-orange-600 dark:text-orange-400">
                      €{Math.round(globalStats.earnings.school)}
                    </div>
                    <div className="text-xs text-muted-foreground">School</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EventSettingsSection({
  controller,
  onControllerChange,
}: Pick<BillboardHeaderProps, "controller" | "onControllerChange">) {
  return (
    <div>
      <div className="border border-border rounded-lg bg-card min-h-[100px] h-full">
        <div className="space-y-2">
          <h3 className="font-medium text-foreground p-4 pb-0">Event Settings</h3>
          <div className="border-t border-border p-3">
            <ControllerSettings
              controller={controller}
              onControllerChange={onControllerChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionSettingsSection({ 
  onActionClick, 
  exportDebugMode, 
  onExportDebugModeChange 
}: Pick<BillboardHeaderProps, "onActionClick" | "exportDebugMode" | "onExportDebugModeChange">) {
  return (
    <div>
      <div className="border border-border rounded-lg bg-card min-h-[100px] h-full">
        <div className="space-y-2">
          <div className="flex items-center justify-between p-4 pb-0">
            <h3 className="font-medium text-foreground">Action Settings</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Debug</span>
              <button
                onClick={() => onExportDebugModeChange(!exportDebugMode)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  exportDebugMode
                    ? 'bg-blue-600'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    exportDebugMode ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
          <div className="border-t border-border p-3">
            <BillboardActions onActionClick={onActionClick} />
          </div>
        </div>
      </div>
    </div>
  );
}

function DateSection({ selectedDate, onDateChange }: Pick<BillboardHeaderProps, "selectedDate" | "onDateChange">) {
  return (
    <div className="col-span-1">
      <div className="border border-border rounded-lg bg-card min-h-[100px] h-full">
        <div className="space-y-2">
          <h3 className="font-medium text-foreground p-4 pb-0">Date</h3>
          <div className="border-t border-border p-3">
            <SingleDatePicker
              selectedDate={selectedDate || undefined}
              onDateChange={onDateChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Component
export default function BillboardHeader(props: BillboardHeaderProps) {
  return (
    <div className="mb-6">
      <div className="grid grid-cols-4 gap-4">
        <div className="col-span-3">
          <div className="flex gap-4">
            <StatsSection {...props} />
            <div className="flex-1 grid grid-cols-2 gap-4">
              <EventSettingsSection {...props} />
              <ActionSettingsSection {...props} />
            </div>
          </div>
        </div>
        <DateSection {...props} />
      </div>
    </div>
  );
}