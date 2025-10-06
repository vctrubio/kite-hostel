"use client";

import { Eye, EyeOff, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { DateRangePicker } from "@/components/pickers/date-range-picker";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StatisticsHeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterEnabled: boolean;
  handleToggleFilter: () => void;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  quickFilter: string;
  setQuickFilter: (filter: string) => void;
  customStartDate: string | null;
  setCustomStartDate: (date: string | null) => void;
  customEndDate: string | null;
  setCustomEndDate: (date: string | null) => void;
  availableDates: string[];
  availableMonths: string[];
  onResetFilters: () => void;
  viewMode: "transactions" | "bookings";
  onViewChange: (mode: "transactions" | "bookings") => void;
}

export function StatisticsHeader({
  searchTerm,
  setSearchTerm,
  filterEnabled,
  handleToggleFilter,
  selectedMonth,
  setSelectedMonth,
  quickFilter,
  setQuickFilter,
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate,
  availableDates,
  availableMonths,
  onResetFilters,
  viewMode,
  onViewChange,
}: StatisticsHeaderProps) {
  const [isHovering, setIsHovering] = useState(false);

  const handleDateRangeChange = (
    startDate: string | null,
    endDate: string | null
  ) => {
    setCustomStartDate(startDate);
    setCustomEndDate(endDate);
    if (startDate && endDate) {
      setQuickFilter("custom");
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col gap-4 lg:gap-0">
          {/* First row: Icon + Title + Search */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center space-x-4">
              <div
                className="relative cursor-pointer"
                onClick={() => onViewChange(viewMode === "transactions" ? "bookings" : "transactions")}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                <BarChart3
                  className={`h-8 w-8 text-blue-500 transition-all duration-200 ${
                    isHovering ? "scale-110" : ""
                  }`}
                />
              </div>

              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                  {viewMode === "transactions" ? "Transactions" : "Bookings"}
                </h1>
              </div>
            </div>

            <div className="lg:flex lg:items-center lg:gap-4">
              <input
                type="text"
                placeholder="Search by student or teacher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full lg:w-64 px-4 py-2 rounded-lg bg-background/80 backdrop-blur-sm border border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              />

              {/* Separator on large screens */}
              <div className="hidden lg:flex items-center">
                <div className="w-px h-8 bg-border/30"></div>
              </div>

              {/* Filter toggle on large screens */}
              <div className="hidden lg:flex items-center">
                <button
                  onClick={handleToggleFilter}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    filterEnabled
                      ? "bg-primary/15 text-primary border border-primary/30 shadow-lg"
                      : "bg-muted/80 text-muted-foreground border border-muted-foreground/20 hover:bg-muted"
                  }`}
                  title={filterEnabled ? "Filters On" : "Filters Off"}
                >
                  {filterEnabled ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Second row: Filters (visible when filter is enabled) */}
          {filterEnabled && (
            <div className="pt-6 mt-6 border-t border-border/50">
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                {/* Quick filters section */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Quick Filter
                  </label>
                  <Select value={quickFilter} onValueChange={setQuickFilter}>
                    <SelectTrigger className="w-full lg:w-[160px] bg-background">
                      <SelectValue placeholder="All time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All time</SelectItem>
                      <SelectItem value="3">Last 3 days</SelectItem>
                      <SelectItem value="7">Last 7 days</SelectItem>
                      <SelectItem value="15">Last 15 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Vertical divider */}
                <div className="hidden lg:block w-px h-12 bg-border/50"></div>

                {/* Month filter section */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    By Month
                  </label>
                  <select 
                    value={quickFilter === "month" ? selectedMonth : "all"}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "all") {
                        setQuickFilter("all");
                      } else {
                        setSelectedMonth(value);
                        setQuickFilter("month");
                      }
                    }}
                    className="px-3 py-2 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 min-w-[180px]"
                  >
                    <option value="all">All</option>
                    {availableMonths.map((month) => (
                      <option key={month} value={month}>
                        {new Date(month + "-01").toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                        })}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Vertical divider */}
                <div className="hidden lg:block w-px h-12 bg-border/50"></div>

                {/* Custom date range section */}
                <div className="flex flex-col gap-2 flex-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Custom Range
                  </label>
                  <DateRangePicker
                    availableDates={availableDates}
                    startDate={customStartDate}
                    endDate={customEndDate}
                    onRangeChange={handleDateRangeChange}
                  />
                </div>

                {/* Reset button */}
                {(quickFilter !== "all" || customStartDate || customEndDate) && (
                  <>
                    {/* Vertical divider */}
                    <div className="hidden lg:block w-px h-12 bg-border/50"></div>
                    
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-transparent uppercase tracking-wide">
                        .
                      </label>
                      <button
                        onClick={onResetFilters}
                        className="px-4 py-2 rounded-md bg-muted hover:bg-muted/80 text-sm font-medium transition-colors whitespace-nowrap"
                      >
                        Reset Filters
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Filter toggle on small screens */}
          <div className="flex lg:hidden items-center justify-center">
            <button
              onClick={handleToggleFilter}
              className={`p-2 rounded-lg transition-all duration-200 ${
                filterEnabled
                  ? "bg-primary/15 text-primary border border-primary/30 shadow-lg"
                  : "bg-muted/80 text-muted-foreground border border-muted-foreground/20 hover:bg-muted"
              }`}
              title={filterEnabled ? "Filters On" : "Filters Off"}
            >
              {filterEnabled ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
