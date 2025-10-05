"use client";

import React from "react";
import { CommissionForm } from "@/components/forms/CommissionForm";

interface Teacher {
  id: string;
  name: string;
  languages?: string[];
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
    <div className="space-y-6">
      {/* Teacher Selection */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground uppercase tracking-wide">
                Teacher Name
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground uppercase tracking-wide">
                Languages
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {teachers.length === 0 ? (
              <tr>
                <td
                  colSpan={2}
                  className="px-6 py-8 text-center text-sm text-muted-foreground"
                >
                  No available teachers
                </td>
              </tr>
            ) : (
              teachers.map((teacher) => (
                <tr
                  key={teacher.id}
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedTeacherId === teacher.id 
                      ? 'bg-primary/10 hover:bg-primary/15 border-l-4 border-l-primary' 
                      : 'hover:bg-muted/30'
                  }`}
                  onClick={() => {
                    onSelectTeacher(
                      selectedTeacherId === teacher.id ? null : teacher.id,
                    );
                    onSelectCommission(null);
                  }}
                >
                  <td className="px-6 py-4 text-sm font-semibold text-foreground">
                    {teacher.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {teacher.languages?.join(", ") || "N/A"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Commission Selection */}
      {selectedTeacher && (
        <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            Select Commission for <span className="text-primary">{selectedTeacher.name}</span>
          </h3>
          {selectedTeacher.commissions.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {selectedTeacher.commissions.map((commission) => (
                <button
                  key={commission.id}
                  onClick={() => onSelectCommission(commission.id)}
                  className={`justify-start text-left p-4 border rounded-lg transition-all duration-200 ${
                    selectedCommissionId === commission.id
                      ? "border-green-600 bg-green-100 dark:bg-green-900/20 shadow-md border-l-4"
                      : "border-border bg-card hover:bg-muted/50 hover:border-primary/50 hover:shadow-md"
                  }`}
                >
                  <div className="font-bold text-lg text-primary">
                    €{commission.price_per_hour}/h
                  </div>
                  {commission.desc && (
                    <div className="text-sm text-muted-foreground mt-1">
                      {commission.desc}
                    </div>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground bg-card p-4 rounded-lg border border-border">
              No commissions available for this teacher.
            </p>
          )}
        </div>
      )}

      {/* Commission Creation Form */}
      {selectedTeacher && (
        <div className="border-t border-border pt-6">
          <div className="bg-card p-4 rounded-lg border border-border">
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
        </div>
      )}
    </div>
  );
}
