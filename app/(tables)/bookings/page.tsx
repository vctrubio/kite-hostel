import Link from "next/link";
import { getBookings } from "@/actions/booking-actions";
import { BookingsTable } from "./BookingsTable";

export default async function BookingPage() {
  const { data: bookings, error: bookingsError } = await getBookings();

  if (bookingsError) {
    return <div>Error loading bookings: {bookingsError}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Bookings</h1>
        <Link 
          href="/bookings/form"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Create New Booking
        </Link>
      </div>
      
      <div>
        <h2 className="text-2xl font-bold mb-4">All Bookings</h2>
        <BookingsTable initialBookings={bookings} />
      </div>
    </div>
  );
}
