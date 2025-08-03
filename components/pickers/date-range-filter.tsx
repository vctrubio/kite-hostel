'use client'

import { useState, useEffect } from 'react';
import { CalendarIcon, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

export interface DatePickerRange {
  startDate: string;
  endDate: string;
}
interface DateRangeFilterProps {
    dateRange: DatePickerRange;
    onDateRangeChange: (range: DatePickerRange) => void;
    placeholder?: string;
    className?: string;
}

export function DateRangeFilter({
    dateRange,
    onDateRangeChange,
    placeholder = "Select date range...",
    className = ""
}: DateRangeFilterProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Helper functions to get today and tomorrow in YYYY-MM-DD format
    const getTodayString = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    const getTomorrowString = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    };

    // Helper function to add/subtract days from a date string
    const addDaysToDateString = (dateString: string, days: number) => {
        const date = new Date(dateString);
        date.setDate(date.getDate() + days);
        return date.toISOString().split('T')[0];
    };

    // Helper function to get relative date label
    const getRelativeDateLabel = (dateString: string): string => {
        if (!dateString) return '';
        
        const today = getTodayString();
        const tomorrow = getTomorrowString();
        const yesterday = addDaysToDateString(today, -1);
        
        if (dateString === today) return 'Today';
        if (dateString === tomorrow) return 'Tomorrow';
        if (dateString === yesterday) return 'Yesterday';
        
        // Calculate days difference
        const targetDate = new Date(dateString);
        const todayDate = new Date(today);
        const diffTime = targetDate.getTime() - todayDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays > 1) return `In ${diffDays} days`;
        if (diffDays < -1) return `${Math.abs(diffDays)} days ago`;
        return '';
    };

    // Initialize with today as start date, no end date by default
    useEffect(() => {
        if (!dateRange.startDate && !dateRange.endDate) {
            onDateRangeChange({
                startDate: getTodayString(),
                endDate: ''
            });
        }
    }, [dateRange.startDate, dateRange.endDate, onDateRangeChange]);

    // Use today as fallback for start date, no fallback for end date
    const startDate = dateRange.startDate || getTodayString();
    const endDate = dateRange.endDate || '';

    // Calculate days span (only if both dates exist)
    const daysDifference = startDate && endDate 
        ? Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)))
        : 0;

    // Arrow control handlers
    const decrementStartDate = () => {
        const newStartDate = addDaysToDateString(startDate, -1);
        onDateRangeChange({ ...dateRange, startDate: newStartDate });
    };

    const incrementStartDate = () => {
        const newStartDate = addDaysToDateString(startDate, 1);
        // Ensure start date doesn't go past end date (only if end date exists)
        if (!endDate || newStartDate < endDate) {
            onDateRangeChange({ ...dateRange, startDate: newStartDate });
        }
    };

    const decrementEndDate = () => {
        if (!endDate) return; // Can't decrement if no end date
        const newEndDate = addDaysToDateString(endDate, -1);
        // Ensure end date doesn't go before start date
        if (newEndDate > startDate) {
            onDateRangeChange({ ...dateRange, endDate: newEndDate });
        }
    };

    const incrementEndDate = () => {
        const newEndDate = endDate 
            ? addDaysToDateString(endDate, 1)
            : addDaysToDateString(startDate, 1); // If no end date, start from day after start date
        onDateRangeChange({ ...dateRange, endDate: newEndDate });
    };

    const formatDateRange = () => {
        if (!startDate && !endDate) {
            return placeholder;
        }
        
        if (startDate && !endDate) {
            try {
                const label = getRelativeDateLabel(startDate);
                const dateStr = format(new Date(startDate), 'MMM dd, yyyy');
                return `From ${dateStr}${label ? ` (${label})` : ''}`;
            } catch {
                return `From ${startDate}`;
            }
        }
        
        if (!startDate && endDate) {
            try {
                const label = getRelativeDateLabel(endDate);
                const dateStr = format(new Date(endDate), 'MMM dd, yyyy');
                return `Until ${dateStr}${label ? ` (${label})` : ''}`;
            } catch {
                return `Until ${endDate}`;
            }
        }
        
        if (startDate && endDate) {
            try {
                const startLabel = getRelativeDateLabel(startDate);
                const endLabel = getRelativeDateLabel(endDate);
                const startStr = format(new Date(startDate), 'MMM dd');
                const endStr = format(new Date(endDate), 'MMM dd, yyyy');
                
                let rangeText = `${startStr} - ${endStr}`;
                if (daysDifference === 1) {
                    rangeText += ' (1 day)';
                } else if (daysDifference > 1) {
                    rangeText += ` (${daysDifference} days)`;
                }
                
                return rangeText;
            } catch {
                return `${startDate} - ${endDate}`;
            }
        }
        
        return placeholder;
    };

    const clearDateRange = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDateRangeChange({ startDate: '', endDate: '' });
    };

    const handleFromDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const date = e.target.value;
        onDateRangeChange({ ...dateRange, startDate: date });
    };

    const handleToDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const date = e.target.value;
        onDateRangeChange({ ...dateRange, endDate: date });
    };

    const formatInputDate = (dateString: string) => {
        if (!dateString) return '';
        return dateString;
    };

    const hasDateRange = startDate || endDate;

    return (
        <div className={`relative ${className}`}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between p-2 border rounded-lg text-sm transition-colors ${
                    hasDateRange 
                        ? 'border-primary bg-primary/5 text-primary' 
                        : 'border-border hover:bg-muted'
                }`}
            >
                <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    <span className={hasDateRange ? 'font-medium' : 'text-muted-foreground'}>
                        {formatDateRange()}
                    </span>
                </div>
                
                {hasDateRange && (
                    <div
                        onClick={clearDateRange}
                        className="p-0.5 rounded hover:bg-primary/20 transition-colors cursor-pointer"
                        title="Clear date range"
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                clearDateRange(e as any);
                            }
                        }}
                    >
                        <X className="h-3 w-3" />
                    </div>
                )}
            </button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setIsOpen(false)}
                    />
                    
                    {/* Dropdown */}
                    <div className="absolute top-full left-0 right-0 mt-1 p-4 bg-background border border-border rounded-lg shadow-lg z-20 min-w-80">
                        <div className="space-y-4">
                            {/* Date Range Summary */}
                            <div className="text-center p-2 bg-muted/50 rounded-lg">
                                <div className="text-sm font-medium">
                                    {endDate 
                                        ? (daysDifference === 1 ? '1 day' : `${daysDifference} days`)
                                        : 'From start date onwards'
                                    }
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {endDate 
                                        ? `${getRelativeDateLabel(startDate) || format(new Date(startDate), 'MMM dd')} to ${getRelativeDateLabel(endDate) || format(new Date(endDate), 'MMM dd')}`
                                        : `From ${getRelativeDateLabel(startDate) || format(new Date(startDate), 'MMM dd')} onwards`
                                    }
                                </div>
                            </div>

                            {/* Start Date Controls */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium">
                                    Start Date
                                    {getRelativeDateLabel(startDate) && (
                                        <span className="ml-2 text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
                                            {getRelativeDateLabel(startDate)}
                                        </span>
                                    )}
                                </label>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={decrementStartDate}
                                        className="p-2 border border-border rounded hover:bg-muted transition-colors"
                                        title="Previous day"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    <input
                                        type="date"
                                        value={formatInputDate(startDate)}
                                        onChange={handleFromDateChange}
                                        className="flex-1 p-2 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                    <button
                                        type="button"
                                        onClick={incrementStartDate}
                                        disabled={!!endDate && addDaysToDateString(startDate, 1) >= endDate}
                                        className="p-2 border border-border rounded hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="Next day"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                            
                            {/* End Date Controls */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium">
                                    End Date (Optional)
                                    {endDate && getRelativeDateLabel(endDate) && (
                                        <span className="ml-2 text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
                                            {getRelativeDateLabel(endDate)}
                                        </span>
                                    )}
                                </label>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={decrementEndDate}
                                        disabled={!endDate || (!!endDate && addDaysToDateString(endDate, -1) <= startDate)}
                                        className="p-2 border border-border rounded hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="Previous day"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    <input
                                        type="date"
                                        value={formatInputDate(endDate)}
                                        onChange={handleToDateChange}
                                        min={addDaysToDateString(startDate, 1)}
                                        className="flex-1 p-2 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="Leave empty for open-ended"
                                    />
                                    <button
                                        type="button"
                                        onClick={incrementEndDate}
                                        className="p-2 border border-border rounded hover:bg-muted transition-colors"
                                        title="Next day"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => onDateRangeChange({ startDate: '', endDate: '' })}
                                    className="flex-1 px-3 py-2 text-sm border border-border rounded hover:bg-muted transition-colors"
                                >
                                    Clear
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onDateRangeChange({ startDate: getTodayString(), endDate: getTomorrowString() })}
                                    className="flex-1 px-3 py-2 text-sm border border-border rounded hover:bg-muted transition-colors"
                                >
                                    Reset to Today-Tomorrow
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="flex-1 px-3 py-2 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                                >
                                    Apply
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
