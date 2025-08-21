"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { KiteIcon } from "@/svgs";
import { toast } from "sonner";

interface EventFormProps {
  onSubmit?: () => void;
}

export function EventForm({ onSubmit }: EventFormProps) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Hello world placeholder
    toast.success("Hello World! Event form submitted.");
    
    if (onSubmit) {
      onSubmit();
    }
    
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <Card>
      <div className="w-full p-6">
        <div className="flex items-center gap-3 mb-6">
          <KiteIcon className="h-6 w-6 text-teal-500" />
          <h2 className="text-lg font-semibold">Create New Event</h2>
        </div>
        
        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-4">
          <div className="p-4 bg-muted rounded-lg text-center">
            <p className="text-lg font-medium text-muted-foreground">
              Hello World!
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Event form placeholder - coming soon
            </p>
          </div>
          
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={loading}
              className="h-9 px-6 bg-teal-500 hover:bg-teal-600 text-white"
            >
              {loading ? "Creating..." : "Create Event"}
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
}