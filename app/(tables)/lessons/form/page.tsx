import { Booking4LessonTable } from "@/components/forms/Booking4LessonTable";
import { getBookings } from "@/actions/booking-actions";

export default async function LessonFormPage() {
  const { data: bookings, error } = await getBookings();

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">
            Failed to load bookings: {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6">
      <Booking4LessonTable bookings={bookings || []} />
    </div>
  );
}