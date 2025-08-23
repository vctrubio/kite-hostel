import { getPackages } from "@/actions/package-actions";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { PackageRow } from "@/components/rows/PackageRow";

export default async function PackagesPage() {
  const { data: packages, error } = await getPackages();

  if (error) {
    return <div>Error loading packages: {error}</div>;
  }

  return (
    <Dashboard
      entityName="Package"
      rowComponent={PackageRow}
      data={packages}
      stats={[]}
      isFilterRangeSelected={false}
      isDropdown={true}
    />
  );
}
