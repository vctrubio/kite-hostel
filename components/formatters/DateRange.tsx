import React from "react";
import { differenceInCalendarDays } from "date-fns";

export interface DatePickerRange {
  startDate: string;
  endDate: string;
}

export const getDateString = (date: Date) => {
  const month = date.toLocaleString("en-US", {
    month: "long",
    timeZone: "Europe/Madrid",
  });
  const day = date.getDate();
  const year = date.getFullYear();
  const currentYear = new Date().getFullYear();
  return currentYear !== year ? `${month} ${day}, ${year}` : `${month} ${day}`;
};

/**
 * Component to display a date range with start and end dates in an inline format
 */
export const FormatDateRange = ({ startDate, endDate }: DatePickerRange) => {
  if (!startDate) {
    return <span className="text-red-400">No start date found</span>;
  }
  // console.log("start date", startDate);
  // console.log("end date", endDate);

  if (!endDate) {
    return <span className="text-red-400">No end date found</span>;
  }

  // return start date and end date

  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);

  if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
    return <span className="text-gray-400 ">Invalid date range</span>;
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startDateOnly = new Date(
    startDateObj.getFullYear(),
    startDateObj.getMonth(),
    startDateObj.getDate(),
  );
  const endDateOnly = new Date(
    endDateObj.getFullYear(),
    endDateObj.getMonth(),
    endDateObj.getDate(),
  );

  // Calculate duration in days
  const durationDays = differenceInCalendarDays(endDateObj, startDateObj) + 1;

  // Determine badge color based on current date
  const getBadgeColor = () => {
    const isActive = today >= startDateOnly && today <= endDateOnly;
    const isPast = today > endDateOnly;

    if (isActive) {
      return "bg-green-200 text-green-800";
    } else if (isPast) {
      return "bg-gray-200 text-gray-600";
    } else {
      return "bg-blue-200 text-blue-800";
    }
  };

  const badgeColor = getBadgeColor();
  const startDateString = getDateString(startDateObj);

  return (
    <div className="inline-flex items-center gap-2">
      {/* Date Range */}
      <div className="font-semibold">{startDateString}</div>

      {/* Duration Badge with Color */}
      <div className={`px-2 rounded-sm ${badgeColor}`}>{durationDays}d</div>
    </div>
  );
};
