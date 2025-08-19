'use client';

import { useState } from "react";
import { Search } from "lucide-react";
import { DateFilterPicker } from "@/components/pickers/date-filter";
import { DateFilter } from "@/backend/types";

interface EntityControlsProps {
  searchPlaceholder?: string;
  onSearchChange?: (search: string) => void;
  onDateFilterChange?: (filter: DateFilter) => void;
  dateFilter?: DateFilter;
}

export function EntityControls({ 
  searchPlaceholder = "Search...",
  onSearchChange,
  onDateFilterChange,
  dateFilter = { type: 'current_month', startDate: null, endDate: null }
}: EntityControlsProps) {
  const [searchValue, setSearchValue] = useState("");

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    onSearchChange?.(value);
  };

  const handleDateFilterChange = (filter: DateFilter) => {
    onDateFilterChange?.(filter);
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
      {/* Search Bar */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {/* Date Filter */}
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-muted-foreground">Filter by:</span>
        <DateFilterPicker
          filter={dateFilter}
          onFilterChange={handleDateFilterChange}
        />
      </div>
    </div>
  );
}