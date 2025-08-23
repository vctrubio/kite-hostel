"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
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
  const [newCommissionRate, setNewCommissionRate] = useState<string>("");
  const [newCommissionDesc, setNewCommissionDesc] = useState<string>("");
  const [showNewCommissionForm, setShowNewCommissionForm] = useState(false);

  const selectedTeacher = teachers.find((t) => t.id === selectedTeacherId);

  const handleCreateNewCommission = async () => {
    if (!selectedTeacherId) {
      toast.error("Please select a teacher first.");
      return;
    }
    const rate = parseInt(newCommissionRate);
    if (isNaN(rate) || rate < 1 || rate >= 100) {
      toast.error("Commission rate must be a whole number between 1 and 99.");
      return;
    }

    const result = await createCommission({
      teacher_id: selectedTeacherId,
      rate: rate,
      description: newCommissionDesc || null,
    });

    if (result.success) {
      toast.success("New commission created successfully!");
      onSelectCommission(result.commissionId || null); // Select the newly created commission
      setNewCommissionRate("");
      setNewCommissionDesc("");
      setShowNewCommissionForm(false);
    } else {
      toast.error(result.error || "Failed to create new commission.");
    }
  };

  return (
    <div className="space-y-4">
      {/* Teacher Selection */}
      <div className="overflow-x-auto">
        <h3 className="text-md font-semibold mb-2">Select Teacher</h3>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
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
                  onSelectCommission(null); // Clear commission when teacher changes
                  setShowNewCommissionForm(false);
                }}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {teacher.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {teacher.languages.join(", ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Commission Selection / Creation */}
      {selectedTeacher && (
        <div className="space-y-3">
          <h3 className="text-md font-semibold mb-2">
            Select Commission for {selectedTeacher.name}
          </h3>
          {selectedTeacher.commissions.length > 0 ? (
            <div className="grid grid-cols-1 gap-2">
              {selectedTeacher.commissions.map((commission) => (
                <Button
                  key={commission.id}
                  variant="outline"
                  onClick={() => onSelectCommission(commission.id)}
                  className={`justify-start ${selectedCommissionId === commission.id ? 'border-green-500' : ''}`}
                >
                  €{commission.price_per_hour.toFixed(0)}/h {commission.desc && `- ${commission.desc}`}
                </Button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No commissions available for this teacher.
            </p>
          )}

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
