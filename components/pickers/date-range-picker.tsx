"use client";

import { useState, useEffect } from "react";
import { Calendar } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DateRangePickerProps {
  availableDates: string[]; // Array of available dates in ISO format
  onRangeChange: (startDate: string | null, endDate: string | null) => void;
  startDate: string | null;
  endDate: string | null;
}

export function DateRangePicker({
  availableDates,
  onRangeChange,
  startDate,
  endDate,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [tempStartDate, setTempStartDate] = useState<string | null>(startDate);
  const [tempEndDate, setTempEndDate] = useState<string | null>(endDate);

  // Get date range info
  const sortedDates = [...availableDates].sort();
  const minDate = sortedDates[0] ? new Date(sortedDates[0]) : new Date();
  const maxDate = sortedDates[sortedDates.length - 1]
    ? new Date(sortedDates[sortedDates.length - 1])
    : new Date();

  // Generate calendar months
  const [displayMonth, setDisplayMonth] = useState(
    new Date(maxDate.getFullYear(), maxDate.getMonth(), 1)
  );

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const { daysInMonth, startingDayOfWeek, year, month } =
    getDaysInMonth(displayMonth);

  const isDateAvailable = (day: number) => {
    const dateStr = new Date(year, month, day).toISOString().split("T")[0];
    return availableDates.includes(dateStr);
  };

  const isDateInRange = (day: number) => {
    if (!tempStartDate || !tempEndDate) return false;
    const dateStr = new Date(year, month, day).toISOString().split("T")[0];
    return dateStr >= tempStartDate && dateStr <= tempEndDate;
  };

  const isDateSelected = (day: number) => {
    const dateStr = new Date(year, month, day).toISOString().split("T")[0];
    return dateStr === tempStartDate || dateStr === tempEndDate;
  };

  const handleDateClick = (day: number) => {
    const dateStr = new Date(year, month, day).toISOString().split("T")[0];
    
    if (!tempStartDate || (tempStartDate && tempEndDate)) {
      // Start new selection
      setTempStartDate(dateStr);
      setTempEndDate(null);
    } else {
      // Complete the range
      if (dateStr < tempStartDate) {
        setTempEndDate(tempStartDate);
        setTempStartDate(dateStr);
      } else {
        setTempEndDate(dateStr);
      }
    }
  };

  const handleApply = () => {
    onRangeChange(tempStartDate, tempEndDate);
    setOpen(false);
  };

  const handleClear = () => {
    setTempStartDate(null);
    setTempEndDate(null);
    onRangeChange(null, null);
    setOpen(false);
  };

  const formatDisplayDate = () => {
    if (!startDate) return "Select custom range";
    if (!endDate) return new Date(startDate).toLocaleDateString("en-GB");
    return `${new Date(startDate).toLocaleDateString("en-GB")} - ${new Date(endDate).toLocaleDateString("en-GB")}`;
  };

  const canNavigatePrev = () => {
    const prevMonth = new Date(displayMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    return prevMonth >= new Date(minDate.getFullYear(), minDate.getMonth(), 1);
  };

  const canNavigateNext = () => {
    const nextMonth = new Date(displayMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return nextMonth <= new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
  };

  const navigateMonth = (direction: "prev" | "next") => {
    const newMonth = new Date(displayMonth);
    newMonth.setMonth(newMonth.getMonth() + (direction === "next" ? 1 : -1));
    setDisplayMonth(newMonth);
  };

  useEffect(() => {
    setTempStartDate(startDate);
    setTempEndDate(endDate);
  }, [startDate, endDate]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start text-left font-normal",
            !startDate && "text-muted-foreground"
          )}
        >
          <Calendar className="mr-2 h-4 w-4" />
          {formatDisplayDate()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-4">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigateMonth("prev")}
              disabled={!canNavigatePrev()}
              className="p-2 hover:bg-muted rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ←
            </button>
            <div className="font-semibold">
              {displayMonth.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </div>
            <button
              onClick={() => navigateMonth("next")}
              disabled={!canNavigateNext()}
              className="p-2 hover:bg-muted rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              →
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-muted-foreground p-2"
              >
                {day}
              </div>
            ))}
            {Array.from({ length: startingDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const available = isDateAvailable(day);
              const inRange = isDateInRange(day);
              const selected = isDateSelected(day);

              return (
                <button
                  key={day}
                  onClick={() => available && handleDateClick(day)}
                  disabled={!available}
                  className={cn(
                    "p-2 text-sm rounded-md transition-colors",
                    available
                      ? "hover:bg-muted cursor-pointer"
                      : "text-muted-foreground/30 cursor-not-allowed",
                    selected && "bg-primary text-primary-foreground hover:bg-primary",
                    inRange && !selected && "bg-primary/20",
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex justify-between gap-2">
            <Button variant="outline" onClick={handleClear} className="flex-1">
              Clear
            </Button>
            <Button
              onClick={handleApply}
              disabled={!tempStartDate}
              className="flex-1"
            >
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
