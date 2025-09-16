"use client";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { deleteBooking } from "@/actions/booking-actions";

export function DeleteBookingButton({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  
  return (
    <div className="text-sm text-muted-foreground text-center py-2 space-y-2">
      <div>No Lessons</div>
      <Button
        onClick={async () => {
          if (!confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
            return;
          }
          
          const result = await deleteBooking(bookingId);
          if (result.success) {
            toast.success("Booking deleted successfully!");
            router.push('/bookings');
          } else {
            toast.error(result.error || "Failed to delete booking");
          }
        }}
        variant="outline"
        size="sm"
        className="border-2 border-red-300 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
      >
        <Trash2 className="h-3 w-3 mr-1" />
        Delete Booking Plan
      </Button>
    </div>
  );
}