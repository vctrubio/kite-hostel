import { getTeachersWithMetrics } from "@/actions/teacher-actions";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { TeacherRow } from "@/components/rows/TeacherRow";

export default async function TeachersPage() {
  const { data: teachers, error } = await getTeachersWithMetrics();

  if (error) {
    return <div>Error loading teachers: {error}</div>;
  }

  // No stats for teachers
  const stats: any[] = [];

  return (
    <Dashboard
      entityName="Teacher"
      stats={stats}
      rowComponent={TeacherRow}
      data={teachers}
      isFilterRangeSelected={false}
      isDropdown={true}
    />
  );
}