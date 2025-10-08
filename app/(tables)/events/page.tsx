import { getEvents } from "@/actions/event-actions";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { EventRow } from "@/components/rows/EventRow";

export default async function EventsPage() {
  const { data: events, error } = await getEvents();

  if (error) {
    return <div className="container mx-auto p-4">Error loading events: {error}</div>;
  }

  // Calculate stats based on all events
  const totalEvents = events?.length || 0;
  const plannedEvents = events?.filter(e => e.status === "planned").length || 0;
  const completedEvents = events?.filter(e => e.status === "completed").length || 0;
  const tbcEvents = events?.filter(e => e.status === "tbc").length || 0;
  
  // Calculate total revenue and duration
  const totalDuration = events?.reduce((sum, e) => sum + (e.duration || 0), 0) || 0;
  const totalRevenue = events?.reduce((sum, e) => {
    if (e.package?.price_per_student && e.student_count && e.duration && e.package?.duration) {
      const hours = e.duration / 60;
      const packageHours = e.package.duration / 60;
      const pricePerHour = e.package.price_per_student / packageHours;
      return sum + (pricePerHour * hours * e.student_count);
    }
    return sum;
  }, 0) || 0;

  const stats = [
    {
      description: "Total Events",
      value: totalEvents,
      subStats: [
        { label: "Planned", value: plannedEvents },
        { label: "Completed", value: completedEvents },
        { label: "TBC", value: tbcEvents },
      ],
    },
    {
      description: "Revenue & Duration",
      value: `€${Math.round(totalRevenue)}`,
      subStats: [
        { label: "Total Hours", value: `${Math.round(totalDuration / 60)}h` },
        { label: "Avg Duration", value: totalEvents > 0 ? `${Math.round(totalDuration / totalEvents)}min` : "0min" },
      ],
    },
  ];

  return (
    <Dashboard
      entityName="Event"
      rowComponent={EventRow}
      data={events || []}
      isFilterRangeSelected={true}
      isDropdown={false}
    />
  );
}
