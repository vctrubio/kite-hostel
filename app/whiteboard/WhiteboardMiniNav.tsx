"use client";

import { SingleDatePicker } from "@/components/pickers/single-date-picker";
import { BookingIcon, HeadsetIcon, KiteIcon } from "@/svgs";
import type { BookingStatusFilter } from "@/lib/constants";
import type { WhiteboardActionHandler } from "@/backend/types";
import BookingStatusFilter from "@/components/whiteboard-usage/BookingStatusFilter";
import WhiteboardActions from "@/components/whiteboard-usage/WhiteboardActions";
import GlobalStatsHeader from "@/components/whiteboard-usage/GlobalStatsHeader";

interface WhiteboardMiniNavProps {
  activeSection: string;
  onSectionClick: (sectionId: string) => void;
  selectedDate: string | null;
  onDateChange: (date: string) => void;
  bookingsCount: number;
  lessonsCount: number;
  eventsCount: number;
  bookingFilter: BookingStatusFilter;
  onBookingFilterChange: (filter: BookingStatusFilter) => void;
  onActionClick: WhiteboardActionHandler;
  globalStats: {
    totalEvents: number;
    totalLessons: number;
    totalHours: number;
    totalEarnings: number;
    schoolRevenue: number;
  };
}

const NAV_ITEMS = [
  {
    id: "bookings",
    name: "Bookings",
    icon: BookingIcon,
    color: "text-blue-500",
    borderColor: "border-blue-500",
  },
  {
    id: "lessons",
    name: "Lessons",
    icon: HeadsetIcon,
    color: "text-green-500",
    borderColor: "border-green-500",
  },
  {
    id: "events",
    name: "Events",
    icon: KiteIcon,
    color: "text-teal-500",
    borderColor: "border-teal-500",
  },
];

export default function WhiteboardMiniNav({
  activeSection,
  onSectionClick,
  selectedDate,
  onDateChange,
  bookingsCount,
  lessonsCount,
  eventsCount,
  bookingFilter,
  onBookingFilterChange,
  onActionClick,
  globalStats,
}: WhiteboardMiniNavProps) {
  const getCount = (id: string) => {
    switch (id) {
      case "bookings":
        return bookingsCount;
      case "lessons":
        return lessonsCount;
      case "events":
        return eventsCount;
      default:
        return 0;
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border">
      {/* Date Picker */}
      <div className="p-3 border-b border-border">
        <SingleDatePicker
          selectedDate={selectedDate || undefined}
          onDateChange={onDateChange}
        />
      </div>

      {/* Navigation Items */}
      <div className="p-3">
        <div className="flex justify-around">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const count = getCount(item.id);
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSectionClick(item.id)}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200 border-2 ${
                  isActive
                    ? `bg-white shadow-lg ${item.borderColor}`
                    : "border-transparent hover:bg-white/50"
                }`}
              >
                <Icon className={`w-5 h-5 ${item.color}`} />
                <span className="text-xs font-medium text-gray-700">
                  {item.name}
                </span>
                <span className="text-xs font-mono text-gray-600">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Global Stats (if provided) */}
      <div className="p-3 border-t border-border">
        <GlobalStatsHeader globalStats={globalStats} />
      </div>

      {/* Booking Status Filter */}
      <BookingStatusFilter
        activeFilter={bookingFilter}
        onFilterChange={onBookingFilterChange}
      />

      {/* Actions */}
      <WhiteboardActions onActionClick={onActionClick} />
    </div>
  );
}