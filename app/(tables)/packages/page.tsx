
import { getPackages } from "@/actions/package-actions";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { PackageRow } from "@/components/rows/PackageRow";

export default async function PackagesPage() {
  const { data: packages, error } = await getPackages();

  if (error) {
    return <div>Error loading packages: {error}</div>;
  }

  // Calculate stats based on all packages
  const totalPackages = packages.length;
  const totalBookings = packages.reduce((sum, p) => sum + (p.bookingCount || 0), 0);
  
  // Calculate average price and duration
  const avgPrice = packages.length > 0 
    ? Math.round(packages.reduce((sum, p) => sum + p.price_per_student, 0) / packages.length)
    : 0;
  
  const avgDuration = packages.length > 0 
    ? Math.round(packages.reduce((sum, p) => sum + p.duration, 0) / packages.length)
    : 0;

  // Calculate revenue stats
  const totalRevenue = packages.reduce((sum, p) => sum + (p.price_per_student * (p.bookingCount || 0)), 0);
  
  // Package capacity stats
  const totalStudentCapacity = packages.reduce((sum, p) => sum + p.capacity_students, 0);
  const totalKiteCapacity = packages.reduce((sum, p) => sum + p.capacity_kites, 0);

  const stats = [
    {
      description: "Total Packages",
      value: totalPackages,
      subStats: [
        { label: "Active Bookings", value: totalBookings },
        { label: "Avg Duration", value: `${avgDuration}min` },
      ],
    },
    {
      description: "Revenue & Pricing",
      value: `€${avgPrice}/student`,
      subStats: [
        { label: "Total Revenue", value: `€${totalRevenue}` },
        { label: "Student Capacity", value: totalStudentCapacity },
        { label: "Kite Capacity", value: totalKiteCapacity },
      ],
    },
  ];

  return (
    <Dashboard
      entityName="Package"
      stats={stats}
      rowComponent={PackageRow}
      data={packages}
      isFilterRangeSelected={false}
      isDropdown={true}
    />
  );
}
