"use client";

import { format, differenceInDays, differenceInMonths } from "date-fns";

interface DateSinceProps {
  dateString: string;
}

export function DateSince({ dateString }: DateSinceProps) {
  const date = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );

  const daysDiff = differenceInDays(targetDate, today);

  let bgColorClass = "";
  let relativeTime = "";

  if (daysDiff === 0) {
    bgColorClass = "bg-green-500"; // Today
    relativeTime = "Today";
  } else if (daysDiff < 0) {
    bgColorClass = "bg-gray-200 text-gray-800"; // Past - Light grey-green
    const absDaysDiff = Math.abs(daysDiff);
    if (absDaysDiff < 30) {
      relativeTime = `-${absDaysDiff}d`;
    } else {
      const months = differenceInMonths(today, targetDate);
      if (months === 0) {
        relativeTime = `-${absDaysDiff}d`; // Fallback if less than a month but more than 30 days
      } else if (months % 1 === 0) {
        relativeTime = `-${months}m`;
      } else {
        relativeTime = `-${months.toFixed(1)}m`;
      }
    }
  } else {
    bgColorClass = "bg-blue-300"; // Future
    if (daysDiff < 30) {
      relativeTime = `${daysDiff}d`;
    } else {
      const months = differenceInMonths(targetDate, today);
      if (months === 0) {
        relativeTime = `${daysDiff}d`; // Fallback if less than a month but more than 30 days
      } else if (months % 1 === 0) {
        relativeTime = `${months}m`;
      } else {
        relativeTime = `${months.toFixed(1)}m`;
      }
    }
  }

  const formattedDate = format(date, "d MMMM"); // e.g., 2 August

  return (
    <span className="font-semibold">
      {formattedDate}{" "}
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColorClass}`}
      >
        {relativeTime}
      </span>
    </span>
  );
}
