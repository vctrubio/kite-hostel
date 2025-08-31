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
    <div className="overflow-x-auto">
      <div className="mb-4 flex gap-4">
        <button
          onClick={() => setFilter('available')}
          className={`px-4 py-2 rounded border ${
            filter === 'available'
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          Available ({availableStudents.size})
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded border ${
            filter === 'all'
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          All ({students.length})
        </button>
      </div>
      
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              First Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Last Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Languages
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Desc
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {filteredStudents.map((student) => (
            <tr
              key={student.id}
              className={`cursor-pointer hover:bg-gray-100 ${
                selectedStudentIds.includes(student.id) 
                  ? 'bg-green-100' 
                  : !availableStudents.has(student.id) 
                    ? 'bg-red-50 opacity-60' 
                    : ''
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
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {student.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {student.last_name || 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {student.languages.join(", ")}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {student.desc}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {availableStudents.has(student.id) ? 'Available' : 'Unavailable'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
