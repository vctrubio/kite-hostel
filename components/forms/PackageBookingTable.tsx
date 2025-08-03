"use client";

import React from "react";
import { Duration } from "@/components/formatters/Duration";

interface Package {
  id: string;
  description: string;
  duration: number;
  price_per_student: number;
  capacity_students: number;
  capacity_kites: number;
}

interface PackageBookingTableProps {
  packages: Package[];
  onSelectPackage: (packageId: string) => void;
  selectedPackageId: string;
}

export function PackageBookingTable({ packages, onSelectPackage, selectedPackageId }: PackageBookingTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Description
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Duration (hours)
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Price (€)
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Capacity
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Kites
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {packages.map((pkg) => (
            <tr
              key={pkg.id}
              className={`cursor-pointer hover:bg-gray-100 ${selectedPackageId === pkg.id ? 'bg-blue-100' : ''}`}
              onClick={() => onSelectPackage(selectedPackageId === pkg.id ? "" : pkg.id)}
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {pkg.description}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <Duration minutes={pkg.duration} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {pkg.price_per_student}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {pkg.capacity_students}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {pkg.capacity_kites}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
