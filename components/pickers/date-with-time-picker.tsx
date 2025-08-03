"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Clock, ChevronUp, ChevronDown } from "lucide-react";
import { format, addDays, subDays, addMinutes, subMinutes } from "date-fns";
import { cn } from "@/lib/utils";

interface DateWithTimePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  defaultTime?: string;
}

export function DateWithTimePicker({
  value,
  onChange,
  disabled = false,
  className,
  defaultTime = "11:00"
}: DateWithTimePickerProps) {
  const [dateOpen, setDateOpen] = useState(false);
  const [timeValue, setTimeValue] = useState(() => {
    if (value) {
      return format(value, "HH:mm");
    }
    return defaultTime;
  });

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      // Combine selected date with current time
      const [hours, minutes] = timeValue.split(':').map(Number);
      const newDateTime = new Date(selectedDate);
      newDateTime.setHours(hours, minutes, 0, 0);
      onChange?.(newDateTime);
    } else {
      onChange?.(undefined);
    }
    setDateOpen(false);
  };

  const handleTimeChange = (newTime: string) => {
    setTimeValue(newTime);
    if (value) {
      const [hours, minutes] = newTime.split(':').map(Number);
      const newDateTime = new Date(value);
      newDateTime.setHours(hours, minutes, 0, 0);
      onChange?.(newDateTime);
    }
  };

  const handleDateArrow = (direction: 'up' | 'down') => {
    if (!value) return;
    const newDate = direction === 'up' ? addDays(value, 1) : subDays(value, 1);
    onChange?.(newDate);
  };

  const handleTimeArrow = (direction: 'up' | 'down') => {
    if (!value) {
      // If no date selected, create one for today
      const today = new Date();
      const [hours, minutes] = timeValue.split(':').map(Number);
      today.setHours(hours, minutes, 0, 0);
      const newDate = direction === 'up' ? addMinutes(today, 30) : subMinutes(today, 30);
      setTimeValue(format(newDate, "HH:mm"));
      onChange?.(newDate);
    } else {
      const newDate = direction === 'up' ? addMinutes(value, 30) : subMinutes(value, 30);
      setTimeValue(format(newDate, "HH:mm"));
      onChange?.(newDate);
    }
  };

  return (
    <div className={cn("flex gap-2", className)}>
      {/* Date Picker with Arrows */}
      <div className="flex items-center gap-1">
        <Popover open={dateOpen} onOpenChange={setDateOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[140px] justify-start text-left font-normal",
                !value && "text-muted-foreground"
              )}
              disabled={disabled}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {value ? format(value, "MMM dd") : <span>Pick date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={value}
              onSelect={handleDateSelect}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        
        <div className="flex flex-col">
          <button
            type="button"
            onClick={() => handleDateArrow('up')}
            disabled={disabled}
            className="h-4 w-4 flex items-center justify-center hover:bg-gray-100 rounded disabled:opacity-50"
          >
            <ChevronUp className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={() => handleDateArrow('down')}
            disabled={disabled}
            className="h-4 w-4 flex items-center justify-center hover:bg-gray-100 rounded disabled:opacity-50"
          >
            <ChevronDown className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Time Input with Arrows */}
      <div className="flex items-center gap-1">
        <div className="flex items-center">
          <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
          <input
            type="time"
            value={timeValue}
            onChange={(e) => handleTimeChange(e.target.value)}
            disabled={disabled}
            className="h-9 px-2 rounded border border-border bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm disabled:opacity-50"
          />
        </div>
        
        <div className="flex flex-col">
          <button
            type="button"
            onClick={() => handleTimeArrow('up')}
            disabled={disabled}
            className="h-4 w-4 flex items-center justify-center hover:bg-gray-100 rounded disabled:opacity-50"
          >
            <ChevronUp className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={() => handleTimeArrow('down')}
            disabled={disabled}
            className="h-4 w-4 flex items-center justify-center hover:bg-gray-100 rounded disabled:opacity-50"
          >
            <ChevronDown className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
