
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PackageRow } from "./PackageRow";

import { SeedPackageForm } from "@/seed/SeedPackageForm";

interface PackagesTableProps {
  initialPackages: any[];
}

export function PackagesTable({ initialPackages }: PackagesTableProps) {
  const [packages, setPackages] = useState(initialPackages);
  const router = useRouter();
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  useEffect(() => {
    setPackages(initialPackages);
  }, [initialPackages]);


  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Packages</h1>
        <SeedPackageForm />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="py-2 px-4 text-left">Hours</th>
              <th className="py-2 px-4 text-left">Capacity</th>
              <th className="py-2 px-4 text-left">Price</th>
              <th className="py-2 px-4 text-left">Description</th>
              <th className="py-2 px-4 text-left">Kites</th>
            </tr>
          </thead>
          <tbody>
            {packages.map((pkg) => (
              <PackageRow
                key={pkg.id}
                pkg={pkg}
                expandedRow={expandedRow}
                setExpandedRow={setExpandedRow}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
