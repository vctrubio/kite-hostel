import { getLessonsWithDetails } from "@/actions/lesson-actions";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { LessonRow } from "@/components/rows/LessonRow";

export default async function LessonsPage() {
  const { data: lessons, error } = await getLessonsWithDetails();

  if (error) {
    return <div className="container mx-auto p-4">Error loading lessons: {error}</div>;
  }

  // Stats template - actual calculations will be done in Dashboard component
  const stats = [
    {
      description: "Total Lessons",
      value: 0, // Will be calculated dynamically
      subStats: [
        { label: "Planned", value: 0 },
        { label: "Completed", value: 0 },
        { label: "Rest", value: 0 },
        { label: "Delegated", value: 0 },
      ],
    },
    {
      description: "Hours",
      value: "0h", // Will be calculated dynamically
      subStats: [
        { label: "Private", value: "0h" },
        { label: "Semi-private", value: "0h" },
        { label: "Group", value: "0h" },
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