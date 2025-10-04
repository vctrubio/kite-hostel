import { getStudents } from "@/actions/student-actions";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { StudentRow } from "@/components/rows/StudentRow";

export default async function StudentsPage() {
  const { data: students, error } = await getStudents();

  if (error) {
    return <div>Error loading students: {error}</div>;
  }

  // Basic stats template - actual calculations will be done in Dashboard component
  const stats = [
    {
      description: "Total Students",
      value: 0, // Will be calculated dynamically
      subStats: [
        { label: "Local (Spain)", value: 0 },
        { label: "Foreign", value: 0 },
      ],
    },
    {
      description: "Active Bookings", 
      value: 0, // Will be calculated dynamically
      subStats: [
        { label: "Completed Bookings", value: 0 },
        { label: "Students with No Bookings", value: 0 },
      ],
    },
  ];

  console.log("students from page: ", students);

  return (
    <Dashboard
      entityName="Student"
      stats={stats}
      rowComponent={StudentRow}
      data={students}
      isDropdown={true}
    />
  );
}
