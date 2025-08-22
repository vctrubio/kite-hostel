import { getAllReferencedBookings } from "@/actions/reference-actions";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { ReferenceBookingRow } from "@/components/rows/ReferenceBookingRow";

export default async function ReferencesPage() {
  const { data: referencedBookings, error } = await getAllReferencedBookings();

  if (error) {
    return <div className="container mx-auto p-4">Error loading references: {error}</div>;
  }

  // Calculate stats based on all referenced bookings
  const totalBookings = referencedBookings?.length || 0;
  const teacherBookings = referencedBookings?.filter(b => b.role === "teacher").length || 0;
  const referenceBookings = referencedBookings?.filter(b => b.role === "reference").length || 0;
  const otherBookings = referencedBookings?.filter(b => b.role !== "teacher" && b.role !== "reference").length || 0;
  
  // Calculate total revenue
  const totalRevenue = referencedBookings?.reduce((sum, b) => sum + (b.packagePrice || 0), 0) || 0;
  const avgCapacity = totalBookings > 0 ? Math.round(referencedBookings?.reduce((sum, b) => sum + (b.packageCapacity || 0), 0) / totalBookings) : 0;

  const stats = [
    {
      description: "Total Referenced Bookings",
      value: totalBookings,
      subStats: [
        { label: "Teacher", value: teacherBookings },
        { label: "Reference", value: referenceBookings },
        { label: "Others", value: otherBookings },
      ],
    },
    {
      description: "Revenue & Capacity",
      value: `€${totalRevenue}`,
      subStats: [
        { label: "Avg Capacity", value: `${avgCapacity} students` },
        { label: "Avg Revenue", value: totalBookings > 0 ? `€${Math.round(totalRevenue / totalBookings)}` : "€0" },
      ],
    },
  ];

  return (
    <Dashboard
      entityName="Reference"
      stats={stats}
      rowComponent={ReferenceBookingRow}
      data={referencedBookings || []}
      isFilterRangeSelected={true}
      isDropdown={false}
    />
  );
}