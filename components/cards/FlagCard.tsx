"use client";

import { useState } from "react";
import { Duration } from "@/components/formatters/Duration";
import { DateTime } from "@/components/formatters/DateTime";
import { FlagIcon } from "@/svgs";
import { HelmetIcon } from "@/svgs/HelmetIcon";
import { ChevronDown, ChevronUp, DollarSign } from "lucide-react";

interface FlagCardProps {
  startTime: string;
  duration: number;
  students: string[];
  status: "planned" | "completed" | "tbc" | "cancelled";
  teacherEarnings?: number;
  schoolEarnings?: number;
  onStatusChange?: (newStatus: "planned" | "completed" | "tbc" | "cancelled") => void;
}

const STATUS_COLORS = {
  planned: "bg-blue-500",
  tbc: "bg-purple-500", 
  completed: "bg-green-500",
  cancelled: "bg-orange-500",
} as const;

const STATUS_LABELS = {
  planned: "Planned",
  tbc: "To Be Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
} as const;

export default function FlagCard({
  startTime,
  duration,
  students,
  status,
  teacherEarnings,
  schoolEarnings,
  onStatusChange,
}: FlagCardProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  
  const handleStatusChange = (newStatus: typeof status) => {
    onStatusChange?.(newStatus);
    setShowDropdown(false);
  };

  const statusColor = STATUS_COLORS[status];
  const statusLabel = STATUS_LABELS[status];

  return (
    <div className="w-[285px] bg-card border border-border rounded-lg overflow-hidden">
      <div className="p-4 flex items-start gap-4">
        <div className="flex flex-col items-center gap-2">
          <FlagIcon className="w-12 h-12" />
          <div className="flex gap-1">
            {students.map((_, index) => (
              <HelmetIcon key={index} className="w-4 h-4 text-yellow-500" />
            ))}
          </div>
        </div>
        <div className="flex-1">
          <div className="text-xl font-bold text-foreground">
            <DateTime dateString={startTime} formatType="time" />
          </div>
          <div className="text-muted-foreground text-sm">
            +<Duration minutes={duration} />
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {students.map((student, index) => (
              <span key={index} className="text-sm font-medium text-foreground">
                {student}
                {index < students.length - 1 && ","}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Status dropdown footer */}
      <div className="border-t border-border bg-muted/30">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${statusColor}`} />
            <span className="text-sm font-medium">{statusLabel}</span>
            {status === "completed" && (teacherEarnings || schoolEarnings) && (
              <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                <DollarSign className="w-3 h-3" />
                <span>Earnings calculated</span>
              </div>
            )}
          </div>
          {showDropdown ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>

        {showDropdown && (
          <div className="px-4 pb-4 space-y-2">
            {/* Status options */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleStatusChange("planned")}
                className={`px-3 py-2 text-sm rounded transition-colors ${
                  status === "planned"
                    ? "bg-blue-500 text-white"
                    : "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-900/50"
                }`}
              >
                Planned
              </button>
              <button
                onClick={() => handleStatusChange("tbc")}
                className={`px-3 py-2 text-sm rounded transition-colors ${
                  status === "tbc"
                    ? "bg-purple-500 text-white"
                    : "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 hover:bg-purple-200 dark:hover:bg-purple-900/50"
                }`}
              >
                TBC
              </button>
              <button
                onClick={() => handleStatusChange("completed")}
                className={`px-3 py-2 text-sm rounded transition-colors ${
                  status === "completed"
                    ? "bg-green-500 text-white"
                    : "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-900/50"
                }`}
              >
                Completed
              </button>
              <button
                onClick={() => handleStatusChange("cancelled")}
                className={`px-3 py-2 text-sm rounded transition-colors ${
                  status === "cancelled"
                    ? "bg-orange-500 text-white"
                    : "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 hover:bg-orange-200 dark:hover:bg-orange-900/50"
                }`}
              >
                Cancelled
              </button>
            </div>

            {/* Earnings breakdown for completed status */}
            {status === "completed" && (teacherEarnings || schoolEarnings) && (
              <div className="mt-3 pt-3 border-t border-border space-y-2">
                <div className="text-xs font-medium text-muted-foreground mb-2">
                  Earnings Breakdown:
                </div>
                {teacherEarnings && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Teacher:</span>
                    <span className="font-medium text-green-600 dark:text-green-400">
                      €{teacherEarnings.toFixed(2)}
                    </span>
                  </div>
                )}
                {schoolEarnings && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">School:</span>
                    <span className="font-medium text-blue-600 dark:text-blue-400">
                      €{schoolEarnings.toFixed(2)}
                    </span>
                  </div>
                )}
                {teacherEarnings && schoolEarnings && (
                  <div className="flex justify-between items-center text-sm pt-2 border-t border-border">
                    <span className="font-medium">Total:</span>
                    <span className="font-bold">
                      €{(teacherEarnings + schoolEarnings).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}