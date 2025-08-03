
import { getPackages } from "@/actions/getters";
import { PackagesTable } from "./PackagesTable";

export default async function PackagesPage() {
  const { data: initialPackages } = await getPackages();

  return (
    <PackagesTable initialPackages={initialPackages} />
  );
}
