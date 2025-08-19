'use client';

import { EntityHeader } from "./EntityHeader";
import { EntityControls } from "./EntityControls";
import { DateFilter } from "@/backend/types";

interface Stat {
  description: string;
  value: number;
}

interface ActionButton {
  icon: React.ComponentType<any>;
  label: string;
  action: () => void;
}

interface EntityLayoutProps {
  name?: string;
  icon?: React.ComponentType<any>;
  color?: string;
  stats?: Stat[];
  searchPlaceholder?: string;
  onSearchChange?: (search: string) => void;
  onDateFilterChange?: (filter: DateFilter) => void;
  dateFilter?: DateFilter;
  actionButtons?: ActionButton[];
  children: React.ReactNode;
}

export function EntityLayout({
  name,
  icon,
  color,
  stats,
  searchPlaceholder,
  onSearchChange,
  onDateFilterChange,
  dateFilter,
  actionButtons,
  children
}: EntityLayoutProps) {
  return (
    <div className="space-y-6">
      <EntityHeader 
        name={name}
        icon={icon}
        color={color}
        stats={stats}
        actionButtons={actionButtons}
      />
      
      <EntityControls 
        searchPlaceholder={searchPlaceholder}
        onSearchChange={onSearchChange}
        onDateFilterChange={onDateFilterChange}
        dateFilter={dateFilter}
      />
      
      <div>
        {children}
      </div>
    </div>
  );
}