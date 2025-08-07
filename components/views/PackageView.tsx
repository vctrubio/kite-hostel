"use client";

import { Label } from "@/components/ui/label";
import { HelmetIcon } from "@/svgs/HelmetIcon";
import { SandTimerIcon } from "@/svgs/SandTimerIcon";
import { Duration } from "@/components/formatters/Duration";

interface PackageLabelProps {
  capacity: number | null;
  duration: number | null;
}

export function PackageView({ capacity, duration }: PackageLabelProps) {
  return (
    <Label className="flex items-center space-x-3">
      {capacity !== null && capacity > 0 && (
        <span className="flex items-center space-x-0.5">
          {Array.from({ length: capacity }).map((_, i) => (
            <HelmetIcon key={i} className="w-4 h-4 text-foreground" />
          ))}
        </span>
      )}
      {capacity !== null && capacity > 0 && duration !== null && (
        <span className="h-4 w-px bg-gray-300 dark:bg-gray-700" aria-hidden="true" />
      )}
      {duration !== null && (
        <span className="flex items-center space-x-1">
          <SandTimerIcon className="w-4 h-4 text-foreground" />
          <Duration minutes={duration} />
        </span>
      )}
    </Label>
  );
}
