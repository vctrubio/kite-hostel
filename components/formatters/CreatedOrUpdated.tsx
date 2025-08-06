"use client";

import React from "react";
import { format } from "date-fns";

interface CreatedOrUpdatedProps {
  createdAt: string;
  updatedAt: string;
}

export function CreatedOrUpdated({ createdAt, updatedAt }: CreatedOrUpdatedProps) {
  const createdDate = new Date(createdAt);
  const updatedDate = new Date(updatedAt);

  const isSameDate = createdDate.getTime() === updatedDate.getTime();

  return (
    <div className="flex flex-col">
      <span className="text-sm text-foreground">
        {format(createdDate, "dd-MM-yy | HH:mm")}
      </span>
      {!isSameDate && (
        <span className="text-xs text-muted-foreground">
          {format(updatedDate, "dd-MM-yy | HH:mm")}
        </span>
      )}
    </div>
  );
}
