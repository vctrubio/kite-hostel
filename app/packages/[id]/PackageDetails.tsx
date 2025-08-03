
"use client";

import { Duration } from "@/components/formatters/Duration";

interface PackageDetailsProps {
  pkg: any;
}

export function PackageDetails({ pkg }: PackageDetailsProps) {
  if (!pkg) {
    return <div>Package not found.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{pkg.description}</h1>
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-semibold">Duration:</p>
            <p><Duration minutes={pkg.duration} /></p>
          </div>
          <div>
            <p className="font-semibold">Price per Student:</p>
            <p>€{pkg.price_per_student}</p>
          </div>
          <div>
            <p className="font-semibold">Student Capacity:</p>
            <p>{pkg.capacity_students}</p>
          </div>
          <div>
            <p className="font-semibold">Kite Capacity:</p>
            <p>{pkg.capacity_kites}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
