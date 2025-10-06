"use client";

import React, { useState, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createLesson } from "@/actions/lesson-actions";
import { BookingLessonTeacherTable } from "@/components/forms/BookingLessonTeacherTable";
import { useRouter } from "next/navigation";

interface Teacher {
  id: string;
  name: string;
  languages?: string[];
  commissions: {
    id: string;
    price_per_hour: number;
    desc: string | null;
  }[];
}

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
  teachers: Teacher[];
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
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Clean up the event listener when component unmounts
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
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
        onCommissionCreated(); // Call the callback to refresh parent
        router.refresh(); // Revalidate data
        onClose();
      } else {
        toast.error(result.error || "Failed to create lesson.");
      }
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto relative border border-gray-200 dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          Link Booking to Teacher
        </h2>

        {/* Booking Reference Information */}
        {bookingReference && (
          <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              📋 Booking Reference
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Reference ID:
                </span>
                <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-900 dark:text-white">
                  {bookingReference.id}
                </span>
              </div>
              {(bookingReference.teacher?.name || bookingReference.note) && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">
                    {bookingReference.teacher?.name ? "Teacher:" : "Note:"}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {bookingReference.teacher?.name || bookingReference.note}
                  </span>
                </div>
              )}
              {bookingReference.role && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">
                    Role:
                  </span>
                  <span className="capitalize font-medium text-gray-900 dark:text-white">
                    {bookingReference.role}
                  </span>
                </div>
              )}
              {bookingReference.amount && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">
                    Amount:
                  </span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    €{bookingReference.amount}
                  </span>
                </div>
              )}
              {bookingReference.status && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">
                    Status:
                  </span>
                  <span className="capitalize font-medium text-gray-900 dark:text-white">
                    {bookingReference.status}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <BookingLessonTeacherTable
            teachers={teachers}
            selectedTeacherId={selectedTeacherId}
            selectedCommissionId={selectedCommissionId}
            onSelectTeacher={setSelectedTeacherId}
            onSelectCommission={setSelectedCommissionId}
            onCommissionCreated={(commissionId) => {
              // Auto-create lesson when commission is created
              toast.success(
                "Commission created! Creating lesson automatically...",
              );
              handleCreateLesson(commissionId);
            }}
          />
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            onClick={() => handleCreateLesson()}
            disabled={isPending || !selectedTeacherId || !selectedCommissionId}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isPending
              ? "Creating Lesson..."
              : "Create Lesson with Selected Commission"}
          </Button>
        </div>
      </div>
    </div>
  );
}
