"use client";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteLesson } from "@/actions/lesson-actions";

export function DeleteLessonButton({ lessonId }: { lessonId: string }) {
  return (
    <div className="text-sm text-muted-foreground text-center py-2 space-y-2">
      <div>No Events</div>
      <Button
        onClick={async () => {
          if (!confirm('Are you sure you want to delete this lesson? This action cannot be undone.')) {
            return;
          }
          
          const result = await deleteLesson(lessonId);
          if (result.success) {
            toast.success("Lesson deleted successfully!");
            window.location.reload();
          } else {
            toast.error(result.error || "Failed to delete lesson");
          }
        }}
        variant="outline"
        size="sm"
        className="border-2 border-red-300 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
      >
        <Trash2 className="h-3 w-3 mr-1" />
        Delete Lesson Plan
      </Button>
    </div>
  );
}