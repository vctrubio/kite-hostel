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
import { EVENT_STATUS_ENUM_VALUES, type EventStatus, getEventStatusColor } from "@/lib/constants";
import { updateEvent } from "@/actions/event-actions";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";

interface EventStatusLabelProps {
  eventId: string;
  currentStatus: EventStatus;
}

export function EventStatusLabel({ eventId, currentStatus }: EventStatusLabelProps) {
  const [status, setStatus] = useState<EventStatus>(currentStatus);
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (newStatus: EventStatus) => {
    if (newStatus === status) return;

    startTransition(async () => {
      const { success, error } = await updateEvent(eventId, { status: newStatus });
      if (success) {
        setStatus(newStatus);
        toast.success(`Event status updated to ${newStatus}`);
      } else {
        console.error("Failed to update event status:", error);
        toast.error(`Failed to update event status: ${error}`);
      }
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Label
          className={cn(
            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-colors group",
            getEventStatusColor(status),
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
        {EVENT_STATUS_ENUM_VALUES.map((s) => (
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