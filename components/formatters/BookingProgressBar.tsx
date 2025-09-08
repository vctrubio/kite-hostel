"use client";
import { Duration } from "./Duration";

interface BookingProgressBarProps {
  eventMinutes: {
    completed: number;
    planned: number;
    tbc: number;
    cancelled: number;
  };
  totalMinutes: number;
}

export function BookingProgressBar({ eventMinutes, totalMinutes }: BookingProgressBarProps) {
  if (!totalMinutes || totalMinutes === 0) {
    return <span className="text-xs text-muted-foreground">N/A</span>;
  }

  const completedPercentage = (eventMinutes.completed / totalMinutes) * 100;
  const plannedPercentage = (eventMinutes.planned / totalMinutes) * 100;
  const tbcPercentage = (eventMinutes.tbc / totalMinutes) * 100;
  
  // Calculate cumulative percentages for proper positioning
  const completedWidth = Math.min(completedPercentage, 100);
  const plannedWidth = Math.min(plannedPercentage, 100 - completedWidth);
  const tbcWidth = Math.min(tbcPercentage, 100 - completedWidth - plannedWidth);

  const totalUsedMinutes = eventMinutes.completed + eventMinutes.planned + eventMinutes.tbc;

  return (
    <div className="inline-flex items-center gap-2">
      <div
        className="h-3 rounded-full overflow-hidden border border-border bg-gray-100 dark:bg-gray-800"
        style={{ width: "100px" }}
      >
        {/* Completed minutes - Dark Green */}
        <div
          className="h-full bg-green-600 transition-all duration-300 float-left"
          style={{ width: `${completedWidth}%` }}
        />
        {/* Planned minutes - Light Green */}
        <div
          className="h-full bg-green-300 transition-all duration-300 float-left"
          style={{ width: `${plannedWidth}%` }}
        />
        {/* TBC minutes - Purple */}
        <div
          className="h-full bg-purple-500 transition-all duration-300 float-left"
          style={{ width: `${tbcWidth}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground">
        {Math.round(totalUsedMinutes / 60 * 10) / 10}/<Duration minutes={totalMinutes} />
      </span>
    </div>
  );
}