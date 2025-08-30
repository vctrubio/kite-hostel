"use client";

import { BookingIcon } from "@/svgs";
import {
  BOOKING_STATUS_FILTERS,
  type BookingStatusFilter,
} from "@/lib/constants";

interface BookingStatusFilterProps {
  activeFilter: BookingStatusFilter;
  onFilterChange: (filter: BookingStatusFilter) => void;
}

export default function BookingStatusFilter({
  activeFilter,
  onFilterChange,
}: BookingStatusFilterProps) {
  return (
    <div className="p-3">
      <h3 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-2">
        <BookingIcon className="w-3 h-3" />
        Booking Status
      </h3>
      <div className="grid grid-cols-4 gap-1">
        {BOOKING_STATUS_FILTERS.map((filter) => {
          const isActive = activeFilter === filter.value;
          const IconComponent = filter.icon;
          return (
            <button
              key={filter.value}
              onClick={() => onFilterChange(filter.value)}
              className={`px-2 py-1 text-[10px] font-medium rounded transition-all duration-200 border flex items-center justify-center gap-1 ${
                isActive
                  ? filter.classes.active
                  : `${filter.classes.base} ${filter.classes.hover} border-transparent`
              }`}
              title={filter.title}
            >
              <IconComponent className="w-3 h-3" />
              <span className="hidden sm:inline">{filter.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
