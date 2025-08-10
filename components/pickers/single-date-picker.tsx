'use client'

import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getCurrentUTCDate, extractDateFromUTC } from '@/components/formatters/TimeZone';

interface SingleDatePickerProps {
  selectedDate?: string;
  onDateChange?: (date: string) => void;
}

export function SingleDatePicker({ selectedDate, onDateChange }: SingleDatePickerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [tempDate, setTempDate] = useState(selectedDate || '');
  const [isToday, setIsToday] = useState(false);
  const [relativeLabel, setRelativeLabel] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  
  // Only calculate date-related values on client side after mount
  useEffect(() => {
    setIsMounted(true);
    
    const today = getCurrentUTCDate();
    const todayCheck = selectedDate === today;
    setIsToday(todayCheck);
    
    // Calculate relative label
    if (selectedDate && !todayCheck) {
      const label = getRelativeDateLabel(selectedDate);
      setRelativeLabel(label);
    } else {
      setRelativeLabel('');
    }
  }, [selectedDate]);

  const updateDate = (newDate: string) => {
    setTempDate(newDate);
    
    // If callback is provided, use it instead of URL params
    if (onDateChange) {
      onDateChange(newDate);
      return;
    }
    
    // Get current search params and preserve existing ones
    const currentParams = new URLSearchParams(window.location.search);
    
    if (newDate) {
      currentParams.set('date', newDate);
    } else {
      currentParams.delete('date');
    }
    
    const queryString = currentParams.toString();
    const newUrl = `${pathname}${queryString ? `?${queryString}` : ''}`;
    router.push(newUrl);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    updateDate(newDate);
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    // If no date is selected, start from today
    const currentDate = selectedDate ? new Date(selectedDate) : new Date();
    
    // Reset time to avoid timezone issues
    currentDate.setHours(12, 0, 0, 0);
    
    const newDate = new Date(currentDate);
    
    if (direction === 'prev') {
      newDate.setDate(currentDate.getDate() - 1);
    } else {
      newDate.setDate(currentDate.getDate() + 1);
    }
    
    const dateString = extractDateFromUTC(newDate.toISOString());
    updateDate(dateString);
  };

  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return extractDateFromUTC(date.toISOString());
    } catch {
      return '';
    }
  };

  const getRelativeDateLabel = (dateString: string): string => {
    if (!dateString) return '';
    
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    
    const targetDate = new Date(dateString);
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
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground flex items-center justify-between">
        <div className="flex items-center gap-2">
          Filter by Date
          {isMounted && isToday ? (
            <span className="text-xs bg-green-100 px-2 py-1 rounded-md text-green-700">
              Today
            </span>
          ) : isMounted && !isToday ? (
            <button
              onClick={() => updateDate(getCurrentUTCDate())}
              className="text-xs bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded-md text-blue-700 transition-colors"
              title="Go to today"
            >
              Go to Today
            </button>
          ) : null}
        </div>
        {isMounted && relativeLabel && !isToday && (
          <span className="text-xs bg-muted px-2 py-1 rounded-md text-muted-foreground">
            {relativeLabel}
          </span>
        )}
      </label>
      <div className="flex items-center gap-1">
        <button
          onClick={() => navigateDate('prev')}
          className="p-2 border border-border rounded-lg bg-background hover:bg-gray-50 active:bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors font-mono"
          title="Previous day"
        >
          ←
        </button>
        <input
          type="date"
          value={formatDateForInput(selectedDate)}
          onChange={handleDateChange}
          className="p-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 min-w-0"
          placeholder="Select date"
        />
        <button
          onClick={() => navigateDate('next')}
          className="p-2 border border-border rounded-lg bg-background hover:bg-gray-50 active:bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors font-mono"
          title="Next day"
        >
          →
        </button>
      </div>
    </div>
  );
}