"use client";

import React from "react";
import { formatHours } from "@/components/formatters/Duration";
import { BookingIcon, HelmetIcon, BookmarkIcon } from "@/svgs";

type FormType = 'booking' | 'student' | 'package';

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
  selectedLessonTeacherId: string | null;
  selectedLessonCommissionId: string | null;
  teachers: any[];
  activeForm: FormType;
  setActiveForm: (form: FormType) => void;
  stayOnFormAfterSubmit: boolean;
  setStayOnFormAfterSubmit: (stay: boolean) => void;
}

export function BookingFormSummary({
  selectedPackage,
  selectedStudents,
  selectedReference,
  dateRange,
  onSubmit,
  onReset,
  loading,
  onEditSection,
  viaStudentParams,
  selectedLessonTeacherId,
  selectedLessonCommissionId,
  teachers,
  activeForm,
  setActiveForm,
  stayOnFormAfterSubmit,
  setStayOnFormAfterSubmit,
}: BookingSummaryProps) {
  const selectedTeacher = teachers.find(t => t.id === selectedLessonTeacherId);
  const selectedCommission = selectedTeacher?.commissions.find(c => c.id === selectedLessonCommissionId);
  
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

  const getFormIcon = (form: FormType) => {
    switch (form) {
      case 'booking':
        return BookingIcon;
      case 'student':
        return HelmetIcon;
      case 'package':
        return BookmarkIcon;
    }
  };

  const getFormLabel = (form: FormType) => {
    switch (form) {
      case 'booking':
        return 'Booking';
      case 'student':
        return 'Student';
      case 'package':
        return 'Package';
    }
  };

  const getSummaryDescription = () => {
    if (activeForm === 'booking' && viaStudentParams) {
      return `${selectedStudents.length} student(s) pre-selected. Please reset if not accorded.`;
    }
    return null;
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm sticky top-4 z-10">
      <div className="px-4 py-3 border-b border-border">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-muted p-1 rounded-lg mb-3">
          {(['booking', 'student', 'package'] as FormType[]).map((form) => {
            const Icon = getFormIcon(form);
            return (
              <button
                key={form}
                onClick={() => setActiveForm(form)}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all ${
                  activeForm === form
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className={`h-4 w-4 ${
                  form === 'booking' ? 'text-blue-500' :
                  form === 'student' ? 'text-yellow-500' :
                  form === 'package' ? 'text-orange-500' : ''
                }`} />
                {getFormLabel(form)}
              </button>
            );
          })}
        </div>
        {getSummaryDescription() && (
          <p className="text-xs text-muted-foreground">{getSummaryDescription()}</p>
        )}
        
        {(activeForm === 'student' || activeForm === 'package') && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Stay on this form after submit</span>
              <button
                onClick={() => setStayOnFormAfterSubmit(!stayOnFormAfterSubmit)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  stayOnFormAfterSubmit ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    stayOnFormAfterSubmit ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              {stayOnFormAfterSubmit 
                ? `Keep me on the ${activeForm} form after creating` 
                : `Switch to booking form after creating ${activeForm}`
              }
            </p>
          </div>
        )}
      </div>
      
      <div className="p-4 space-y-4">
        {activeForm === 'booking' && (
          <>
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

            {/* Lesson Section - Optional */}
            <div 
              className="cursor-pointer hover:bg-muted rounded-lg p-3 border border-border transition-colors"
              onClick={() => scrollToSection('lesson-section')}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-foreground">Lesson (Optional)</h3>
                <span className="text-xs text-muted-foreground">Click to edit</span>
              </div>
              {selectedTeacher && selectedCommission ? (
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p><span className="font-medium">Teacher:</span> {selectedTeacher.name}</p>
                  <p><span className="font-medium">Commission:</span> €{selectedCommission.price_per_hour.toFixed(0)}/h {selectedCommission.description && `(${selectedCommission.description})`}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No lesson selected</p>
              )}
            </div>
          </>
        )}
        
      </div>

      {activeForm === 'booking' && (
        <div className="p-4 border-t border-border space-y-3">
          <button
            type="button"
            onClick={onSubmit}
            disabled={loading || !selectedPackage || selectedStudents.length !== selectedPackage.capacity_students || !dateRange.startDate}
            className="w-full py-3 px-4 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Creating Booking...' : (selectedTeacher && selectedCommission ? 'Create Booking & Lesson' : 'Create Booking')}
          </button>
          <button
            type="button"
            onClick={onReset}
            className="w-full py-2 px-4 border border-border text-sm font-medium rounded-md text-muted-foreground bg-card hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            Reset Form
          </button>
        </div>
      )}
      
    </div>
  );
}