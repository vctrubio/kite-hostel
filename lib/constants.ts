import {
  bookingStatusEnum,
  lessonStatusEnum,
  languagesEnum,
  EventStatusEnum,
  locationEnum,
  
} from "@/drizzle/migrations/schema";
import {
  HelmetIcon,
  HeadsetIcon,
  BookmarkIcon,
  BookingIcon,
  KiteIcon,
  PaymentIcon,
  UsersIcon,
  BookIcon,
  CalendarIcon,
  FlagIcon,
  AdminIcon,
  EquipmentIcon,
} from "@/svgs";
import { UserCheck, Circle, Play, CheckCircle, XCircle } from "lucide-react";

export const LESSON_STATUS_ENUM_VALUES = lessonStatusEnum.enumValues;
export type LessonStatus = (typeof LESSON_STATUS_ENUM_VALUES)[number];

export const BOOKING_STATUSES = bookingStatusEnum.enumValues;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const LANGUAGES_ENUM_VALUES = languagesEnum.enumValues;
export type Language = (typeof LANGUAGES_ENUM_VALUES)[number];

export const EVENT_STATUS_ENUM_VALUES = EventStatusEnum.enumValues;
export type EventStatus = (typeof EVENT_STATUS_ENUM_VALUES)[number];

export const LOCATION_ENUM_VALUES = locationEnum.enumValues;
export type Location = (typeof LOCATION_ENUM_VALUES)[number];

// TODO: userRole is not defined, commenting out for now
// export const USER_ROLE_ENUM_VALUES = userRole.enumValues;
// export type UserRole = (typeof USER_ROLE_ENUM_VALUES)[number];

// Lesson status filter configuration for UI components
export const LESSON_STATUS_FILTERS = [
  {
    value: "all" as const,
    label: "All",
    color:
      "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700",
  },
  {
    value: "planned" as const,
    label: "Planned",
    color:
      "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50",
  },
  {
    value: "rest" as const,
    label: "Rest",
    color:
      "bg-yellow-100 dark:bg-yellow-900/30 text-stone-800 dark:text-stone-200 hover:bg-yellow-200 dark:hover:bg-yellow-900/50",
  },
  {
    value: "completed" as const,
    label: "Completed",
    color:
      "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50",
  },
  {
    value: "delegated" as const,
    label: "Delegated",
    color:
      "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900/50",
  },
  {
    value: "cancelled" as const,
    label: "Cancelled",
    color:
      "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50",
  },
] as const;

export type LessonStatusFilter =
  (typeof LESSON_STATUS_FILTERS)[number]["value"];

// Booking status filter configuration for UI components
export const BOOKING_STATUS_FILTERS = [
  {
    value: "all" as const,
    label: "All",
    icon: Circle,
    title: "All Bookings",
    classes: {
      base: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-blue-900",
      hover: "hover:bg-gray-200 dark:hover:bg-gray-700",
      active: "bg-white text-black border-black/50 hover:bg-gray-200",
    },
  },
  {
    value: "active" as const,
    label: "Active",
    icon: Play,
    title: "Active Bookings",
    classes: {
      base: "bg-blue-100 text-blue-700 dark:bg-blue-500/50 dark:text-blue-900",
      hover: "hover:bg-blue-200 dark:hover:bg-blue-500/70",
      active: "bg-blue-200 text-blue-800 dark:bg-blue-500/80 dark:text-blue-900 border-blue-400 font-bold",
    },
  },
  {
    value: "available" as const,
    label: "Available",
    icon: Play,
    title: "Available Bookings",
    classes: {
      base: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-200",
      hover: "hover:bg-yellow-200 dark:hover:bg-yellow-900",
      active: "bg-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100 border-yellow-500/50",
    },
  },
  {
    value: "completed" as const,
    label: "Done",
    icon: CheckCircle,
    title: "Completed Bookings",
    classes: {
      base: "bg-green-100 text-green-800 dark:bg-green-600/50 dark:text-green-900",
      hover: "hover:bg-green-200 dark:hover:bg-green-600/70",
      active: "bg-green-200 dark:bg-green-600/80 dark:text-green-900 border-green-600 font-bold",
    },
  },
  {
    value: "uncomplete" as const,
    label: "Uncomplete",
    icon: XCircle,
    title: "Uncomplete Bookings",
    classes: {
      base: "bg-red-100 text-red-800 dark:bg-red-600/50 dark:text-red-900",
      hover: "hover:bg-red-200 dark:hover:bg-red-600/70",
      active: "bg-red-200 dark:bg-red-600/80 dark:text-red-900 border-red-500 font-bold",
    },
  },
] as const;

