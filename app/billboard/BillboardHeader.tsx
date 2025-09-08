"use client";

import { SingleDatePicker } from "@/components/pickers/single-date-picker";
import ControllerSettings from "@/components/whiteboard-usage/ControllerSettings";
import { type EventController } from "@/backend/types";
import { HeadsetIcon } from "@/svgs/HeadsetIcon";
import { HelmetIcon } from "@/svgs/HelmetIcon";
import BillboardActions from "@/components/whiteboard-usage/BillboardActions";

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
}

export default function BillboardHeader({
  selectedDate,
  onDateChange,
  controller,
  onControllerChange,
  globalStats,
  teacherCount,
  studentCount,
  onActionClick,
}: BillboardHeaderProps) {
  return (
    <div className="mb-6">
      <div className="grid grid-cols-4 gap-4">
        {/* Left & Middle Sections */}
        <div className="col-span-3">
          <div className="flex gap-4">
            {/* Left Section - Stats */}
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

            {/* Middle Section - Controller */}
            <div className="flex-1 grid grid-cols-2 gap-4">
              {/* Event Settings */}
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
              {/* Action Settings */}
              <div>
                <div className="border border-border rounded-lg bg-card min-h-[100px] h-full">
                  <div className="space-y-2">
                    <h3 className="font-medium text-foreground p-4 pb-0">Action Settings</h3>
                    <BillboardActions onActionClick={onActionClick} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Date Picker */}
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
      </div>
    </div>
  );
}

