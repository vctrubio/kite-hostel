import { getStudents } from "@/actions/student-actions";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { StudentRow } from "@/components/rows/StudentRow";

export default async function StudentsPage() {
  const { data: students, error } = await getStudents();

  if (error) {
    return <div>Error loading students: {error}</div>;
  }

  // Calculate stats based on all students
  const totalStudents = students.length;
  const localStudents = students.filter((s) => s.country === "Spain").length;
  const foreignStudents = totalStudents - localStudents;

  // Calculate students with active bookings
  const studentsWithActiveBookings = students.filter((s) => 
    s.bookings?.some((b: any) => b.status === "active")
  ).length;
  
  const studentsWithCompletedBookings = students.filter((s) => 
    s.bookings?.some((b: any) => b.status === "completed")
  ).length;
  
  const studentsWithCancelledBookings = students.filter((s) => 
    s.bookings?.some((b: any) => b.status === "cancelled")
  ).length;

  const stats = [
    {
      description: "Total Students",
      value: totalStudents,
      subStats: [
        { label: "Local (Spain)", value: localStudents },
        { label: "Foreign", value: foreignStudents },
      ],
    },
    {
      description: "Students with Active Bookings",
      value: studentsWithActiveBookings,
      subStats: [
        { label: "Completed Bookings", value: studentsWithCompletedBookings },
        { label: "Cancelled Bookings", value: studentsWithCancelledBookings },
      ],
    },
  ];

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