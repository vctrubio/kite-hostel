"use client";

import React, { useState, useEffect } from "react";

import { useSearchParams } from 'next/navigation';
import { DatePicker, DateRange } from "@/components/pickers/date-picker";
import { BookingPackageTable } from "@/components/forms/BookingPackageTable";
import { BookingStudentTable } from "@/components/forms/BookingStudentTable";
import { BookingReferenceTable } from "@/components/forms/BookingReferenceTable";
import { BookingSummary } from "@/components/forms/BookingSummary";
import { createBooking, availableStudent4Booking } from "@/actions/booking-actions";
import { toast } from "sonner";



export default function BookingForm({ packages, students, userWallets }) {
  const searchParams = useSearchParams();
  const studentId = searchParams.get('studentId');

  const [selectedPackageId, setSelectedPackageId] = useState("");
  const [selectedPackageCapacity, setSelectedPackageCapacity] = useState(0);
  const [dateRange, setDateRange] = useState<DateRange>({ startDate: "", endDate: "" });
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>(studentId ? [studentId] : []);
  const [selectedReferenceId, setSelectedReferenceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [availableStudents, setAvailableStudents] = useState<Set<string>>(new Set(students.filter(s => s.isAvailable).map(s => s.id)));
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['dates-section', 'package-section', 'students-section', 'reference-section'])
  );

  useEffect(() => {
    if (selectedPackageId) {
      const selectedPkg = packages.find((pkg: any) => pkg.id === selectedPackageId);
      if (selectedPkg) {
        setSelectedPackageCapacity(selectedPkg.capacity_students);
        setSelectedStudentIds([]);
      }
    } else {
      setSelectedPackageCapacity(0);
      setSelectedStudentIds([]);
    }
  }, [selectedPackageId, packages]);


  const handleStudentChange = (studentId: string) => {
    setSelectedStudentIds((prevSelected) => {
      let newSelectedIds;
      if (prevSelected.includes(studentId)) {
        newSelectedIds = prevSelected.filter((id) => id !== studentId);
      } else {
        if (prevSelected.length < selectedPackageCapacity) {
          newSelectedIds = [...prevSelected, studentId];
        } else {
          toast.error(`You can only select up to ${selectedPackageCapacity} students for this package.`);
          newSelectedIds = prevSelected;
        }
      }

      if (newSelectedIds.length >= selectedPackageCapacity) {
        setExpandedSections(prev => {
          const newSet = new Set(prev);
          newSet.delete('students-section');
          return newSet;
        });
      }

      return newSelectedIds;
    });
  };

  const handleEditSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const handlePackageChange = (packageId: string) => {
    setSelectedPackageId(packageId);
    if (packageId) {
      setExpandedSections(prev => {
        const newSet = new Set(prev);
        newSet.delete('package-section');
        return newSet;
      });
    }
  };

  const handleDatesChange = (newDateRange: DateRange) => {
    setDateRange(newDateRange);
  };

  const handleReferenceChange = (referenceId: string | null) => {
    setSelectedReferenceId(referenceId);
    if (referenceId) {
      setExpandedSections(prev => {
        const newSet = new Set(prev);
        newSet.delete('reference-section');
        return newSet;
      });
    }
  };

  const handleSubmit = async () => {
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
      // Reset form and reopen sections
      setSelectedPackageId("");
      setDateRange({ startDate: "", endDate: "" });
      setSelectedStudentIds([]);
      setSelectedReferenceId(null);
      setExpandedSections(new Set(['dates-section', 'package-section', 'students-section', 'reference-section']));
    } else {
      toast.error(result.error || "Failed to create booking.");
    }
    setLoading(false);
  };

  const handleReset = () => {
    setSelectedPackageId("");
    setDateRange({ startDate: "", endDate: "" });
    setSelectedStudentIds([]);
    setSelectedReferenceId(null);
    setExpandedSections(new Set(['dates-section', 'package-section', 'students-section', 'reference-section']));
  };

  const selectedPackage = packages.find((pkg: any) => pkg.id === selectedPackageId);
  const selectedStudentsList = students.filter((student: any) => selectedStudentIds.includes(student.id));
  const selectedReference = userWallets.find((wallet: any) => wallet.id === selectedReferenceId);

  return (
    <div className="min-h-screen bg-background">
      <div className="lg:grid lg:grid-cols-5 lg:gap-6 max-w-7xl mx-auto">
        {/* Summary Sidebar */}
        <div className="lg:col-span-2 order-2 lg:order-1">
          <div className="lg:sticky lg:top-4 p-4">
            <BookingSummary
              selectedPackage={selectedPackage}
              selectedStudents={selectedStudentsList}
              selectedReference={selectedReference}
              dateRange={dateRange}
              onSubmit={handleSubmit}
              onReset={handleReset}
              loading={loading}
              onEditSection={handleEditSection}
            />
          </div>
        </div>

        {/* Form Content */}
        <div className="lg:col-span-3 order-1 lg:order-2">
          <div className="bg-card">
            <div className="px-4 py-6 border-b border-border">
              <h1 className="text-2xl font-semibold text-foreground">Create New Booking</h1>
            </div>
            
            <div className="p-4 space-y-6">
              {/* Dates Section - First */}
              <div id="dates-section" className="scroll-mt-4">
                <div 
                  className="flex items-center justify-between cursor-pointer p-3 rounded-lg hover:bg-muted"
                  onClick={() => handleEditSection('dates-section')}
                >
                  <h2 className="text-lg font-semibold text-foreground">Booking Dates</h2>
                  <span className="text-sm text-muted-foreground">
                    {expandedSections.has('dates-section') ? '−' : '+'}
                  </span>
                </div>
                {expandedSections.has('dates-section') && (
                  <div className="mt-3">
                    <DatePicker dateRange={dateRange} setDateRange={handleDatesChange} />
                  </div>
                )}
              </div>

              {/* Package Section - Second */}
              <div id="package-section" className="scroll-mt-4">
                <div 
                  className="flex items-center justify-between cursor-pointer p-3 rounded-lg hover:bg-muted"
                  onClick={() => handleEditSection('package-section')}
                >
                  <h2 className="text-lg font-semibold text-foreground">Select Package</h2>
                  <span className="text-sm text-muted-foreground">
                    {expandedSections.has('package-section') ? '−' : '+'}
                  </span>
                </div>
                {expandedSections.has('package-section') && (
                  <div className="mt-3">
                    <BookingPackageTable
                      packages={packages}
                      onSelectPackage={handlePackageChange}
                      selectedPackageId={selectedPackageId}
                    />
                  </div>
                )}
              </div>

              {/* Students Section - Third */}
              <div id="students-section" className="scroll-mt-4">
                <div 
                  className="flex items-center justify-between cursor-pointer p-3 rounded-lg hover:bg-muted"
                  onClick={() => handleEditSection('students-section')}
                >
                  <h2 className="text-lg font-semibold text-foreground">
                    Select Students <span className="text-sm font-normal text-muted-foreground">(Max: {selectedPackageCapacity})</span>
                  </h2>
                  <span className="text-sm text-muted-foreground">
                    {expandedSections.has('students-section') ? '−' : '+'}
                  </span>
                </div>
                {expandedSections.has('students-section') && (
                  <div className="mt-3">
                    <BookingStudentTable
                      students={students}
                      selectedStudentIds={selectedStudentIds}
                      onSelectStudent={handleStudentChange}
                      packageCapacity={selectedPackageCapacity}
                      availableStudents={availableStudents}
                    />
                  </div>
                )}
              </div>

              {/* Reference Section - Fourth */}
              <div id="reference-section" className="scroll-mt-4">
                <div 
                  className="flex items-center justify-between cursor-pointer p-3 rounded-lg hover:bg-muted"
                  onClick={() => handleEditSection('reference-section')}
                >
                  <h2 className="text-lg font-semibold text-foreground">Select Reference</h2>
                  <span className="text-sm text-muted-foreground">
                    {expandedSections.has('reference-section') ? '−' : '+'}
                  </span>
                </div>
                {expandedSections.has('reference-section') && (
                  <div className="mt-3">
                    <BookingReferenceTable
                      userWallets={userWallets}
                      onSelectReference={handleReferenceChange}
                      selectedReferenceId={selectedReferenceId}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}