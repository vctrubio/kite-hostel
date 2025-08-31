import { ENTITY_DATA } from "@/lib/constants";
import { Plus, LucideIcon, PlusCircle, Package, UserPlus, Download } from "lucide-react";
import { seedCreateStudent, seedCreateTeacher } from "@/actions/seed-actions";
import { getEventCsv } from "@/actions/event-actions";
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
  openModal?: () => void,
  openDropdownForm?: () => void,
  isDropdownFormOpen?: boolean
): ActionButton[] {
  // For complex forms (lesson, event), always go to route instead of dropdown
  const useRoute = entityName.toLowerCase() === 'lesson' || entityName.toLowerCase() === 'event';
  
  const buttonLabel = entityName.toLowerCase() === 'event' 
    ? 'Create New Event'
    : entityName.toLowerCase() === 'lesson'
    ? 'Create New Lesson'
    : (openDropdownForm && !useRoute ? (isDropdownFormOpen ? 'Close' : `Add New ${entityName}`) : `Create New ${entityName}`);
    
  const actions: ActionButton[] = [
    {
      icon: Plus,
      label: buttonLabel,
      action: useRoute ? (() => router.push(`/${entityName.toLowerCase()}s/form`)) : (openDropdownForm || (() => router.push(`/${entityName.toLowerCase()}s/form`)))
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

  if (entityName.toLowerCase() === 'teacher') {
    actions.push({
      icon: UserPlus,
      label: "Seed Teacher",
      action: async () => {
        await seedCreateTeacher();
        router.refresh();
      }
    });
  }

  if (entityName.toLowerCase() === 'event') {
    actions.push({
      icon: Download,
      label: "Export CSV",
      action: async () => {
        const { data, error } = await getEventCsv();
        if (error) {
          alert(`Export failed: ${error}`);
          return;
        }
        if (data) {
          // Convert data to CSV and download
          const headers = [
            { label: "Date", key: "date" },
            { label: "Teacher", key: "teacher" },
            { label: "Students", key: "students" },
            { label: "Location", key: "location" },
            { label: "Duration", key: "duration" },
            { label: "Kite", key: "kite" },
            { label: "Price Per Hour", key: "pricePerHour" },
            { label: "Commission Per Hour", key: "commissionPerHour" },
          ];
          
          const csvContent = [
            headers.map(h => h.label).join(','),
            ...data.map(row => headers.map(h => `"${row[h.key as keyof typeof row] || ''}"`).join(','))
          ].join('\n');
          
          const blob = new Blob([csvContent], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'events.csv';
          a.click();
          window.URL.revokeObjectURL(url);
        }
      }
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
    
    case 'teacher':
      return {
        options: [
          { label: "All", value: "all" },
          { label: "Active Teachers", value: "active_teachers" },
          { label: "Non Active Teachers", value: "non_active_teachers" },
        ],
        defaultFilter: "all",
        filterFunction: (teacher: any, filterValue: string) => {
          if (filterValue === "active_teachers") {
            return teacher.isActive;
          }
          if (filterValue === "non_active_teachers") {
            return !teacher.isActive;
          }
          return true;
        },
      };
    
    case 'package':
      return {
        options: [
          { label: "All", value: "all" },
          { label: "Individual", value: "individual" },
          { label: "Dual", value: "dual" },
          { label: "Group", value: "group" },
        ],
        defaultFilter: "all",
        filterFunction: (pkg: any, filterValue: string) => {
          if (filterValue === "individual") {
            return pkg.capacity_students === 1;
          }
          if (filterValue === "dual") {
            return pkg.capacity_students === 2;
          }
          if (filterValue === "group") {
            return pkg.capacity_students >= 3;
          }
          return true;
        },
      };
    
    case 'payment':
      return {
        options: [
          { label: "All", value: "all" },
        ],
        defaultFilter: "all",
        filterFunction: (payment: any, filterValue: string) => {
          return true;
        },
      };
    
    case 'kite':
      return {
        options: [
          { label: "All", value: "all" },
          { label: "With Teachers", value: "with_teachers" },
          { label: "Available", value: "available" },
          { label: "Used", value: "used" },
        ],
        defaultFilter: "all",
        filterFunction: (kite: any, filterValue: string) => {
          if (filterValue === "with_teachers") {
            return kite.assignedTeachers?.length > 0;
          }
          if (filterValue === "available") {
            return !kite.assignedTeachers?.length;
          }
          if (filterValue === "used") {
            return kite.events?.length > 0;
          }
          return true;
        },
      };
    
    case 'event':
      return {
        options: [
          { label: "All", value: "all" },
          { label: "Planned", value: "planned" },
          { label: "TBC", value: "tbc" },
          { label: "Completed", value: "completed" },
        ],
        defaultFilter: "all",
        filterFunction: (event: any, filterValue: string) => {
          if (filterValue === "planned" || filterValue === "tbc" || filterValue === "completed") {
            return event.status === filterValue;
          }
          return true;
        },
      };
    
    case 'lesson':
      return {
        options: [
          { label: "All", value: "all" },
          { label: "Planned", value: "planned" },
          { label: "Completed", value: "completed" },
        ],
        defaultFilter: "all",
        filterFunction: (lesson: any, filterValue: string) => {
          if (filterValue === "planned" || filterValue === "completed") {
            return lesson.status === filterValue;
          }
          return true;
        },
      };
    
    case 'reference':
      return {
        options: [
          { label: "All", value: "all" },
          { label: "Teacher", value: "teacher" },
          { label: "Reference", value: "reference" },
          { label: "Others", value: "others" },
        ],
        defaultFilter: "all",
        filterFunction: (reference: any, filterValue: string) => {
          if (filterValue === "teacher") {
            return reference.role?.toLowerCase() === "teacher";
          }
          if (filterValue === "reference") {
            return reference.role?.toLowerCase() === "reference";
          }
          if (filterValue === "others") {
            return reference.role?.toLowerCase() !== "teacher" && reference.role?.toLowerCase() !== "reference";
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