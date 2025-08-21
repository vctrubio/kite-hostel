import { getKitesWithEvents } from "@/actions/kite-actions";
import { getTeachers } from "@/actions/teacher-actions";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { KiteRow } from "@/components/tables-tmp/KiteRow";

export default async function KitesPage() {
  const { data: kites, error: kitesError } = await getKitesWithEvents();
  const { data: teachers, error: teachersError } = await getTeachers();

  if (kitesError) {
    return (
      <div className="container mx-auto p-4">
        Error loading kites: {kitesError}
      </div>
    );
  }

  if (teachersError) {
    return (
      <div className="container mx-auto p-4">
        Error loading teachers: {teachersError}
      </div>
    );
  }

  // Calculate stats based on all kites
  const totalKites = kites?.length || 0;
  const kitesWithTeachers = kites?.filter(k => k.assignedTeachers?.length > 0).length || 0;
  const kitesUsedInEvents = kites?.filter(k => k.events?.length > 0).length || 0;
  const totalEvents = kites?.reduce((sum, k) => sum + (k.events?.length || 0), 0) || 0;
  const totalTeacherAssignments = kites?.reduce((sum, k) => sum + (k.assignedTeachers?.length || 0), 0) || 0;

  const stats = [
    {
      description: "Total Kites",
      value: totalKites,
      subStats: [
        { label: "With Teachers", value: kitesWithTeachers },
        { label: "Available", value: totalKites - kitesWithTeachers },
      ],
    },
    {
      description: "Usage & Events",
      value: `${kitesUsedInEvents} used`,
      subStats: [
        { label: "Total Events", value: totalEvents },
        { label: "Teacher Assignments", value: totalTeacherAssignments },
      ],
    },
  ];

  return (
    <Dashboard
      entityName="Kite"
      stats={stats}
      rowComponent={KiteRow}
      data={kites || []}
      isFilterRangeSelected={false}
      isDropdown={true}
      formProps={{ teachers: teachers || [] }}
    />
  );
}
