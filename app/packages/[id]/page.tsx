
import { getPackageById } from "@/actions/package-actions";
import { PackageDetails } from "./PackageDetails";

export default async function PackagePage({ params }: { params: { id: string } }) {
  const { data: pkg } = await getPackageById(params.id);

  if (!pkg) {
    return <div>Package not found.</div>;
  }

  return (
    <PackageDetails pkg={pkg} />
  );
}
