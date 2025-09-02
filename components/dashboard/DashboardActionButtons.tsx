"use client";

import { Button } from "@/components/ui/button";
import { type ActionButton, type FilterConfig } from "./DashboardGetEntitiesUtils";

export function DashboardActionButtons({ 
  actionButtons, 
  customFilters,
  customFilter,
  setCustomFilter
}: { 
  actionButtons: ActionButton[];
  customFilters: FilterConfig;
  customFilter: string;
  setCustomFilter: (filter: string) => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0">
      {/* Create button on the left */}
      <div className="flex flex-wrap gap-2">
        {actionButtons.map((button, index) => (
          <button
            key={index}
            onClick={button.action}
            disabled={button.disabled}
            className="flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <button.icon className="h-4 w-4" />
            <span>{button.label}</span>
          </button>
        ))}
      </div>

      {/* Filter buttons on the right */}
      <div className="flex justify-center sm:justify-end">
        <div className="inline-flex flex-nowrap bg-muted p-1 rounded-lg mx-auto sm:mx-0 whitespace-nowrap">
          {customFilters.options.map((option) => (
            <Button
              key={option.value}
              variant={customFilter === option.value ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCustomFilter(option.value)}
              className="text-sm"
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}