import { getAllReferencedBookings } from "@/actions/reference-actions";
import { ReferenceBookingTable } from "./ReferenceBookingTable";

export default async function Page() {
  const { data: initialReferencedBookings, error } = await getAllReferencedBookings();

  if (error) {
    return <div className="container mx-auto p-4">Error: {error}</div>;
  }

  return <ReferenceBookingTable initialReferencedBookings={initialReferencedBookings || []} />;
}