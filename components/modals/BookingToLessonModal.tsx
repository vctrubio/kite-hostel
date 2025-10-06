"use client";

import React, { useState, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createLesson } from "@/actions/lesson-actions";
import { BookingLessonTeacherTable } from "@/components/forms/BookingLessonTeacherTable";
import { InferSelectModel } from "drizzle-orm";
import { Teacher } from "@/drizzle/migrations/schema";
import { useRouter } from "next/navigation";

interface BookingToLessonModalProps {
  bookingId: string;
  bookingReference?: {
    id: string;
    teacher: {
      id: string;
      name: string;
    } | null;
    amount?: number;
    status?: string;
    role?: string;
    note?: string;
  } | null;
  onClose: () => void;
  teachers: InferSelectModel<typeof Teacher>[];
  onCommissionCreated: () => void;
}

export function BookingToLessonModal({
  bookingId,
  bookingReference,
  onClose,
  teachers,
  onCommissionCreated,
}: BookingToLessonModalProps) {
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(
    null,
  );
  const [selectedCommissionId, setSelectedCommissionId] = useState<
    string | null
  >(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Add event listener for the Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    // Clean up the event listener when component unmounts
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handleCreateLesson = async (autoCommissionId?: string) => {
    const commissionId = autoCommissionId || selectedCommissionId;
    
    if (!selectedTeacherId || !commissionId) {
      toast.error("Please select both a teacher and a commission.");
      return;
    }

    startTransition(async () => {
      const result = await createLesson({
        booking_id: bookingId,
        teacher_id: selectedTeacherId,
        commission_id: commissionId,
      });

      if (result.success) {
        toast.success("Lesson created successfully and linked to booking!");
        router.refresh(); // Revalidate data
        onClose();
      } else {
        toast.error(result.error || "Failed to create lesson.");
      }
    });
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
      onClick={onClose}
    >
      <div 
        className="bg-card rounded-lg shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto relative z-[10000]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4">Link Booking to Teacher</h2>

        {/* Booking Reference Information */}
        {bookingReference && (
          <div className="mb-4 p-3 bg-muted dark:bg-gray-800 rounded-lg border">
            <h3 className="text-sm font-medium text-foreground dark:text-white mb-2">
              📋 Booking Reference
            </h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reference ID:</span>
                <span className="font-mono text-xs">{bookingReference.id}</span>
              </div>
              {(bookingReference.teacher?.name || bookingReference.note) && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {bookingReference.teacher?.name ? "Teacher:" : "Note:"}
                  </span>
                  <span className="font-medium">
                    {bookingReference.teacher?.name || bookingReference.note}
                  </span>
                </div>
              )}
              {bookingReference.role && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Role:</span>
                  <span className="capitalize font-medium">
                    {bookingReference.role}
                  </span>
                </div>
              )}
              {bookingReference.amount && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-medium">
                    €{bookingReference.amount}
                  </span>
                </div>
              )}
              {bookingReference.status && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="capitalize font-medium">
                    {bookingReference.status}
                  </span>
                </div>
              )}
            </div>
            {bookingReference.teacher?.name && (
              <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs text-blue-700 dark:text-blue-300">
                💡 Consider using the same teacher (
                {bookingReference.teacher.name}) for consistency
              </div>
            )}
          </div>
        )}

        <div className="space-y-4">
          <BookingLessonTeacherTable
            teachers={teachers as any} // TODO: Fix type mismatch - teachers need commissions
            selectedTeacherId={selectedTeacherId}
            selectedCommissionId={selectedCommissionId}
            onSelectTeacher={setSelectedTeacherId}
            onSelectCommission={setSelectedCommissionId}
            onCommissionCreated={(commissionId) => {
              // Auto-create lesson when commission is created
              handleCreateLesson(commissionId);
            }}
          />
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateLesson}
            disabled={isPending || !selectedTeacherId || !selectedCommissionId}
          >
            {isPending ? "Creating..." : "Create Lesson"}
          </Button>
        </div>
      </div>
    </div>
  );
}
