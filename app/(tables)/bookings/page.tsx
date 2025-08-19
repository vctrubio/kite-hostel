import { getBookings } from "@/actions/booking-actions";
import { BookingsTable } from "./BookingsTable";

export default async function BookingPage() {
  const { data: bookings, error: bookingsError } = await getBookings();

  if (bookingsError) {
    return <div>Error loading bookings: {bookingsError}</div>;
  }

  return <BookingsTable initialBookings={bookings} />;
}