export type BookingStatusFilter =
  (typeof BOOKING_STATUS_FILTERS)[number]["value"];

// Event status filter configuration for UI components
export const EVENT_STATUS_FILTERS = [
  {
    value: "all" as const,
    label: "All",
    color:
      "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700",
  },
  {
    value: "planned" as const,
    label: "Planned",
    color:
      "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50",
  },
  {
    value: "tbc" as const,
    label: "TBC",
    color:
      "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50",
  },
  {
    value: "completed" as const,
    label: "Completed",
    color:
      "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50",
  },
  {
    value: "cancelled" as const,
    label: "Cancelled",
    color:
      "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50",
  },
] as const;

export type EventStatusFilter = (typeof EVENT_STATUS_FILTERS)[number]["value"];

// Lesson status colors for components (matches the filter colors)
export const getStatusColors = (status: LessonStatus): string => {
  switch (status) {
    case "planned":
      return "bg-blue-100 text-blue-700 dark:bg-blue-600/50 dark:text-blue-900";
    case "rest":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-600/50 dark:text-yellow-900";
    case "delegated":
      return "bg-orange-100 text-orange-700 dark:bg-orange-600/50 dark:text-orange-900";
    case "completed":
      return "bg-green-100 text-green-700 dark:bg-green-600/50 dark:text-green-900";
    case "cancelled":
      return "bg-red-100 text-red-700 dark:bg-red-600/50 dark:text-red-900";
    default:
      return "bg-gray-100 dark:bg-gray-600/50 text-gray-800 dark:text-gray-900";
  }
};

// Booking status colors for components (matches the filter colors)
export const getBookingStatusColor = (status: BookingStatus): string => {
  switch (status) {
    case "active":
      return "bg-blue-100 dark:bg-blue-500/50 text-blue-800 dark:text-blue-900";
    case "completed":
      return "bg-green-100 dark:bg-green-600/50 text-green-800 dark:text-green-900";
    case "uncomplete":
      return "bg-red-100 dark:bg-red-600/50 text-red-800 dark:text-red-900";
    default:
      return "bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-900";
  }
};

// Progress bar default configuration
export const PROGRESS_BAR_DEFAULTS = {
  usedPercentage: 0,
  plannedPercentage: 0,
  remainingPercentage: 100,
  isOverBooked: false,
  overBookedPercentage: 0,
} as const;

// Active lesson status values (for business logic)
export const ACTIVE_LESSON_STATUSES: LessonStatus[] = ["planned", "rest"];

// Event status colors for components (matches the filter colors)
export const getEventStatusColor = (status: EventStatus): string => {
  switch (status) {
    case "planned":
      return "bg-blue-100 dark:bg-blue-600/50 text-blue-800 dark:text-blue-900";
    case "tbc":
      return "bg-purple-100 dark:bg-purple-600/50 text-purple-800 dark:text-purple-900";
    case "completed":
      return "bg-green-100 dark:bg-green-600/50 text-green-800 dark:text-green-900";
    case "cancelled":
      return "bg-red-100 dark:bg-red-600/50 text-red-800 dark:text-red-900";
    default:
      return "bg-gray-100 dark:bg-gray-600/50 text-gray-800 dark:text-gray-900";
  }
};

// Event status values for progress calculation
export const COMPLETED_EVENT_STATUSES: EventStatus[] = ["completed"];
export const PLANNED_EVENT_STATUSES: EventStatus[] = ["planned", "tbc"];

