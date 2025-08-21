
import { getPackages } from "@/actions/package-actions";
import { PackagesTable } from "../../../components/tables-tmp/PackagesTable";

export default async function PackagesPage() {
  const { data: initialPackages } = await getPackages();

  return (
    <PackagesTable initialPackages={initialPackages} />
  );
}
