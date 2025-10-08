"use client";

import { useEffect } from "react";

export interface DateRange {
  startDate: string;
  endDate: string;
}

interface DatePickerProps {
  dateRange: DateRange;
  setDateRange: (dateRange: DateRange) => void;
  disabled?: boolean;
  allowPastDates?: boolean;
}

// Helper function to get relative date label
function getRelativeDateLabel(date: Date): string {
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  const targetDate = new Date(date);
  targetDate.setHours(12, 0, 0, 0);

  const todayDateString = today.toDateString();
  const targetDateString = targetDate.toDateString();

  if (todayDateString === targetDateString) return "Today";

  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  if (diffDays > 1) return `In ${diffDays} days`;
  if (diffDays < -1) return `${Math.abs(diffDays)} days ago`;
  return "";
}

export function DatePicker({
  dateRange,
  setDateRange,
  disabled = false,
  allowPastDates = false,
}: DatePickerProps) {
  // Helper function to create today's date in ISO format
  const getTodayISO = () => {
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}T12:00:00.000Z`;
  };

  // Helper function to create tomorrow's date in ISO format
  const getTomorrowISO = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(12, 0, 0, 0);
    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
    const day = String(tomorrow.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}T12:00:00.000Z`;
  };

  // Initialize with proper dates if empty
  useEffect(() => {
    if (!dateRange.startDate || !dateRange.endDate) {
      setDateRange({
        startDate: getTodayISO(),
        endDate: getTomorrowISO(),
      });
    }
  }, [dateRange.startDate, dateRange.endDate, setDateRange]);

  // Check if a date is before today
  const isBeforeToday = (dateString: string): boolean => {
    if (!dateString) return true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(dateString.split("T")[0]);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate < today;
  };

  // Force dates to be valid - if start date is before today and past dates not allowed, use today
  let safeStartDate = dateRange.startDate || getTodayISO();
  let safeEndDate = dateRange.endDate || getTomorrowISO();

  if (!allowPastDates && isBeforeToday(safeStartDate)) {
    safeStartDate = getTodayISO();
    safeEndDate = getTomorrowISO();

    // Update parent immediately with correct dates
    setTimeout(() => {
      setDateRange({ startDate: safeStartDate, endDate: safeEndDate });
    }, 0);
  }

  // Helper function to convert local date to ISO string
  const formatToISOString = (date: Date, _isEndDate = false): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}T12:00:00.000Z`;
  };

  const startDate = new Date(safeStartDate);
  const endDate = new Date(safeEndDate);

  const startRelativeLabel = getRelativeDateLabel(startDate);
  const endRelativeLabel = getRelativeDateLabel(endDate);

  const daysDifference = Math.max(
    1,
    Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    ) + 1,
  );

  const updateParent = (newStartDate: Date, newEndDate: Date) => {
    const startISO = formatToISOString(newStartDate, false);
    const endISO = formatToISOString(newEndDate, true);
    setDateRange({ startDate: startISO, endDate: endISO });
  };

  const incrementEndDate = () => {
    if (disabled) return;
    const newEndDate = new Date(endDate);
    newEndDate.setDate(newEndDate.getDate() + 1);
    updateParent(startDate, newEndDate);
  };

  const decrementEndDate = () => {
    if (disabled) return;
    if (daysDifference <= 1) return;
    const newEndDate = new Date(endDate);
    newEndDate.setDate(newEndDate.getDate() - 1);
    updateParent(startDate, newEndDate);
  };

  const incrementStartDate = () => {
    if (disabled) return;
    const newStartDate = new Date(startDate);
    newStartDate.setDate(newStartDate.getDate() + 1);
    let newEndDate = new Date(endDate);
    if (newStartDate >= newEndDate) {
      newEndDate = new Date(newStartDate);
      newEndDate.setDate(newEndDate.getDate() + 1);
    }
    updateParent(newStartDate, newEndDate);
  };

  const decrementStartDate = () => {
    if (disabled) return;
    const newStartDate = new Date(startDate);
    newStartDate.setDate(newStartDate.getDate() - 1);
    if (!allowPastDates && isBeforeToday(newStartDate.toISOString())) return;
    updateParent(newStartDate, endDate);
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const dateString = e.target.value;
    const [year, month, day] = dateString.split("-").map(Number);
    const selectedDate = new Date(year, month - 1, day);
    selectedDate.setHours(12, 0, 0, 0);

    let newEndDate = new Date(endDate);
    if (selectedDate >= endDate) {
      newEndDate = new Date(selectedDate);
      newEndDate.setDate(newEndDate.getDate() + 1);
    }

    updateParent(selectedDate, newEndDate);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const dateString = e.target.value;
    const [year, month, day] = dateString.split("-").map(Number);
    const selectedDate = new Date(year, month - 1, day);
    selectedDate.setHours(12, 0, 0, 0);

    if (selectedDate <= startDate) return;

    updateParent(startDate, selectedDate);
  };

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const getMinEndDate = () => {
    const minDate = new Date(startDate);
    minDate.setDate(minDate.getDate() + 1);
    return formatDateForInput(minDate);
  };

  const getTodayDate = () => {
    const today = new Date();
    return formatDateForInput(today);
  };

  const getMinStartDate = () => {
    if (allowPastDates) return undefined;
    return getTodayDate();
  };

  return (
    <div
      className={` bg-card p-3 space-y-4 ${disabled ? "opacity-50 pointer-events-none" : ""}`}
    >
      {/* Start and End Date Side by Side */}
      <div className="grid grid-cols-2 gap-8">
        {/* Start Date */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            Start Date
            {startRelativeLabel && (
              <span className="text-xs bg-muted px-2 py-1 rounded-md text-muted-foreground">
                {startRelativeLabel}
              </span>
            )}
            <div className="flex items-center gap-1 ml-auto">
              <button
                type="button"
                onClick={decrementStartDate}
                className="btn-icon-round-sm"
              >
                -
              </button>
              <button
                type="button"
                onClick={incrementStartDate}
                className="btn-icon-round-sm"
              >
                +
              </button>
            </div>
          </label>
          <input
            type="date"
            value={formatDateForInput(startDate)}
            onChange={handleStartDateChange}
            min={getMinStartDate()}
            className="w-full p-3 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>

        {/* End Date */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            End Date
            {endRelativeLabel && (
              <span className="text-xs bg-muted px-2 py-1 rounded-md text-muted-foreground">
                {endRelativeLabel}
              </span>
            )}
          </label>
          <input
            type="date"
            value={formatDateForInput(endDate)}
            onChange={handleEndDateChange}
            min={getMinEndDate()}
            className="w-full p-3 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>
      </div>

      {/* Increment/Decrement Buttons */}
      <div className="flex items-center justify-center space-x-4">
        <button
          type="button"
          onClick={decrementEndDate}
          disabled={daysDifference <= 1}
          className="btn-round-outline btn-round-sm"
        >
          - 1 Day
        </button>

        <span className="text-sm font-medium text-foreground px-2">
          {daysDifference} day{daysDifference !== 1 ? "s" : ""}
        </span>

        <button
          type="button"
          onClick={incrementEndDate}
          className="btn-round-outline btn-round-sm"
        >
          + 1 Day
        </button>
      </div>
    </div>
  );
}
