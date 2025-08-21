import { ENTITY_DATA } from "@/lib/constants";
import { Plus, LucideIcon, PlusCircle, Package } from "lucide-react";
import { seedCreateStudent } from "@/actions/seed-actions";
import { type AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export interface EntityConfig {
  name: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  link: string;
}

export interface ActionButton {
  icon: LucideIcon;
  label: string;
  action: () => void;
  disabled?: boolean;
}

export interface FilterConfig {
  options: Array<{label: string, value: string}>;
  defaultFilter: string;
  filterFunction: (item: any, filterValue: string) => boolean;
}

/**
 * Get entity configuration from constants by name
 */
export function getEntityConfig(entityName: string): EntityConfig {
  const entity = ENTITY_DATA.find(e => e.name === entityName);
  if (!entity) {
    throw new Error(`Entity "${entityName}" not found in ENTITY_DATA`);
  }
  return entity;
}

/**
 * Generate action buttons for an entity
 */
export function generateEntityActionButtons(
  entityName: string,
  router: AppRouterInstance,
  selectedIds?: string[],
  openModal?: () => void
): ActionButton[] {
  const actions: ActionButton[] = [
    {
      icon: Plus,
      label: `Create New ${entityName}`,
      action: () => router.push(`/${entityName.toLowerCase()}s/form`)
    }
  ];

  if (entityName.toLowerCase() === 'student') {
    actions.push({
      icon: PlusCircle,
      label: "Seed Student",
      action: async () => {
        await seedCreateStudent();
        router.refresh();
      }
    });
    actions.push({
      icon: Package,
      label: `Select Package (${selectedIds?.length || 0})`,
      action: openModal || (() => {}),
      disabled: !selectedIds || selectedIds.length === 0
    });
  }

  return actions;
}

/**
 * Generate form route path for an entity
 */
export function getEntityFormRoute(entityName: string): string {
  return `/${entityName.toLowerCase()}s/form`;
}

/**
 * Generate detail route path for an entity
 */
export function getEntityDetailRoute(entityName: string, id: string): string {
  return `/${entityName.toLowerCase()}s/${id}`;
}

/**
 * Generate list route path for an entity
 */
export function getEntityListRoute(entityName: string): string {
  return `/${entityName.toLowerCase()}s`;
}

/**
 * Get custom filter configuration for an entity
 */
export function getEntityFilterConfig(entityName: string): FilterConfig {
  switch (entityName.toLowerCase()) {
    case 'student':
      return {
        options: [
          { label: "All", value: "all" },
          { label: "Available", value: "available" },
          { label: "Complete", value: "complete" },
        ],
        defaultFilter: "all",
        filterFunction: (student: any, filterValue: string) => {
          if (filterValue === "available") {
            // Available means no active bookings
            return !student.bookings?.some((b: any) => b.status === "active");
          }
          if (filterValue === "complete") {
            // Complete means latest booking is completed
            const sortedBookings = student.bookings?.sort((a: any, b: any) => 
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
            return sortedBookings?.[0]?.status === "completed";
          }
          return true;
        },
      };
    
    case 'booking':
      return {
        options: [
          { label: "All", value: "all" },
          { label: "Active", value: "active" },
          { label: "Completed", value: "completed" },
        ],
        defaultFilter: "all",
        filterFunction: (booking: any, filterValue: string) => {
          if (filterValue === "active" || filterValue === "completed") {
            return booking.status === filterValue;
          }
          return true;
        },
      };
    
    default:
      return {
        options: [
          { label: "All", value: "all" },
          { label: "Active", value: "active" },
          { label: "Completed", value: "completed" },
        ],
        defaultFilter: "all",
        filterFunction: (item: any, filterValue: string) => {
          if (filterValue === 'active' || filterValue === 'completed') {
            return item.status === filterValue;
          }
          return true;
        },
      };
  }
}