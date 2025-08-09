"use client";
import { Duration } from "./Duration";

interface BookingProgressBarProps {
  usedMinutes: number;
  totalMinutes: number;
}

export function BookingProgressBar({ usedMinutes, totalMinutes }: BookingProgressBarProps) {
  if (!totalMinutes || totalMinutes === 0) {
    return <span className="text-xs text-muted-foreground">N/A</span>;
  }

  const progressPercentage = (usedMinutes / totalMinutes) * 100;

  let fillColorClass = "bg-gray-300"; // Default: grey for in-progress
  if (usedMinutes >= totalMinutes) {
    fillColorClass = "bg-green-500"; // Completed or over, but within limits
  }
  if (usedMinutes > totalMinutes) {
    fillColorClass = "bg-red-300"; // Light red for over-duration
  }

  return (
    <div className="inline-flex items-center gap-2">
      <div
        className="h-3 rounded-full overflow-hidden border border-gray-200"
        style={{ width: "100px" }}
      >
        <div
          className={`h-full ${fillColorClass} rounded-full transition-all duration-300`}
          style={{ width: `${Math.min(progressPercentage, 100)}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground">
        <Duration minutes={usedMinutes} />/<Duration minutes={totalMinutes} />
      </span>
    </div>
  );
}
