import { getLessonsWithDetails } from "@/actions/lesson-actions";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { LessonRow } from "@/components/tables-tmp/LessonRow";

export default async function LessonsPage() {
  const { data: lessons, error } = await getLessonsWithDetails();

  if (error) {
    return <div className="container mx-auto p-4">Error loading lessons: {error}</div>;
  }

  // Calculate stats based on all lessons
  const totalLessons = lessons?.length || 0;
  const plannedLessons = lessons?.filter(l => l.status === "planned").length || 0;
  const completedLessons = lessons?.filter(l => l.status === "completed").length || 0;
  const restLessons = lessons?.filter(l => l.status === "rest").length || 0;
  const delegatedLessons = lessons?.filter(l => l.status === "delegated").length || 0;
  
  // Calculate total events and duration
  const totalEvents = lessons?.reduce((sum, l) => sum + (l.events?.length || 0), 0) || 0;
  const totalDuration = lessons?.reduce((sum, l) => sum + (l.totalEventHours || 0), 0) || 0;

  const stats = [
    {
      description: "Total Lessons",
      value: totalLessons,
      subStats: [
        { label: "Planned", value: plannedLessons },
        { label: "Completed", value: completedLessons },
        { label: "Rest", value: restLessons },
      ],
    },
    {
      description: "Events & Duration",
      value: `${totalEvents} events`,
      subStats: [
        { label: "Total Hours", value: `${Math.round(totalDuration)}h` },
        { label: "Delegated", value: delegatedLessons },
      ],
    },
  ];

  return (
    <Dashboard
      entityName="Lesson"
      stats={stats}
      rowComponent={LessonRow}
      data={lessons || []}
      isFilterRangeSelected={true}
      isDropdown={false}
    />
  );
}



