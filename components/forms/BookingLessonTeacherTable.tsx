"use client";

import React from "react";
import { CommissionForm } from "@/components/forms/CommissionForm";

interface Teacher {
  id: string;
  name: string;
  commissions: {
    id: string;
    price_per_hour: number;
    desc: string | null;
  }[];
}

interface BookingLessonTeacherTableProps {
  teachers: Teacher[];
  selectedTeacherId: string | null;
  selectedCommissionId: string | null;
  onSelectTeacher: (teacherId: string | null) => void;
  onSelectCommission: (commissionId: string | null) => void;
  onCommissionCreated?: () => void;
}

export function BookingLessonTeacherTable({
  teachers,
  selectedTeacherId,
  selectedCommissionId,
  onSelectTeacher,
  onSelectCommission,
  onCommissionCreated,
}: BookingLessonTeacherTableProps) {
  const selectedTeacher = teachers.find((t) => t.id === selectedTeacherId);

  return (
    <div className="space-y-4">
      {/* Teacher Selection */}
      <div className="overflow-x-auto">
        <h3 className="text-md font-semibold mb-2">Select Teacher</h3>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Languages
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {teachers.map((teacher) => (
              <tr
                key={teacher.id}
                className={`cursor-pointer hover:bg-gray-100 ${selectedTeacherId === teacher.id ? "bg-blue-100" : ""}`}
                onClick={() => {
                  onSelectTeacher(
                    selectedTeacherId === teacher.id ? null : teacher.id,
                  );
                  onSelectCommission(null);
                }}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {teacher.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {teacher.languages?.join(", ") || "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Commission Selection */}
      {selectedTeacher && (
        <div className="space-y-3">
          <h3 className="text-md font-semibold mb-2">
            Select Commission for {selectedTeacher.name}
          </h3>
          {selectedTeacher.commissions.length > 0 ? (
            <div className="grid grid-cols-1 gap-2">
              {selectedTeacher.commissions.map((commission) => (
                <button
                  key={commission.id}
                  onClick={() => onSelectCommission(commission.id)}
                  className={`justify-start text-left p-3 border rounded-md hover:bg-gray-50 transition-colors ${
                    selectedCommissionId === commission.id 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-200'
                  }`}
                >
                  <div className="font-medium">€{commission.price_per_hour}/h</div>
                  {commission.desc && (
                    <div className="text-sm text-gray-500 mt-1">{commission.desc}</div>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No commissions available for this teacher.
            </p>
          )}
        </div>
      )}

      {/* Commission Creation Form */}
      {selectedTeacher && (
        <div className="border-t pt-4">
          <CommissionForm
            teacherId={selectedTeacher.id}
            onCommissionCreated={(commissionId) => {
              onSelectCommission(commissionId);
              if (onCommissionCreated) {
                onCommissionCreated();
              }
            }}
          />
        </div>
      )}
    </div>
  );
}
