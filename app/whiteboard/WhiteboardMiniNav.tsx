"use client";

import { useMemo } from "react";
import { SingleDatePicker } from "@/components/pickers/single-date-picker";
import {
  BookingIcon,
  HeadsetIcon,
  KiteIcon,
} from "@/svgs";
import type { BookingStatusFilter } from "@/lib/constants";
import BookingStatusFilter from "../../components/whiteboard-usage/BookingStatusFilter";
import WhiteboardActions from "../../components/whiteboard-usage/WhiteboardActions";
import type { WhiteboardActionHandler } from "@/backend/types";

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
  children?: React.ReactNode;
}

const NAV_ITEMS = [
  {
    id: "bookings",
    name: "Bookings",
    icon: BookingIcon,
    color: "text-blue-500",
    bgColor: "bg-blue-500",
  },
  {
    id: "lessons",
    name: "Lessons",
    icon: HeadsetIcon,
    color: "text-green-500",
    bgColor: "bg-green-500",
  },
  {
    id: "events",
    name: "Events",
    icon: KiteIcon,
    color: "text-teal-500",
    bgColor: "bg-teal-500",
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
  children,
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
      <div className="p-3 border-b border-border">
        <div className="flex justify-around">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const count = getCount(item.id);
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSectionClick(item.id)}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200 border-2 ${isActive
                  ? "bg-white shadow-lg"
                  : "border-transparent hover:bg-white/50"
                  }`}
                style={
                  isActive
                    ? {
                      borderColor:
                        item.color === "text-blue-500"
                          ? "#3b82f6"
                          : item.color === "text-green-500"
                            ? "#22c55e"
                            : "#14b8a6",
                    }
                    : {}
                }
              >
                <Icon className={`w-5 h-5 ${item.color}`} />
                <span className="text-xs font-medium text-gray-700">
                  {item.name}
                </span>
                <span className="text-xs font-mono text-gray-600">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Booking Status Filter */}
      <BookingStatusFilter 
        activeFilter={bookingFilter}
        onFilterChange={onBookingFilterChange}
      />

      {/* Global Stats (if provided) */}
      {children && (
        <div className="p-3 border-t border-border">
          {children}
        </div>
      )}

      {/* Actions */}
      <WhiteboardActions onActionClick={onActionClick} />
    </div>
  );
}