// Entity data for forms and documentation
export const ENTITY_DATA = [
  {
    name: "Student",
    icon: HelmetIcon,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500",
    hoverColor: "#fef3c7", // yellow-100
    link: "/students",
    description: [
      "Students create bookings.",
      "Can only have one active booking at a time.",
    ],
  },
  {
    name: "Teacher",
    icon: HeadsetIcon,
    color: "text-green-500",
    bgColor: "bg-green-500",
    hoverColor: "#d1fae5", // green-100
    link: "/teachers",
    description: [
      "Our employees, each has a commission rate for a lesson and earn money.",
      "Payments are used to deduct earnings from the total.",
    ],
    many_to_many: [
      {
        name: "Teacher Kite",
        link: "/teachers",
        icon: KiteIcon,
        color: "text-lime-500",
        bgColor: "bg-lime-500",
      },
    ],
  },
  {
    name: "Package",
    icon: BookmarkIcon,
    color: "text-orange-500",
    bgColor: "bg-orange-500",
    hoverColor: "#fed7aa", // orange-100
    link: "/packages",
    description: [
      "Determines the duration, capacity, and kites for the booking.",
    ],
  },
  {
    name: "Booking",
    icon: BookingIcon,
    color: "text-blue-500",
    bgColor: "bg-blue-500",
    hoverColor: "#dbeafe", // blue-100
    link: "/bookings",
    description: [
      "Has a start date and end date.",
      "References come from user accounts.",
    ],
    many_to_many: [
      {
        name: "Booking Student",
        link: "/bookings",
        icon: AdminIcon,
        color: "text-gray-500",
        bgColor: "bg-gray-500",
      },
    ],
  },
  {
    name: "Lesson",
    icon: FlagIcon,
    color: "text-cyan-500",
    bgColor: "bg-cyan-500",
    hoverColor: "#cffafe", // cyan-100
    link: "/lessons",
    description: [
      "Represents a scheduled lesson, linked to a teacher, booking, and commission.",
    ],
  },
  {
    name: "Event",
    icon: KiteIcon,
    color: "text-teal-500",
    bgColor: "bg-teal-500",
    hoverColor: "#ccfbf1", // teal-100
    link: "/events",
    description: [
      "Must be derived from a lesson.",
      "Has a duration and kite that was used.",
    ],
    many_to_many: [
      {
        name: "Kite Event",
        link: "/events",
        icon: KiteIcon,
        color: "text-brown-500",
        bgColor: "bg-brown-500",
      },
    ],
  },
  {
    name: "Kite",
    icon: EquipmentIcon,
    color: "text-purple-500",
    bgColor: "bg-purple-500",
    hoverColor: "#e9d5ff", // purple-100
    link: "/kites",
    description: ["Added and used for tracking of usage in each event."],
  },
  {
    name: "Payment",
    icon: PaymentIcon,
    color: "text-amber-500",
    bgColor: "bg-amber-500",
    hoverColor: "#fef3c7", // amber-100
    link: "/payments",
    description: ["Records payments made to teachers."],
  },
  // {
  //   name: "Commission",
  //   icon: BookIcon,
  //   color: "text-cyan-500",
  //   bgColor: "bg-cyan-500",
  //   link: "/teachers",
  //   description: [
  //     "Defines the commission rate for a teacher.",
  //     "Must be selected when creating a lesson.",
  //   ],
  // },
  {
    name: "Reference",
    icon: UserCheck,
    color: "text-gray-500",
    bgColor: "bg-gray-500",
    hoverColor: "#f1f5f9", // slate-100
    link: "/references",
    description: [
      "Referenced bookings and user notes.",
      "Links bookings to user wallet references.",
    ],
  },
] as const;

// User role colors for components
export const getRoleColor = (role: string): string => {
  switch (role) {
    case "admin": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    case "teacher": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "teacherAdmin": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "guest": return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    case "reference": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    default: return "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200";
  }
};
