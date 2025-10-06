"use client";

import { SingleDatePicker } from "@/components/pickers/single-date-picker";
import ControllerSettings from "@/components/whiteboard-usage/ControllerSettings";
import { type EventController } from "@/backend/types";
import { HeadsetIcon } from "@/svgs/HeadsetIcon";
import { HelmetIcon } from "@/svgs/HelmetIcon";
import { BookingIcon } from "@/svgs/BookingIcon";
import BillboardActions from "./BillboardActions";
import { ChevronDown, TrendingUp } from "lucide-react";
import { useState } from "react";
import { bulkUpdateEvents, bulkDeleteEvents } from "@/actions/event-actions";

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
  eventStatus: {
    planned: number;
    completed: number;
    tbc: number;
    cancelled: number;
    total: number;
    allIds: string[];
    incompleteIds: string[];
    plannedIds: string[];
    tbcIds: string[];
  };
  bookingStats: {
    totalBookings: number;
    totalRevenue: number;
  };
}

// Sub-components
function StatsSection({
  globalStats,
  teacherCount,
  studentCount,
  eventStatus,
}: Pick<BillboardHeaderProps, "globalStats" | "teacherCount" | "studentCount" | "eventStatus">) {
  const [showLessonDropdown, setShowLessonDropdown] = useState(false);

  const handleLessonAction = async (action: string) => {
    setShowLessonDropdown(false);
    
    if (eventStatus.allIds.length === 0) {
      console.warn("No events to update");
      return;
    }

    try {
      switch (action) {
        case "confirm-all":
          const confirmResult = await bulkUpdateEvents(eventStatus.allIds, { status: "completed" });
          if (confirmResult.success) {
            console.log(`✅ Confirmed ${confirmResult.updatedCount} events`);
          } else {
            console.error("❌ Failed to confirm all events:", confirmResult.error);
          }
          break;
        case "plan-all":
          const planResult = await bulkUpdateEvents(eventStatus.allIds, { status: "planned" });
          if (planResult.success) {
            console.log(`✅ Set ${planResult.updatedCount} events to planned`);
          } else {
            console.error("❌ Failed to set all events to planned:", planResult.error);
          }
          break;
        case "set-tbc":
          const tbcResult = await bulkUpdateEvents(eventStatus.allIds, { status: "tbc" });
          if (tbcResult.success) {
            console.log(`✅ Set ${tbcResult.updatedCount} events to TBC`);
          } else {
            console.error("❌ Failed to set all events to TBC:", tbcResult.error);
          }
          break;
      }
    } catch (error) {
      console.error("❌ Error performing bulk action:", error);
    }
  };

  return (
    <div className="w-72">
      <div className="border border-border rounded-lg bg-card min-h-[100px] h-full">
        <div className="space-y-2">
          <div className="flex items-center justify-between p-4 pb-0">
            <h3 className="font-medium text-foreground">Stats</h3>
            <div className="relative">
              <button
                onClick={() => setShowLessonDropdown(!showLessonDropdown)}
                className={`flex items-center gap-1 px-2 py-1 text-xs rounded-full transition-colors ${
                  eventStatus.completed === eventStatus.total && eventStatus.total > 0
                    ? 'bg-green-100 dark:bg-green-900 hover:bg-green-200 dark:hover:bg-green-800 text-green-800 dark:text-green-200'
                    : eventStatus.tbc === eventStatus.total && eventStatus.total > 0
                    ? 'bg-purple-100 dark:bg-purple-900 hover:bg-purple-200 dark:hover:bg-purple-800 text-purple-800 dark:text-purple-200'
                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <span className="font-medium">{eventStatus.completed}/{eventStatus.total}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              
              {/* Dropdown */}
              {showLessonDropdown && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 border border-border rounded-lg shadow-lg z-10">
                  <div className="py-1">
                    <button
                      onClick={() => handleLessonAction("confirm-all")}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Confirm All Lessons
                    </button>
                    <button
                      onClick={() => handleLessonAction("plan-all")}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Set All Lessons to Planned
                    </button>
                    <button
                      onClick={() => handleLessonAction("set-tbc")}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 text-purple-600 dark:text-purple-400"
                    >
                      Set All TBC
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
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
  onActionClick,
  eventStatus
}: Pick<BillboardHeaderProps, "controller" | "onControllerChange" | "onActionClick" | "eventStatus">) {
  const [showNoWindConfirm, setShowNoWindConfirm] = useState(false);
  
  const handleNoWindConfirm = () => {
    onActionClick("nowind");
    setShowNoWindConfirm(false);
  };

  const handleLessonAction = async (action: string) => {
    setShowNoWindConfirm(false);
    
    if (eventStatus.allIds.length === 0) {
      console.warn("No events to update");
      return;
    }

    try {
      switch (action) {
        case "delete-tbc":
          const tbcDeleteResult = await bulkDeleteEvents(eventStatus.tbcIds);
          if (tbcDeleteResult.success) {
            console.log(`✅ Deleted ${tbcDeleteResult.deletedCount} TBC events`);
          } else {
            console.error("❌ Failed to delete TBC events:", tbcDeleteResult.error);
          }
          break;
        case "delete-planned":
          const plannedDeleteResult = await bulkDeleteEvents(eventStatus.plannedIds);
          if (plannedDeleteResult.success) {
            console.log(`✅ Deleted ${plannedDeleteResult.deletedCount} planned events`);
          } else {
            console.error("❌ Failed to delete planned events:", plannedDeleteResult.error);
          }
          break;
        case "delete-uncompleted":
          const uncompletedIds = [...eventStatus.plannedIds, ...eventStatus.tbcIds];
          const uncompletedDeleteResult = await bulkDeleteEvents(uncompletedIds);
          if (uncompletedDeleteResult.success) {
            console.log(`✅ Deleted ${uncompletedDeleteResult.deletedCount} uncompleted events`);
          } else {
            console.error("❌ Failed to delete uncompleted events:", uncompletedDeleteResult.error);
          }
          break;
      }
    } catch (error) {
      console.error("❌ Error performing bulk action:", error);
    }
  };
  
  return (
    <div>
      <div className="border border-border rounded-lg bg-card min-h-[100px] h-full">
        <div className="space-y-2">
          <div className="flex items-center justify-between p-4 pb-0">
            <h3 className="font-medium text-foreground">Event Settings</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">No Wind</span>
              <button
                onClick={() => setShowNoWindConfirm(!showNoWindConfirm)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                  showNoWindConfirm
                    ? 'bg-red-600'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    showNoWindConfirm ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
          <div className="border-t border-border p-3">
            <ControllerSettings
              controller={controller}
              onControllerChange={onControllerChange}
            />
            {showNoWindConfirm && (
              <div className="mt-3 pt-3 border-t border-border">
                <div className="grid grid-cols-1 gap-2">
                  {eventStatus.total > 0 && (
                    <button
                      onClick={handleNoWindConfirm}
                      className="px-3 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 hover:border-red-300 transition-colors dark:bg-red-900/20 dark:text-red-300 dark:border-red-800 dark:hover:bg-red-900/30"
                    >
                      Delete All ({eventStatus.total})
                    </button>
                  )}
                  
                  <div className="grid grid-cols-3 gap-2">
                    {(eventStatus.planned > 0 || eventStatus.tbc > 0) && (
                      <button
                        onClick={() => handleLessonAction("delete-uncompleted")}
                        className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 hover:border-gray-300 transition-colors dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800 dark:hover:bg-gray-900/30 flex flex-col items-center"
                      >
                        <span>Uncompleted</span>
                        <span className="text-xs">({eventStatus.planned + eventStatus.tbc})</span>
                      </button>
                    )}
                    
                    {eventStatus.tbc > 0 && (
                      <button
                        onClick={() => handleLessonAction("delete-tbc")}
                        className="px-3 py-2 text-sm font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-md hover:bg-purple-100 hover:border-purple-300 transition-colors dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800 dark:hover:bg-purple-900/30 flex flex-col items-center"
                      >
                        <span>TBC</span>
                        <span className="text-xs">({eventStatus.tbc})</span>
                      </button>
                    )}
                    
                    {eventStatus.planned > 0 && (
                      <button
                        onClick={() => handleLessonAction("delete-planned")}
                        className="px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 hover:border-blue-300 transition-colors dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800 dark:hover:bg-blue-900/30 flex flex-col items-center"
                      >
                        <span>Planned</span>
                        <span className="text-xs">({eventStatus.planned})</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionSettingsSection({ 
  onActionClick, 
  exportDebugMode, 
  onExportDebugModeChange,
  eventStatus: _eventStatus
}: Pick<BillboardHeaderProps, "onActionClick" | "exportDebugMode" | "onExportDebugModeChange" | "eventStatus">) {
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

function DateSection({ selectedDate, onDateChange, bookingStats }: Pick<BillboardHeaderProps, "selectedDate" | "onDateChange" | "bookingStats">) {
  return (
    <div className="col-span-1">
      <div className="border border-border rounded-lg bg-card min-h-[100px] h-full">
        <div className="space-y-2">
          <div className="flex items-center justify-between p-4 pb-0">
            <h3 className="font-medium text-foreground">Date</h3>
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1">
                <BookingIcon className="w-4 h-4 text-blue-500" />
                <div className="text-center">
                  <div className="font-semibold text-blue-600 dark:text-blue-400">
                    {bookingStats.totalBookings}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <div className="text-center">
                  <div className="font-semibold text-green-600 dark:text-green-400">
                    €{Math.round(bookingStats.totalRevenue)}
                  </div>
                </div>
              </div>
            </div>
          </div>
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