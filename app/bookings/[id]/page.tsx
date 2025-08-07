import { getBookingById } from "@/actions/booking-actions";
import { format } from "date-fns";
import { notFound } from "next/navigation";

export default async function BookingDetailsPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const { data: booking, error } = await getBookingById(id);

  if (error) {
    console.error("Error fetching booking:", error);
    return <div>Error: {error}</div>;
  }

  if (!booking) {
    notFound();
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Booking Details: {booking.id}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">General Information</h2>
          <p><strong>Status:</strong> {booking.status}</p>
          <p><strong>Created At:</strong> {booking.created_at ? format(new Date(booking.created_at), "PPP p") : "N/A"}</p>
          <p><strong>Start Date:</strong> {booking.date_start ? format(new Date(booking.date_start), "PPP p") : "N/A"}</p>
          <p><strong>End Date:</strong> {booking.date_end ? format(new Date(booking.date_end), "PPP p") : "N/A"}</p>
        </div>

        {booking.package && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Package Details</h2>
            <p><strong>Description:</strong> {booking.package.description}</p>
            <p><strong>Duration:</strong> {booking.package.duration} minutes</p>
            <p><strong>Capacity Students:</strong> {booking.package.capacity_students}</p>
            <p><strong>Capacity Kites:</strong> {booking.package.capacity_kites}</p>
            <p><strong>Price:</strong> €{booking.package.price_per_student}</p>
          </div>
        )}

        {booking.reference && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Reference Details</h2>
            <p><strong>Role:</strong> {booking.reference.role}</p>
            {booking.reference.teacher && (
              <p><strong>Teacher Name:</strong> {booking.reference.teacher.name}</p>
            )}
            {booking.reference.note && (
              <p><strong>Note:</strong> {booking.reference.note}</p>
            )}
            <p><strong>Reference ID:</strong> {booking.reference.id}</p>
          </div>
        )}

        {booking.students && booking.students.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Students</h2>
            <ul>
              {booking.students.map((bs) => (
                <li key={bs.student.id}>{bs.student.name}</li>
              ))}
            </ul>
          </div>
        )}

        {booking.lessons && booking.lessons.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Lessons</h2>
            <ul>
              {booking.lessons.map((lesson) => (
                <li key={lesson.id}>
                  Lesson ID: {lesson.id}, Status: {lesson.status}
                  {lesson.events && lesson.events.length > 0 && (
                    <ul className="ml-4">
                      {lesson.events.map((event) => (
                        <li key={event.id}>
                          Event ID: {event.id}, Date: {format(new Date(event.date), "PPP")}, Location: {event.location}
                          {event.kites && event.kites.length > 0 && (
                            <ul className="ml-4">
                              {event.kites.map((ke) => (
                                <li key={ke.kite.id}>Kite: {ke.kite.model} ({ke.kite.serial_id})</li>
                              ))}
                            </ul>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
