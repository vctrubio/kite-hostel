import { getBookings } from "@/actions/booking-actions";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { BookingRow } from "@/components/rows/BookingRow";

export default async function BookingPage() {
  const { data: bookings, error: bookingsError } = await getBookings();

  if (bookingsError) {
    return <div>Error loading bookings: {bookingsError}</div>;
  }

  // Stats template - actual calculations will be done in Dashboard component

  const stats = [
    {
      description: "Total Bookings",
      value: 0, // Will be calculated dynamically
      subStats: [
        { label: "Active", value: 0 },
        { label: "Completed", value: 0 },
        { label: "Uncompleted", value: 0 },
      ],
    },
    {
      description: "Total Hours",
      value: "0h", // Will be calculated dynamically
      subStats: [
        { label: "School Revenue", value: "€0" },
        { label: "Teacher Earnings", value: "€0" },
        { label: "School Earnings", value: "€0" },
      ],
    },
  ];

  return (
    <Dashboard
      entityName="Booking"
      stats={stats}
      rowComponent={BookingRow}
      data={bookings}
    />
  );
}
