"use client";

import { SingleDatePicker } from "@/components/pickers/single-date-picker";
import BookingStatusFilter from "@/components/whiteboard-usage/BookingStatusFilter";
import WhiteboardActions from "@/components/whiteboard-usage/WhiteboardActions";
import GlobalStatsHeader from "@/components/whiteboard-usage/GlobalStatsHeader";
import type { WhiteboardMiniNavProps } from "./WhiteboardClient";

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
  navItems,
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
          {navItems.map((item) => {
            const Icon = item.icon;
            if (!Icon) return null; // Should not happen with filtered items, but good practice
            const count = getCount(item.id);
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSectionClick(item.id)}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200 border-2 ${
                  isActive
                    ? `bg-background shadow-lg ${item.borderColor}`
                    : "border-transparent hover:bg-muted/50"
                }`}
              >
                <Icon className={`w-5 h-5 ${item.color}`} />
                <span className="text-xs font-medium text-foreground">
                  {item.name}
                </span>
                <span className="text-xs font-mono text-muted-foreground">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-3 border-t border-border">
        <GlobalStatsHeader globalStats={globalStats} />
      </div>

      <BookingStatusFilter
        activeFilter={bookingFilter}
        onFilterChange={onBookingFilterChange}
      />

      <WhiteboardActions onActionClick={onActionClick} />
    </div>
  );
}
