import { getBookings } from "@/actions/booking-actions";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { BookingRow } from "@/components/rows/BookingRow";

export default async function BookingPage() {
  const { data: bookings, error: bookingsError } = await getBookings();

  if (bookingsError) {
    return <div>Error loading bookings: {bookingsError}</div>;
  }

  // Calculate stats based on all bookings
  const activeBookings = bookings.filter((b) => b.status === "active").length;
  const completedBookings = bookings.filter(
    (b) => b.status === "completed",
  ).length;
  const totalBookings = bookings.length;

  // Calculate total hours and revenue
  const totalHours = bookings.reduce((sum, booking) => {
    return sum + (booking.package?.duration || 0);
  }, 0);

  const totalRevenue = bookings.reduce((sum, booking) => {
    const studentsCount = booking.students?.length || 0;
    const pricePerStudent = booking.package?.price_per_student || 0;
    return sum + studentsCount * pricePerStudent;
  }, 0);

  // Calculate teacher earnings from all lessons
  const teacherEarnings = bookings.reduce((sum, booking) => {
    if (!booking.lessons || booking.lessons.length === 0) return sum;

    return (
      sum +
      booking.lessons.reduce((lessonSum, lesson) => {
        if (lesson.events && lesson.commission) {
          // Calculate total event duration for this lesson
          const totalEventDuration = lesson.events.reduce((eventSum, event) => {
            return eventSum + (event.duration || 0);
          }, 0);

          // Convert minutes to hours and multiply by commission rate
          const hoursWorked = totalEventDuration / 60;
          const commissionRate = lesson.commission.price_per_hour || 0;
          return lessonSum + hoursWorked * commissionRate;
        }
        return lessonSum;
      }, 0)
    );
  }, 0);

  // Calculate top references (leaderboard)
  const referenceStats = bookings.reduce(
    (acc, booking) => {
      if (booking.reference?.teacher?.name) {
        const name = booking.reference.teacher.name;
        acc[name] = (acc[name] || 0) + 1;
      } else if (booking.reference?.role) {
        const role = booking.reference.role;
        acc[role] = (acc[role] || 0) + 1;
      }
      return acc;
    },
    {} as Record<string, number>,
  );

  const topReferences = Object.entries(referenceStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  const stats = [
    {
      description: "Total Bookings",
      value: totalBookings,
      subStats: [
        { label: "Active", value: activeBookings },
        { label: "Completed", value: completedBookings },
      ],
    },
    {
      description: "Total Hours",
      value: `${Math.round(totalHours / 60)}h`,
      subStats: [
        { label: "School Revenue", value: `€${totalRevenue}` },
        { label: "Teacher Earnings", value: `€${Math.round(teacherEarnings)}` },
      ],
    },
    {
      description: "Top References",
      value: topReferences.length > 0 ? topReferences[0][1] : 0,
      subStats: topReferences.map(([name, count], index) => ({
        label: `${index + 1}. ${name}`,
        value: count,
      })),
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
