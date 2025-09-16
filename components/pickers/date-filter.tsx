'use client';

import { useState, useEffect } from "react";
import { Calendar, CalendarX2, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { DateFilter } from "@/backend/types";

interface DateFilterProps {
  filter: DateFilter;
  onFilterChange: (filter: DateFilter) => void;
}

export function DateFilterPicker({ filter, onFilterChange }: DateFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempStartMonth, setTempStartMonth] = useState('');
  const [tempEndMonth, setTempEndMonth] = useState('');
  const [tempStartDay, setTempStartDay] = useState('');
  const [tempEndDay, setTempEndDay] = useState('');

  // Navigation functions for custom range months
  const navigateStartMonth = (direction: 'prev' | 'next') => {
    if (!tempStartMonth) return;
    const [year, month] = tempStartMonth.split('-').map(Number);
    const currentDate = new Date(year, month - 1, 1);
    if (direction === 'prev') {
      currentDate.setMonth(currentDate.getMonth() - 1);
    } else {
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    const newMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    setTempStartMonth(newMonth);
  };



  useEffect(() => {
    console.log("Date filter changed:", filter);
  }, [filter]);

  // Initialize temp values when filter changes
  useEffect(() => {
    if (filter.startDate) {
      const start = new Date(filter.startDate);
      setTempStartMonth(`${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`);
      setTempStartDay(String(start.getDate()));
    }
    if (filter.endDate) {
      const end = new Date(filter.endDate);
      setTempEndMonth(`${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}`);
      setTempEndDay(String(end.getDate()));
    }
  }, [filter.startDate, filter.endDate]);


  const handleNoFilter = () => {
    onFilterChange({ type: 'off', startDate: null, endDate: null });
    setIsOpen(false);
  };

  const handleCurrentMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0);
    
    onFilterChange({
      type: 'month',
      startDate: startOfMonth.toISOString().split('T')[0],
      endDate: endOfMonth.toISOString().split('T')[0]
    });
    setIsOpen(false);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (filter.type !== 'month' || !filter.startDate) return;
    
    const currentDate = new Date(filter.startDate);
    if (direction === 'prev') {
      currentDate.setMonth(currentDate.getMonth() - 1);
    } else {
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0);
    
    onFilterChange({
      type: 'month',
      startDate: startOfMonth.toISOString().split('T')[0],
      endDate: endOfMonth.toISOString().split('T')[0]
    });
  };

  const handleMonthRangeChange = () => {
    if (!tempStartMonth || !tempEndMonth) return;
    
    const [startYear, startMonth] = tempStartMonth.split('-').map(Number);
    const [endYear, endMonth] = tempEndMonth.split('-').map(Number);
    
    // Use specific day if provided, otherwise default to full month
    const startDay = tempStartDay ? parseInt(tempStartDay) : 1;
    const endDay = tempEndDay ? parseInt(tempEndDay) : new Date(endYear, endMonth, 0).getDate(); // Last day of month
    
    const startDate = new Date(startYear, startMonth - 1, startDay).toISOString().split('T')[0];
    const endDate = new Date(endYear, endMonth - 1, endDay).toISOString().split('T')[0];
    
    onFilterChange({
      type: 'range',
      startDate,
      endDate
    });
    setIsOpen(false);
  };

  const getDisplayText = () => {
    if (filter.type === 'off') return 'No Filter';
    
    if (filter.type === 'month' && filter.startDate) {
      const date = new Date(filter.startDate);
      const now = new Date();
      
      if (date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()) {
        return 'This Month';
      }
      
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    
    if (filter.type === 'range' && filter.startDate && filter.endDate) {
      const start = new Date(filter.startDate);
      const end = new Date(filter.endDate);
      
      // Check if it's same month
      if (start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth()) {
        return `${start.toLocaleDateString('en-US', { month: 'short' })} ${start.getDate()}-${end.getDate()}, ${start.getFullYear()}`;
      }
      
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    
    return 'Custom Range';
  };


  return (
    <div className="relative">
      <div className="flex items-center space-x-1">
        {/* No Filter Button */}
        <button
          onClick={handleNoFilter}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            filter.type === 'off' 
              ? 'bg-primary text-primary-foreground shadow-sm' 
              : 'border border-border bg-background text-muted-foreground hover:bg-muted'
          }`}
        >
          <CalendarX2 className="h-4 w-4" />
          <span>No Filter</span>
        </button>

        {/* This Month Button with Navigation */}
        {filter.type === 'month' ? (
          <div className="flex items-center bg-gradient-to-r from-slate-600 to-slate-700 rounded-lg shadow-md overflow-hidden">
            <button
              onClick={() => navigateMonth('prev')}
              className="flex items-center justify-center w-10 h-10 text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200"
              title="Previous month"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-2 px-4 py-2 text-white">
              <Calendar className="h-4 w-4" />
              <span className="font-medium text-sm min-w-[100px] text-center">{getDisplayText()}</span>
            </div>
            <button
              onClick={() => navigateMonth('next')}
              className="flex items-center justify-center w-10 h-10 text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200"
              title="Next month"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleCurrentMonth}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              filter.type === 'month' 
                ? 'bg-primary text-primary-foreground shadow-sm' 
                : 'border border-border bg-background text-foreground hover:bg-muted'
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>This Month</span>
          </button>
        )}

        {/* Custom Range Dropdown */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            filter.type === 'range' 
              ? 'bg-primary text-primary-foreground shadow-sm' 
              : 'border border-border bg-background text-foreground hover:bg-muted'
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span>{filter.type === 'range' ? getDisplayText() : 'Custom Range'}</span>
          <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Custom Range Dropdown */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-96 bg-white rounded-xl border border-gray-200 shadow-xl z-50">
          <div className="p-5 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-slate-600" />
                <h4 className="text-sm font-semibold text-gray-900">Custom Date Range</h4>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => navigateStartMonth('prev')}
                  className="flex items-center justify-center w-7 h-7 rounded-md border border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                  title="Previous month"
                >
                  <ChevronLeft className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => navigateStartMonth('next')}
                  className="flex items-center justify-center w-7 h-7 rounded-md border border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                  title="Next month"
                >
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
            
            {/* Start Range */}
            <div className="space-y-3">
              <h5 className="text-xs font-medium text-gray-700 uppercase tracking-wide">From</h5>
              <div className="flex items-center space-x-3">
                <div className="flex-1">
                  <label className="text-xs text-gray-500 mb-1 block">Month</label>
                  <input
                    type="month"
                    value={tempStartMonth}
                    onChange={(e) => setTempStartMonth(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  />
                </div>
                <div className="w-20">
                  <label className="text-xs text-gray-500 mb-1 block">Day</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    placeholder="1"
                    value={tempStartDay}
                    onChange={(e) => setTempStartDay(e.target.value)}
                    className="w-full px-3 py-2 text-sm text-center border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* End Range */}
            <div className="space-y-3">
              <h5 className="text-xs font-medium text-gray-700 uppercase tracking-wide">To</h5>
              <div className="flex items-center space-x-3">
                <div className="flex-1">
                  <label className="text-xs text-gray-500 mb-1 block">Month</label>
                  <input
                    type="month"
                    value={tempEndMonth}
                    onChange={(e) => setTempEndMonth(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  />
                </div>
                <div className="w-20">
                  <label className="text-xs text-gray-500 mb-1 block">Day</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    placeholder="31"
                    value={tempEndDay}
                    onChange={(e) => setTempEndDay(e.target.value)}
                    className="w-full px-3 py-2 text-sm text-center border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg">
              💡 <strong>Tip:</strong> Leave day fields empty to use full months (e.g., Nov 1 - Dec 31)
            </div>

            {/* Apply Button */}
            <button
              onClick={handleMonthRangeChange}
              disabled={!tempStartMonth || !tempEndMonth}
              className="w-full py-3 px-4 bg-gradient-to-r from-slate-600 to-slate-700 text-white text-sm font-medium rounded-lg hover:from-slate-700 hover:to-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md"
            >
              Apply Custom Range
            </button>
          </div>
        </div>
      )}
    </div>
  );
}