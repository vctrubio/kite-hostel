"use client";

import React from "react";
import { BookingPackageTable } from "@/components/forms/BookingPackageTable";
import { Button } from "@/components/ui/button";

interface PackageSelectionModalProps {
  packages: any[];
  selectedStudentIds: string[];
  onSelectPackage: (packageId: string) => void;
  onClose: () => void;
}

export function PackageSelectionModal({
  packages,
  selectedStudentIds,
  onSelectPackage,
  onClose,
}: PackageSelectionModalProps) {
  const [tempSelectedPackageId, setTempSelectedPackageId] = React.useState("");

  const handleConfirm = () => {
    onSelectPackage(tempSelectedPackageId);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Select a Package for {selectedStudentIds.length} Student(s)</h2>
        <p className="text-sm text-muted-foreground mb-4">Only packages suitable for {selectedStudentIds.length} student(s) are shown.</p>
        
        <BookingPackageTable
          packages={packages}
          onSelectPackage={setTempSelectedPackageId}
          selectedPackageId={tempSelectedPackageId}
          viaStudentParams={true}
          selectedStudentIds={selectedStudentIds}
        />

        <div className="mt-6 flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!tempSelectedPackageId}>
            Confirm Selection
          </Button>
        </div>
      </div>
    </div>
  );
}
