
"use client";

interface DurationProps {
  minutes: number;
}

export function Duration({ minutes }: DurationProps) {
  if (minutes === 0) {
    return <span>0</span>;
  }

  if (minutes < 60) {
    return <span>{minutes}m</span>;
  }

  const hours = minutes / 60;
  const formattedDuration = Number.isInteger(hours) ? hours : hours.toFixed(1);

  return <span>{formattedDuration}h</span>;
}

export function formatHours(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = minutes / 60;
  return Number.isInteger(hours) ? `${hours}` : `${hours.toFixed(1)}`;
}
