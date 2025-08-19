"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { unassignKiteFromTeacher, assignKiteToTeacher } from "@/actions/kite-actions";
import { toast } from "sonner";
import { MultiSelect } from "@/components/ui/multi-select";

interface KiteRowProps {
  kite: {
    id: string;
    model: string;
    size: number;
    serial_id: string;
    events: Array<{ id: string; date: string; duration: number; location: string }> | null;
    assignedTeachers: Array<{ id: string; name: string }>;
  };
  expandedRow: string | null;
  setExpandedRow: (id: string | null) => void;
  allTeachers: Array<{ id: string; name: string }>;
}

export function KiteRow({ kite, expandedRow, setExpandedRow, allTeachers }: KiteRowProps) {
  const isExpanded = expandedRow === kite.id;
  const [selectedTeachersToAssign, setSelectedTeachersToAssign] = useState<string[]>([]);

  const toggleExpand = () => {
    if (isExpanded) {
      setExpandedRow(null);
    } else {
      setExpandedRow(kite.id);
    }
  };

  const handleUnassign = async (teacherId: string) => {
    const result = await unassignKiteFromTeacher(teacherId, kite.id);
    if (result.success) {
      toast.success("Kite unassigned successfully!");
    } else {
      toast.error(result.error || "Failed to unassign kite.");
    }
  };

  const handleAssign = async () => {
    if (selectedTeachersToAssign.length === 0) {
      toast.error("Please select at least one teacher to assign.");
      return;
    }
    const result = await assignKiteToTeacher(selectedTeachersToAssign, kite.id);
    if (result.success) {
      toast.success("Kite assigned successfully!");
      setSelectedTeachersToAssign([]);
    } else {
      toast.error(result.error || "Failed to assign kite.");
    }
  };

  const assignedTeacherIds = new Set(kite.assignedTeachers.map(t => t.id));
  const availableTeachers = allTeachers.filter(teacher => !assignedTeacherIds.has(teacher.id));

  return (
    <>
      <tr className="cursor-pointer hover:bg-gray-50" onClick={toggleExpand}>
        <td className="py-2 px-4 text-left border-b border-gray-200">{kite.model}</td>
        <td className="py-2 px-4 text-left border-b border-gray-200">{kite.size}</td>
        <td className="py-2 px-4 text-left border-b border-gray-200">{kite.serial_id}</td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={3} className="py-2 px-4 border-b border-gray-200">
            <div className="p-2">
              <p className="font-semibold mb-2">Assigned Teachers:</p>
              {kite.assignedTeachers && kite.assignedTeachers.length > 0 ? (
                <ul className="list-disc list-inside space-y-1 mb-4">
                  {kite.assignedTeachers.map((teacher) => (
                    <li key={teacher.id} className="flex justify-between items-center">
                      {teacher.name}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnassign(teacher.id);
                        }}
                      >
                        Unassign
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mb-4">No teachers assigned to this kite.</p>
              )}

              <div className="flex items-center space-x-2 mb-4">
                <MultiSelect
                  options={availableTeachers.map((teacher) => ({
                    label: teacher.name,
                    value: teacher.id,
                  }))}
                  selected={selectedTeachersToAssign}
                  onValueChange={setSelectedTeachersToAssign}
                  placeholder="Select teachers to assign"
                  disabled={availableTeachers.length === 0}
                  className="w-[200px]"
                />
                <Button onClick={handleAssign} disabled={selectedTeachersToAssign.length === 0 || availableTeachers.length === 0}>
                  Assign
                </Button>
              </div>

              <p className="font-semibold mb-2">Events Used In:</p>
              {kite.events && kite.events.length > 0 ? (
                <ul className="list-disc list-inside space-y-1">
                  {kite.events.map((event) => (
                    <li key={event.id}>
                      {format(new Date(event.date), "dd-MM-yy | HH:mm")} - {event.location} ({event.duration} min)
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No events found for this kite.</p>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
