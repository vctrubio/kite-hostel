"use client";

import { SingleDatePicker } from "@/components/pickers/single-date-picker";
import { useState } from "react";
import {
  BookingIcon,
  HeadsetIcon,
  KiteIcon,
  Share2Icon,
  StethoscopeIcon,
  FileTextIcon,
  PrinterIcon,
  ChevronDownIcon,
} from "@/svgs";
import {
  BOOKING_STATUS_FILTERS,
  LESSON_STATUS_FILTERS,
  EVENT_STATUS_FILTERS,
  type BookingStatusFilter,
  type LessonStatusFilter,
  type EventStatusFilter,
} from "@/lib/constants";

interface WhiteboardMiniNavProps {
  activeSection: string;
  onSectionClick: (sectionId: string) => void;
  selectedDate: string | null;
  onDateChange: (date: string) => void;
  bookingsCount: number;
  lessonsCount: number;
  eventsCount: number;
  filters: {
    bookings: BookingStatusFilter;
    lessons: LessonStatusFilter;
    events: EventStatusFilter;
  };
  onFilterChange: (
    section: "bookings" | "lessons" | "events",
    filter: string,
  ) => void;
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
  filters,
  onFilterChange,
}: WhiteboardMiniNavProps) {
  const [isActionsOpen, setIsActionsOpen] = useState(false);

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

  const ACTION_BUTTONS = [
    {
      id: "share",
      label: "Share",
      icon: Share2Icon,
      title: "Share to WhatsApp",
    },
    {
      id: "medical",
      label: "Medical",
      icon: StethoscopeIcon,
      title: "Generate Medical Email",
    },
    {
      id: "csv",
      label: "CSV",
      icon: FileTextIcon,
      title: "Export CSV",
    },
    {
      id: "print",
      label: "Print",
      icon: PrinterIcon,
      title: "Print Lesson Plan",
    },
  ] as const;

  return (
    <>
      {/* Mobile Layout */}
      <div className="xl:hidden bg-card rounded-lg border border-border">
        {/* Top Row: Date Picker and Navigation */}
        <div className="p-3 border-b border-border">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex-shrink-0">
              <SingleDatePicker
                selectedDate={selectedDate || undefined}
                onDateChange={onDateChange}
              />
            </div>

            {/* Mobile Actions Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsActionsOpen(!isActionsOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-white hover:bg-gray-50 transition-colors text-sm"
              >
                <span>Actions</span>
                <ChevronDownIcon
                  className={`w-4 h-4 transition-transform ${isActionsOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isActionsOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg border border-border shadow-lg z-10">
                  {ACTION_BUTTONS.map((button) => {
                    const IconComponent = button.icon;
                    return (
                      <button
                        key={button.id}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors"
                        title={button.title}
                        onClick={() => setIsActionsOpen(false)}
                      >
                        <IconComponent className="w-4 h-4" />
                        <span>{button.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Navigation Items */}
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
      </div>

      {/* Desktop Layout */}
      <div className="hidden xl:block bg-card rounded-lg border border-border p-4">
        <div className="mb-4">
          <SingleDatePicker
            selectedDate={selectedDate || undefined}
            onDateChange={onDateChange}
          />
        </div>
        <div className="flex justify-around items-center mb-4">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const count = getCount(item.id);
            const isActive = activeSection === item.id;
            return (
              <div key={item.id} className="flex flex-col items-center w-24">
                <button
                  onClick={() => onSectionClick(item.id)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-all duration-200 w-full border-2 ${isActive
                    ? `border-${item.color.split("-")[1]}-${item.color.split("-")[2]} bg-white shadow-lg`
                    : "border-transparent hover:bg-white/50 hover:shadow-md hover:border-opacity-50"
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
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      const borderColor =
                        item.color === "text-blue-500"
                          ? "#3b82f6"
                          : item.color === "text-green-500"
                            ? "#22c55e"
                            : "#14b8a6";
                      e.currentTarget.style.borderColor = borderColor + "80";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = "transparent";
                    }
                  }}
                >
                  <Icon className={`w-6 h-6 ${item.color}`} />
                  <span
                    className={`text-sm font-medium ${isActive ? "text-gray-900" : "text-gray-700"}`}
                  >
                    {item.name}
                  </span>
                  <span className="text-xs font-mono text-gray-600">
                    {count}
                  </span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Filter Sections - Desktop Only */}
        <div className="mb-4 pt-4 border-t border-border">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Filters
          </h3>

          {/* Bookings Filter */}
          <div className="mb-3">
            <h4 className="text-xs font-medium text-muted-foreground mb-1">
              Bookings
            </h4>
            <div className="flex flex-wrap gap-1">
              {BOOKING_STATUS_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => onFilterChange("bookings", filter.value)}
                  className={`px-2 py-1 text-xs font-medium transition-colors w-14 ${filters.bookings === filter.value
                    ? `${filter.color.replace("hover:", "").replace("100", "200").replace("900/30", "900/50")} border-b-2 border-current`
                    : `${filter.color} border-b-2 border-transparent`
                    }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Lessons Filter */}
          <div className="mb-3">
            <h4 className="text-xs font-medium text-muted-foreground mb-1">
              Lessons
            </h4>
            <div className="flex flex-wrap gap-1">
              {LESSON_STATUS_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => onFilterChange("lessons", filter.value)}
                  className={`px-2 py-1 text-xs font-medium transition-colors w-16 ${filters.lessons === filter.value
                    ? `${filter.color.replace("hover:", "").replace("100", "200").replace("900/30", "900/50")} border-b-2 border-current`
                    : `${filter.color} border-b-2 border-transparent`
                    }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Events Filter */}
          <div className="mb-3">
            <h4 className="text-xs font-medium text-muted-foreground mb-1">
              Events
            </h4>
            <div className="flex flex-wrap gap-1">
              {EVENT_STATUS_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => onFilterChange("events", filter.value)}
                  className={`px-2 py-1 text-xs font-medium transition-colors w-16 ${filters.events === filter.value
                    ? `${filter.color.replace("hover:", "").replace("100", "200").replace("900/30", "900/50")} border-b-2 border-current`
                    : `${filter.color} border-b-2 border-transparent`
                    }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop Actions */}
        <div className="pt-4 border-t border-border">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Actions
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {ACTION_BUTTONS.map((button) => {
              const IconComponent = button.icon;
              return (
                <button
                  key={button.id}
                  className="flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-muted transition-colors text-sm"
                  title={button.title}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{button.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
