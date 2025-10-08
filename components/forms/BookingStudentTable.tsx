"use client";

import React, { useState } from "react";
import { BookingIcon } from "@/svgs/BookingIcon";
import { Clock } from "lucide-react";

interface Student {
  id: string;
  name: string;
  last_name: string | null;
  languages: string[];
  desc: string;
  created_at?: string;
  totalBookings?: number;
  totalEventHours?: number;
}

interface StudentBookingTableProps {
  students: Student[];
  selectedStudentIds: string[];
  onSelectStudent: (studentId: string) => void;
  packageCapacity: number;
  availableStudents: Set<string>;
  onClearStudents: () => void;
}

export function BookingStudentTable({
  students,
  selectedStudentIds,
  onSelectStudent,
  packageCapacity,
  availableStudents,
  onClearStudents,
}: StudentBookingTableProps) {
  const [filter, setFilter] = useState<'available' | 'new' | 'all'>('available');

  const badgeBaseClasses = "inline-flex items-center justify-center min-w-[100px] mx-auto w-full px-3 py-1.5 rounded-full text-xs font-medium";

  const sortedStudents = [...students].sort((a, b) => {
    const dateA = new Date(a.created_at || '').getTime();
    const dateB = new Date(b.created_at || '').getTime();
    return dateB - dateA;
  });

  const newStudents = sortedStudents.filter(student => !student.totalBookings || student.totalBookings === 0);

  const filteredStudents = filter === 'available' 
    ? sortedStudents.filter(student => availableStudents.has(student.id))
    : filter === 'new'
    ? newStudents
    : sortedStudents;
  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <button
          onClick={() => setFilter('available')}
          className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${
            filter === 'available'
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border'
          }`}
        >
          Available ({availableStudents.size})
        </button>
        <button
          onClick={() => setFilter('new')}
          className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${
            filter === 'new'
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border'
          }`}
        >
          New ({newStudents.length})
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${
            filter === 'all'
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border'
          }`}
        >
          All ({students.length})
        </button>
        {selectedStudentIds.length > 0 && (
          <button
            onClick={onClearStudents}
            className="ml-auto px-4 py-2.5 rounded-lg font-medium transition-all duration-200 bg-red-500/10 text-red-600 hover:bg-red-500/20 border border-red-500/30"
          >
            Clear ({selectedStudentIds.length})
          </button>
        )}
      </div>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted/50">
            <tr>
              <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-foreground uppercase tracking-wide">
                First Name
              </th>
              <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-foreground uppercase tracking-wide">
                Last Name
              </th>
              <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-foreground uppercase tracking-wide">
                Languages
              </th>
              <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-foreground uppercase tracking-wide">
                Description
              </th>
              <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-foreground uppercase tracking-wide">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {filteredStudents.map((student) => (
              <tr
                key={student.id}
                className={`cursor-pointer transition-all duration-200 ${
                  selectedStudentIds.includes(student.id) 
                    ? 'bg-green-100 dark:bg-green-900/20 hover:bg-green-200 dark:hover:bg-green-900/30 border-l-4 border-l-green-600' 
                    : !availableStudents.has(student.id) 
                      ? 'bg-red-50 dark:bg-red-900/10 opacity-60 cursor-not-allowed' 
                      : 'hover:bg-muted/30'
                }`}
                onClick={() => {
                  if (!availableStudents.has(student.id)) {
                    alert('This student is not available for booking.');
                    return;
                  }
                  
                  const isSelected = selectedStudentIds.includes(student.id);
                  if (!isSelected && selectedStudentIds.length >= packageCapacity) {
                    alert(`You can only select up to ${packageCapacity} students for this package.`);
                    return;
                  }
                  onSelectStudent(student.id);
                }}
              >
                <td className="px-6 py-4 text-sm font-semibold text-foreground">
                  {student.name}
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-foreground">
                  {student.last_name || 'N/A'}
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {student.languages.join(", ")}
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {student.desc}
                </td>
                <td className="px-6 py-4 text-sm">
                  {!availableStudents.has(student.id) ? (
                    <span className={`${badgeBaseClasses} bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300`}>
                      Unavailable
                    </span>
                  ) : (!student.totalBookings || student.totalBookings === 0) ? (
                    <span className={`${badgeBaseClasses} bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300`}>
                      New
                    </span>
                  ) : (
                    <div className={`${badgeBaseClasses} gap-2 bg-green-100 dark:bg-green-900/30`}>
                      <BookingIcon className="w-3 h-3 text-green-800 dark:text-green-300" />
                      <span className="text-xs font-medium text-green-800 dark:text-green-300">
                        {student.totalBookings}
                      </span>
                      {student.totalEventHours && student.totalEventHours > 0 && (
                        <>
                          <Clock className="w-3 h-3 text-green-800 dark:text-green-300" />
                          <span className="text-xs font-medium text-green-800 dark:text-green-300">
                            {Math.round(student.totalEventHours)}h
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
