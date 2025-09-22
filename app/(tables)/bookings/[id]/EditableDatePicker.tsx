"use client";

import { useState, useTransition } from "react";
import { DatePicker, DateRange } from "@/components/pickers/date-picker";
import { updateBookingDates, deleteBooking } from "@/actions/booking-actions";
import { Edit3, Save, X, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function EditableDatePicker({
  bookingId,
  initialDateStart,
  initialDateEnd,
  hasAnyEvents,
}: {
  bookingId: string;
  initialDateStart: string;
  initialDateEnd: string;
  hasAnyEvents: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: initialDateStart,
    endDate: initialDateEnd,
  });
  const [isPending, startTransition] = useTransition();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const router = useRouter();

  const handleSave = () => {
    startTransition(async () => {
      try {
        const result = await updateBookingDates(
          bookingId,
          dateRange.startDate,
          dateRange.endDate
        );
        
        if (result.success) {
          setIsEditing(false);
          // Optionally show success message
        } else {
          console.error("Failed to update dates:", result.error);
          // Optionally show error message
        }
      } catch (error) {
        console.error("Error updating dates:", error);
      }
    });
  };

  const handleCancel = () => {
    setDateRange({
      startDate: initialDateStart,
      endDate: initialDateEnd,
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const result = await deleteBooking(bookingId);
        
        if (result.success) {
          router.push("/bookings");
        } else {
          console.error("Failed to delete booking:", result.error);
          // Optionally show error message
        }
      } catch (error) {
        console.error("Error deleting booking:", error);
      }
    });
  };

  if (!isEditing) {
    return (
      <div className="border-t border-border pt-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            Edit Dates
          </button>
          
          {!hasAnyEvents && (
            <>
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Booking
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Delete this booking?</span>
                  <button
                    onClick={handleDelete}
                    disabled={isPending}
                    className="px-2 py-1 text-xs font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded transition-colors"
                  >
                    {isPending ? "Deleting..." : "Yes"}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isPending}
                    className="px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                  >
                    No
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-border pt-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Edit Booking Dates</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={isPending}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-md transition-colors"
          >
            <Save className="w-4 h-4" />
            {isPending ? "Saving..." : "Save"}
          </button>
          <button
            onClick={handleCancel}
            disabled={isPending}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
        </div>
      </div>
      
      <DatePicker
        dateRange={dateRange}
        setDateRange={setDateRange}
        disabled={isPending}
        allowPastDates={true}
      />
    </div>
  );
}