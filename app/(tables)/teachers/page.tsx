import { getTeachers } from "@/actions/teacher-actions";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { TeacherRow } from "@/components/rows/TeacherRow";

export default async function TeachersPage() {
  const { data: teachers, error } = await getTeachers();

  if (error) {
    return <div>Error loading teachers: {error}</div>;
  }

  // Calculate stats based on all teachers
  const totalTeachers = teachers.length;
  const localTeachers = teachers.filter((t) => t.country === "Spain").length;
  const foreignTeachers = totalTeachers - localTeachers;

  // Calculate teachers with commissions
  const teachersWithCommissions = teachers.filter((t) => 
    t.commissions?.length > 0
  ).length;
  
  const totalCommissions = teachers.reduce((sum, t) => sum + (t.commissions?.length || 0), 0);
  
  // Calculate average commission rate
  const allCommissions = teachers.flatMap(t => t.commissions || []);
  const avgCommissionRate = allCommissions.length > 0 
    ? Math.round(allCommissions.reduce((sum, c) => sum + c.price_per_hour, 0) / allCommissions.length)
    : 0;

  const stats = [
    {
      description: "Total Teachers",
      value: totalTeachers,
      subStats: [
        { label: "Local (Spain)", value: localTeachers },
        { label: "Foreign", value: foreignTeachers },
      ],
    },
    {
      description: "Commission Stats",
      value: `€${avgCommissionRate}/h`,
      subStats: [
        { label: "Teachers with Rates", value: teachersWithCommissions },
        { label: "Total Commission Rates", value: totalCommissions },
      ],
    },
  ];

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