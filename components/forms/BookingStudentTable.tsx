"use client";

import React, { useState } from "react";

interface Student {
  id: string;
  name: string;
  last_name: string | null;
  languages: string[];
  desc: string;
  created_at?: string;
}

interface StudentBookingTableProps {
  students: Student[];
  selectedStudentIds: string[];
  onSelectStudent: (studentId: string) => void;
  packageCapacity: number;
  availableStudents: Set<string>;
}

export function BookingStudentTable({
  students,
  selectedStudentIds,
  onSelectStudent,
  packageCapacity,
  availableStudents,
}: StudentBookingTableProps) {
  const [filter, setFilter] = useState<'available' | 'all'>('available');

  const sortedStudents = [...students].sort((a, b) => {
    const dateA = new Date(a.created_at || '').getTime();
    const dateB = new Date(b.created_at || '').getTime();
    return dateB - dateA;
  });

  const filteredStudents = filter === 'available' 
    ? sortedStudents.filter(student => availableStudents.has(student.id))
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
          onClick={() => setFilter('all')}
          className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${
            filter === 'all'
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border'
          }`}
        >
          All ({students.length})
        </button>
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
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                    availableStudents.has(student.id) 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                  }`}>
                    {availableStudents.has(student.id) ? 'Available' : 'Unavailable'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
