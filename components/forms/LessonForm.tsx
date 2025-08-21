"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FlagIcon } from "@/svgs";
import { toast } from "sonner";

interface LessonFormProps {
  onSubmit?: () => void;
}

export function LessonForm({ onSubmit }: LessonFormProps) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Hello world placeholder
    toast.success("Hello World! Lesson form submitted.");
    
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
          <FlagIcon className="h-6 w-6 text-cyan-500" />
          <h2 className="text-lg font-semibold">Create New Lesson</h2>
        </div>
        
        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-4">
          <div className="p-4 bg-muted rounded-lg text-center">
            <p className="text-lg font-medium text-muted-foreground">
              Hello World!
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Lesson form placeholder - coming soon
            </p>
          </div>
          
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={loading}
              className="h-9 px-6 bg-cyan-500 hover:bg-cyan-600 text-white"
            >
              {loading ? "Creating..." : "Create Lesson"}
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
}