import { getBookingById } from "@/actions/booking-actions";

interface BookingDetailPageProps {
  params: { id: string };
}

export default async function BookingDetailPage({ params }: BookingDetailPageProps) {
  const { id } = params;
  const { data: booking, error } = await getBookingById(id);

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!booking) {
    return <div className="text-gray-500">Booking not found.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Booking Details: {booking.id}</h1>
      <p>Package: {booking.package?.description || "N/A"}</p>
      <p>Status: {booking.status}</p>
      <p>Start Date: {new Date(booking.date_start).toLocaleDateString()}</p>
      <p>End Date: {new Date(booking.date_end).toLocaleDateString()}</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Students</h2>
      {booking.students.length > 0 ? (
        <ul>
          {booking.students.map((bs) => (
            <li key={bs.student.id}>{bs.student.name}</li>
          ))}
        </ul>
      ) : (
        <p>No students associated with this booking.</p>
      )}

      <h2 className="text-xl font-semibold mt-6 mb-2">Lessons</h2>
      {booking.lessons.length > 0 ? (
        <ul>
          {booking.lessons.map((lesson) => (
            <li key={lesson.id}>
              Teacher: {lesson.teacher.name}, Status: {lesson.status}
              {lesson.events.length > 0 && (
                <ul className="ml-4 list-disc list-inside">
                  {lesson.events.map((event) => (
                    <li key={event.id}>Event: {new Date(event.date).toLocaleDateString()} - {event.location} ({event.duration} min)</li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No lessons associated with this booking.</p>
      )}
    </div>
  );
}