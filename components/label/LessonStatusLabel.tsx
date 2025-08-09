"use client";

import * as React from "react";
import { useState, useTransition } from "react";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LESSON_STATUS_ENUM_VALUES, type LessonStatus, getStatusColors } from "@/lib/constants";

import { updateLessonStatus } from "@/actions/lesson-actions";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";

interface LessonStatusLabelProps {
  lessonId: string;
  currentStatus: LessonStatus;
  lessonEvents?: Array<{ status: string; id: string }>;
}

export function LessonStatusLabel({ lessonId, currentStatus, lessonEvents = [] }: LessonStatusLabelProps) {
  const [status, setStatus] = useState<LessonStatus>(currentStatus);
  const [isPending, startTransition] = useTransition();

  const validateStatusChange = (newStatus: LessonStatus): boolean => {
    // Check if changing to 'delegated' or 'rest'
    if (newStatus === 'delegated' || newStatus === 'rest') {
      // Validate that all events are completed or TBC
      const hasUnconfirmedEvents = lessonEvents.some(event => 
        event.status !== 'completed' && event.status !== 'tbc'
      );
      
      if (hasUnconfirmedEvents) {
        toast.error("Lesson status cannot be changed until all events are completed or TBC");
        return false;
      }
    }
    
    return true;
  };

  const handleStatusChange = (newStatus: LessonStatus) => {
    if (newStatus === status) return;

    // Validate the status change
    if (!validateStatusChange(newStatus)) {
      return;
    }

    startTransition(async () => {
      const { success, error } = await updateLessonStatus(lessonId, newStatus);
      if (success) {
        setStatus(newStatus);
        toast.success(`Lesson status updated to ${newStatus}`);
      } else {
        console.error("Failed to update status:", error);
        toast.error(`Failed to update lesson status: ${error}`);
      }
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Label
          className={cn(
            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-colors group",
            getStatusColors(status),
            isPending && "opacity-50 cursor-not-allowed"
          )}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
          <ChevronDown
            className={cn(
              "ml-1 h-3 w-3 transition-transform duration-200 group-data-[state=open]:rotate-180",
              isPending && "animate-spin"
            )}
          />
        </Label>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-40">
        {LESSON_STATUS_ENUM_VALUES.map((s) => (
          <DropdownMenuItem
            key={s}
            onClick={() => handleStatusChange(s)}
            disabled={isPending}
            className={cn(
              "cursor-pointer",
              s === status && "bg-accent text-accent-foreground"
            )}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
