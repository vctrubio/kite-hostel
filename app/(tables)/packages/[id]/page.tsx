
import { getPackageById } from "@/actions/package-actions";
import { PackageDetails } from "./PackageDetails";

export default async function PackagePage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const { data: pkg } = await getPackageById(id);

  if (!pkg) {
    return <div>Package not found.</div>;
  }

  return (
    <PackageDetails pkg={pkg} />
  );
}
