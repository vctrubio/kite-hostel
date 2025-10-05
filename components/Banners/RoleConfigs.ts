import { Shield } from "lucide-react";
import { HeadsetIcon, HelmetIcon } from "@/svgs";

export const ROLE_CONFIGS = {
  student: {
    Icon: HelmetIcon,
    label: "Student",
    color: "#eab308", // yellow-500
    tailwindConnection: "text-yellow-500 dark:text-yellow-400",
  },
  teacher: {
    Icon: HeadsetIcon,
    label: "Teacher",
    color: "#22c55e", // green-500
    tailwindConnection: "text-green-500 dark:text-green-400",
  },
  admin: {
    Icon: Shield,
    label: "Admin",
    color: "#06b6d4", // cyan-500 (North's signature teal)
    tailwindConnection: "text-cyan-500 dark:text-cyan-400",
  },
} as const;

export const ROLE_ICONS = [
  ROLE_CONFIGS.student,
  ROLE_CONFIGS.teacher,
  ROLE_CONFIGS.admin,
] as const;