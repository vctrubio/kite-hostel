"use client";

import React from "react";
import { formatHours } from "@/components/formatters/Duration";

interface BookingSummaryProps {
  selectedPackage: any;
  selectedStudents: any[];
  selectedReference: any;
  dateRange: { startDate: string; endDate: string };
  onSubmit: () => void;
  onReset: () => void;
  loading: boolean;
  onEditSection: (section: string) => void;
  viaStudentParams?: boolean;
}

export function BookingSummary({
  selectedPackage,
  selectedStudents,
  selectedReference,
  dateRange,
  onSubmit,
  onReset,
  loading,
  onEditSection,
  viaStudentParams,
}: BookingSummaryProps) {
  const getDaysDifference = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    onEditSection(sectionId);
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm sticky top-4 z-10">
      <div className="px-4 py-3 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Booking Summary</h2>
        {viaStudentParams && (
          <p className="text-xs text-muted-foreground">{selectedStudents.length} student(s) pre-selected. Please reset if not accorded.</p>
        )}
      </div>
      
      <div className="p-4 space-y-4">
        {/* Dates Section - First */}
        <div 
          className="cursor-pointer hover:bg-muted rounded-lg p-3 border border-border transition-colors"
          onClick={() => scrollToSection('dates-section')}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-foreground">Booking Period</h3>
            <span className="text-xs text-muted-foreground">Click to edit</span>
          </div>
          {dateRange.startDate && dateRange.endDate ? (
            <div className="space-y-1 text-sm text-muted-foreground">
              <p><span className="font-medium">Start:</span> {new Date(dateRange.startDate).toLocaleDateString()}</p>
              <p><span className="font-medium">Duration:</span> {getDaysDifference(dateRange.startDate, dateRange.endDate)} days</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">No dates selected</p>
          )}
        </div>

        {/* Package Section - Second */}
        <div 
          className="cursor-pointer hover:bg-muted rounded-lg p-3 border border-border transition-colors"
          onClick={() => scrollToSection('package-section')}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-foreground">Package</h3>
            <span className="text-xs text-muted-foreground">Click to edit</span>
          </div>
          {selectedPackage ? (
            <div className="space-y-1 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">{selectedPackage.description || 'No description'}</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <p><span className="font-medium">Duration:</span> {formatHours(selectedPackage.duration)}h</p>
                <p><span className="font-medium">Capacity:</span> {selectedPackage.capacity_students}</p>
                <p><span className="font-medium">Price:</span> €{selectedPackage.price_per_student}</p>
                <p><span className="font-medium">Per hour:</span> €{(selectedPackage.price_per_student / (selectedPackage.duration / 60)).toFixed(2)}h</p>
              </div>
              <p className="text-xs"><span className="font-medium">Description:</span> {selectedPackage.description}</p>
              <p className="text-xs"><span className="font-medium">Kites:</span> {selectedPackage.capacity_kites}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">No package selected</p>
          )}
        </div>

        {/* Students Section - Third */}
        <div 
          className="cursor-pointer hover:bg-muted rounded-lg p-3 border border-border transition-colors"
          onClick={() => scrollToSection('students-section')}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-foreground">Students {selectedPackage && `(${selectedStudents.length}/${selectedPackage.capacity_students})`}</h3>
            <span className="text-xs text-muted-foreground">Click to edit</span>
          </div>
          {selectedStudents.length > 0 ? (
            <div className="space-y-1">
              {selectedStudents.slice(0, 3).map((student) => (
                <p key={student.id} className="text-sm text-muted-foreground">{student.name}</p>
              ))}
              {selectedStudents.length > 3 && (
                <p className="text-xs text-muted-foreground">+{selectedStudents.length - 3} more</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">No students selected</p>
          )}
        </div>

        {/* Reference Section - Fourth */}
        <div 
          className="cursor-pointer hover:bg-muted rounded-lg p-3 border border-border transition-colors"
          onClick={() => scrollToSection('reference-section')}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-foreground">Reference</h3>
            <span className="text-xs text-muted-foreground">Click to edit</span>
          </div>
          {selectedReference ? (
            <p className="text-sm text-muted-foreground">{selectedReference.teacher_name || selectedReference.note}</p>
          ) : (
            <p className="text-sm text-muted-foreground italic">No reference selected</p>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-border space-y-3">
        <button
          type="button"
          onClick={onSubmit}
          disabled={loading || !selectedPackage || selectedStudents.length !== selectedPackage.capacity_students || !dateRange.startDate}
          className="w-full py-3 px-4 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Creating Booking...' : 'Create Booking'}
        </button>
        <button
          type="button"
          onClick={onReset}
          className="w-full py-2 px-4 border border-border text-sm font-medium rounded-md text-muted-foreground bg-card hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          Reset Form
        </button>
      </div>
    </div>
  );
}