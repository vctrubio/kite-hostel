"use client";

import { useState, useMemo, useEffect } from "react";
import { TransactionData } from "../api/statistics/route";
import { StatisticsHeader } from "./StatisticsHeader";
import { StatisticsTeacherRanking } from "./StatisticsTeacherRanking";
import { StatisticsStudentRanking } from "./StatisticsStudentRanking";
import { TransactionTable } from "./TransactionTable";
import { BookingsTable } from "./BookingsTable";
import { StatisticsStatsBox } from "./StatisticsStatsBox";

interface StatisticsClientProps {
  initialData: TransactionData[];
}

type SortField = "eventDate" | "teacher" | "students" | "duration" | "revenue";
type SortOrder = "asc" | "desc";

interface TeacherStats {
  name: string;
  totalEarned: number;
  totalHours: number;
  eventCount: number;
  teacherId: string;
}

interface StudentBookingStats {
  students: string[];
  studentIds: string[];
  totalRevenue: number;
  totalHours: number;
  eventCount: number;
  bookingId: string;
}

export default function StatisticsClient({
  initialData,
}: StatisticsClientProps) {
  const [data] = useState<TransactionData[]>(initialData);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("eventDate");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [filterEnabled, setFilterEnabled] = useState(false);
  const [quickFilter, setQuickFilter] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [customStartDate, setCustomStartDate] = useState<string | null>(null);
  const [customEndDate, setCustomEndDate] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"transactions" | "bookings">("transactions");
  
  // Shared ranking dropdown state with localStorage
  const [isRankingDropdownOpen, setIsRankingDropdownOpen] = useState<boolean>(true);

  // Load ranking dropdown state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('statistics');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (typeof parsed.isRankingDropdownOpen === 'boolean') {
          setIsRankingDropdownOpen(parsed.isRankingDropdownOpen);
        }
      } catch (error) {
        console.error('Failed to parse statistics from localStorage:', error);
      }
    }
  }, []);

  // Save ranking dropdown state to localStorage whenever it changes
  const handleRankingDropdownToggle = () => {
    const newState = !isRankingDropdownOpen;
    setIsRankingDropdownOpen(newState);
    localStorage.setItem('statistics', JSON.stringify({ isRankingDropdownOpen: newState }));
  };

  // Get available dates from data for the date range picker
  const availableDates = useMemo(() => {
    return data.map((transaction) => 
      new Date(transaction.eventDate).toISOString().split("T")[0]
    );
  }, [data]);

  // Get available months from data
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    data.forEach((transaction) => {
      const date = new Date(transaction.eventDate);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      months.add(monthYear);
    });
    return Array.from(months).sort().reverse();
  }, [data]);

  const handleToggleFilter = () => {
    setFilterEnabled(!filterEnabled);
  };

  const handleResetFilters = () => {
    setQuickFilter("all");
    setCustomStartDate(null);
    setCustomEndDate(null);
    const now = new Date();
    setSelectedMonth(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`);
  };

  // Filter data based on search and time filters
  const filteredData = useMemo(() => {
    let filtered = [...data];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (transaction) =>
          transaction.teacher.toLowerCase().includes(query) ||
          transaction.students.some((student) =>
            student.toLowerCase().includes(query)
          )
      );
    }

    // Only apply filters if enabled
    if (!filterEnabled) {
      return filtered;
    }

    // Apply quick filter (last N days)
    const now = new Date();
    if (quickFilter !== "all" && quickFilter !== "month" && quickFilter !== "custom") {
      const days = parseInt(quickFilter);
      const cutoffDate = new Date(now);
      cutoffDate.setDate(cutoffDate.getDate() - (days - 1)); // Include today
      cutoffDate.setHours(0, 0, 0, 0); // Start of day

      filtered = filtered.filter((transaction) => {
        const transactionDate = new Date(transaction.eventDate);
        transactionDate.setHours(0, 0, 0, 0);
        return transactionDate >= cutoffDate;
      });
    }

    // Apply month filter
    if (quickFilter === "month") {
      filtered = filtered.filter((transaction) => {
        const date = new Date(transaction.eventDate);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        return monthYear === selectedMonth;
      });
    }

    // Apply custom date range filter
    if (quickFilter === "custom" && customStartDate && customEndDate) {
      filtered = filtered.filter((transaction) => {
        const transactionDate = new Date(transaction.eventDate).toISOString().split("T")[0];
        return transactionDate >= customStartDate && transactionDate <= customEndDate;
      });
    }

    return filtered;
  }, [data, searchQuery, filterEnabled, quickFilter, selectedMonth, customStartDate, customEndDate]);

  // Sort filtered data
  const sortedData = useMemo(() => {
    const sorted = [...filteredData];
    sorted.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "eventDate":
          comparison =
            new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime();
          break;
        case "teacher":
          comparison = a.teacher.localeCompare(b.teacher);
          break;
        case "students":
          comparison = a.students.join(", ").localeCompare(b.students.join(", "));
          break;
        case "duration":
          comparison = a.duration - b.duration;
          break;
        case "revenue":
          comparison = a.revenue - b.revenue;
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [filteredData, sortField, sortOrder]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const totalRevenue = sortedData.reduce((sum, t) => sum + t.revenue, 0);
    const totalEvents = sortedData.length;
    const totalHours = sortedData.reduce((sum, t) => sum + t.duration / 60, 0);
    
    // Get unique bookings
    const uniqueBookings = new Set(sortedData.map((t) => t.bookingId));
    const totalBookings = uniqueBookings.size;

    // Calculate total days and days with no wind
    let totalDays = 0;
    let daysWithNoWind = 0;
    
    if (sortedData.length > 0) {
      // Get unique dates from the sorted data
      const uniqueDates = new Set(
        sortedData.map((t) => new Date(t.eventDate).toISOString().split("T")[0])
      );
      
      // Calculate based on active filter
      if (filterEnabled && quickFilter !== "all" && quickFilter !== "month" && quickFilter !== "custom") {
        // For quick filters (last N days), use the filter value
        totalDays = parseInt(quickFilter);
      } else if (filterEnabled && quickFilter === "custom" && customStartDate && customEndDate) {
        // For custom range, calculate from custom dates
        const start = new Date(customStartDate);
        const end = new Date(customEndDate);
        const timeDiff = end.getTime() - start.getTime();
        totalDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
      } else {
        // For all other cases, calculate from actual data range
        const dates = Array.from(uniqueDates).sort();
        const startDate = new Date(dates[0]);
        const endDate = new Date(dates[dates.length - 1]);
        const timeDiff = endDate.getTime() - startDate.getTime();
        totalDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
      }
      
      // Days with no wind = total days - days with bookings
      // Ensure it never goes negative (can happen if events span beyond filter range)
      daysWithNoWind = Math.max(0, totalDays - uniqueDates.size);
    }

    // Calculate teacher stats - need commission data
    const teacherStatsMap = new Map<string, TeacherStats>();

    sortedData.forEach((transaction) => {
      const existing = teacherStatsMap.get(transaction.teacher) || {
        name: transaction.teacher,
        teacherId: transaction.teacherId,
        totalEarned: 0,
        totalHours: 0,
        eventCount: 0,
      };

      // For now, we'll use a simple calculation
      // You'll need to fetch commission data to calculate actual earnings
      const hours = transaction.duration / 60;
      
      teacherStatsMap.set(transaction.teacher, {
        name: transaction.teacher,
        teacherId: transaction.teacherId,
        totalEarned: existing.totalEarned + transaction.revenue * 0.3, // Placeholder: 30% commission
        totalHours: existing.totalHours + hours,
        eventCount: existing.eventCount + 1,
      });
    });

    const teacherRankings = Array.from(teacherStatsMap.values()).sort(
      (a, b) => b.totalEarned - a.totalEarned
    );

    // Calculate student/booking stats - group by booking
    const bookingStatsMap = new Map<string, StudentBookingStats>();

    sortedData.forEach((transaction) => {
      const existing = bookingStatsMap.get(transaction.bookingId) || {
        students: transaction.students,
        studentIds: transaction.studentIds,
        totalRevenue: 0,
        totalHours: 0,
        eventCount: 0,
        bookingId: transaction.bookingId,
      };

      const hours = transaction.duration / 60;
      
      bookingStatsMap.set(transaction.bookingId, {
        students: existing.students,
        studentIds: existing.studentIds,
        totalRevenue: existing.totalRevenue + transaction.revenue,
        totalHours: existing.totalHours + hours,
        eventCount: existing.eventCount + 1,
        bookingId: transaction.bookingId,
      });
    });

    // Get top 5 bookings by revenue
    const studentRankings = Array.from(bookingStatsMap.values())
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5);

    return {
      totalRevenue,
      totalEvents,
      totalHours,
      totalBookings,
      totalDays,
      daysWithNoWind,
      teacherRankings,
      studentRankings,
    };
  }, [sortedData, filterEnabled, quickFilter, customStartDate, customEndDate]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <StatisticsHeader
        searchTerm={searchQuery}
        setSearchTerm={setSearchQuery}
        filterEnabled={filterEnabled}
        handleToggleFilter={handleToggleFilter}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        quickFilter={quickFilter}
        setQuickFilter={setQuickFilter}
        customStartDate={customStartDate}
        setCustomStartDate={setCustomStartDate}
        customEndDate={customEndDate}
        setCustomEndDate={setCustomEndDate}
        availableDates={availableDates}
        availableMonths={availableMonths}
        onResetFilters={handleResetFilters}
        viewMode={viewMode}
        onViewChange={setViewMode}
      />

      {/* Statistics Cards */}
      <StatisticsStatsBox statistics={statistics} />

      {/* Teacher Rankings - only show in transactions view */}
      {viewMode === "transactions" && (
        <StatisticsTeacherRanking 
          teacherRankings={statistics.teacherRankings}
          isOpen={isRankingDropdownOpen}
          onToggle={handleRankingDropdownToggle}
        />
      )}

      {/* Student/Booking Rankings - only show in bookings view */}
      {viewMode === "bookings" && (
        <StatisticsStudentRanking 
          studentRankings={statistics.studentRankings}
          isOpen={isRankingDropdownOpen}
          onToggle={handleRankingDropdownToggle}
        />
      )}

      {/* Table - Transactions or Bookings view */}
      {viewMode === "transactions" ? (
        <TransactionTable
          data={sortedData}
          sortField={sortField}
          sortOrder={sortOrder}
          onSort={handleSort}
        />
      ) : (
        <BookingsTable
          data={sortedData}
          sortField={sortField as any}
          sortOrder={sortOrder}
          onSort={handleSort as any}
        />
      )}
    </div>
  );
}
