"use client";

import React, { useState, useEffect } from "react";
import { DatePicker, DateRange } from "@/components/pickers/date-picker";
import { PackageBookingTable } from "@/components/forms/PackageBookingTable";
import { StudentBookingTable } from "@/components/forms/StudentBookingTable";
import { ReferenceBookingTable } from "@/components/forms/ReferenceBookingTable";
import { createBooking } from "@/actions/booking-actions";
import { toast } from "sonner";

export default function BookingForm({ packages, students, userWallets }) {
  const [selectedPackageId, setSelectedPackageId] = useState("");
  const [selectedPackageCapacity, setSelectedPackageCapacity] = useState(0);
  const [dateRange, setDateRange] = useState<DateRange>({ startDate: "", endDate: "" });
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [selectedReferenceId, setSelectedReferenceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedPackageId) {
      const selectedPkg = packages.find((pkg: any) => pkg.id === selectedPackageId);
      if (selectedPkg) {
        setSelectedPackageCapacity(selectedPkg.capacity_students);
        // Clear selected students when a new package is selected
        setSelectedStudentIds([]);
      }
    } else {
      setSelectedPackageCapacity(0);
      setSelectedStudentIds([]);
    }
  }, [selectedPackageId, packages]);

  const handlePackageChange = (packageId: string) => {
    setSelectedPackageId(packageId);
  };

  const handleStudentChange = (studentId: string) => {
    setSelectedStudentIds((prevSelected) => {
      if (prevSelected.includes(studentId)) {
        return prevSelected.filter((id) => id !== studentId);
      } else {
        if (prevSelected.length < selectedPackageCapacity) {
          return [...prevSelected, studentId];
        } else {
          toast.error(`You can only select up to ${selectedPackageCapacity} students for this package.`);
          return prevSelected;
        }
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!selectedPackageId) {
      toast.error("Please select a package.");
      setLoading(false);
      return;
    }

    if (!dateRange.startDate || !dateRange.endDate) {
      toast.error("Please select booking dates.");
      setLoading(false);
      return;
    }

    if (selectedStudentIds.length === 0) {
      toast.error("Please select at least one student.");
      setLoading(false);
      return;
    }

    const result = await createBooking({
      package_id: selectedPackageId,
      date_start: dateRange.startDate,
      date_end: dateRange.endDate,
      student_ids: selectedStudentIds,
      reference_id: selectedReferenceId,
    });

    if (result.success) {
      toast.success("Booking created successfully!");
      // Optionally reset form
      setSelectedPackageId("");
      setDateRange({ startDate: "", endDate: "" });
      setSelectedStudentIds([]);
      setSelectedReferenceId(null);
    } else {
      toast.error(result.error || "Failed to create booking.");
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create New Booking</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <h2 className="text-xl font-bold mb-2">Select a Package</h2>
          <PackageBookingTable
            packages={packages}
            onSelectPackage={handlePackageChange}
            selectedPackageId={selectedPackageId}
          />
        </div>

        <div>
          <h2 className="text-xl font-bold mb-2">Select Reference</h2>
          <ReferenceBookingTable
            userWallets={userWallets}
            onSelectReference={setSelectedReferenceId}
            selectedReferenceId={selectedReferenceId}
          />
        </div>
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
            Booking Dates
          </label>
          <DatePicker dateRange={dateRange} setDateRange={setDateRange} />
        </div>
        {selectedPackageId && (
          <div>
            <label htmlFor="students" className="block text-sm font-medium text-gray-700">
              Select Students (Max: {selectedPackageCapacity})
            </label>
            <StudentBookingTable
              students={students}
              selectedStudentIds={selectedStudentIds}
              onSelectStudent={handleStudentChange}
              packageCapacity={selectedPackageCapacity}
            />
          </div>
        )}
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Create Booking
        </button>
      </form>
    </div>
  );
}