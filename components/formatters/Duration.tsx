
"use client";

interface DurationProps {
  minutes: number;
}

export function Duration({ minutes }: DurationProps) {
  if (minutes < 60) {
    return <span>{minutes}m</span>;
  }

  const hours = minutes / 60;
  const formattedDuration = Number.isInteger(hours) ? hours : hours.toFixed(1);

  return <span>{formattedDuration}h</span>;
}
