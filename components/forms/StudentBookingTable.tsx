"use client";

import React from "react";

interface Student {
  id: string;
  name: string;
  languages: string[];
  desc: string;
}

interface StudentBookingTableProps {
  students: Student[];
  selectedStudentIds: string[];
  onSelectStudent: (studentId: string) => void;
  packageCapacity: number;
}

export function StudentBookingTable({
  students,
  selectedStudentIds,
  onSelectStudent,
  packageCapacity,
}: StudentBookingTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Languages
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Desc
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {students.map((student) => (
            <tr
              key={student.id}
              className={`cursor-pointer hover:bg-gray-100 ${selectedStudentIds.includes(student.id) ? 'bg-green-100' : ''}`}
              onClick={() => {
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
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {student.languages.join(", ")}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {student.desc}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
