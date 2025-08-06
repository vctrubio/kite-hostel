"use client";

import { useEffect, useState } from "react";
import { KiteRow } from "./KiteRow";
import { KiteForm } from "@/components/forms/KiteForm";
import { SeedKiteForm } from "@/seed/SeedKiteForm";

interface KitesTableProps {
  initialKites: any[];
  teachers: any[];
}

export function KitesTable({ initialKites, teachers }: KitesTableProps) {
  const [kites, setKites] = useState(initialKites);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  useEffect(() => {
    setKites(initialKites);
  }, [initialKites]);

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 space-y-2 md:space-y-0">
        <h1 className="text-2xl font-bold">Kites</h1>
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 w-full md:w-auto">
          <KiteForm teachers={teachers} />
          <SeedKiteForm />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="py-2 px-4 text-left border-b">Model</th>
              <th className="py-2 px-4 text-left border-b">Size</th>
              <th className="py-2 px-4 text-left border-b">Serial ID</th>
            </tr>
          </thead>
          <tbody>
            {kites.map((kite) => (
              <KiteRow
                key={kite.id}
                kite={kite}
                expandedRow={expandedRow}
                setExpandedRow={setExpandedRow}
                allTeachers={teachers}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
