"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Send } from "lucide-react";
import {
  unassignKiteFromTeacher,
  assignKiteToTeacher,
} from "@/actions/kite-actions";
import { toast } from "sonner";
import { MultiSelect } from "@/components/ui/multi-select";
import { DateSince } from "@/components/formatters/DateSince";

interface KiteRowProps {
  data: {
    id: string;
    model: string;
    size: number;
    serial_id: string;
    created_at: string;
    events: Array<{
      id: string;
      date: string;
      duration: number;
      location: string;
    }> | null;
    assignedTeachers: Array<{ id: string; name: string }>;
  };
  expandedRow: string | null;
  setExpandedRow: (id: string | null) => void;
  teachers?: Array<{ id: string; name: string }>;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
}

export function KiteRow({
  data: kite,
  expandedRow,
  setExpandedRow,
  teachers = [],
}: KiteRowProps) {
  const isExpanded = expandedRow === kite.id;
  const router = useRouter();
  const [selectedTeachersToAssign, setSelectedTeachersToAssign] = useState<
    string[]
  >([]);

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

  const assignedTeacherIds = new Set(kite.assignedTeachers.map((t) => t.id));
  const availableTeachers = teachers.filter(
    (teacher) => !assignedTeacherIds.has(teacher.id),
  );

  return (
    <>
      <tr className="border-b border-border">
        <td className="py-2 px-4 text-left">
          <DateSince dateString={kite.created_at} />
        </td>
        <td className="py-2 px-4 text-left">{kite.model}</td>
        <td className="py-2 px-4 text-left">{kite.size}m</td>
        <td className="py-2 px-4 text-left">{kite.serial_id}</td>
        <td className="py-2 px-4 text-left">
          {kite.assignedTeachers?.length || 0}
        </td>
        <td className="py-2 px-4 text-left">{kite.events?.length || 0}</td>
        <td className="py-2 px-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleExpand}
              className="h-8 w-8"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/kites/${kite.id}`);
              }}
              className="h-8 w-8"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={7} className="py-4 px-4 bg-background/30">
            <div className="w-full space-y-3">
              <div className="flex items-center gap-4 w-full p-3 bg-background/50 rounded-md border-l-4 border-purple-500">
                <div className="w-full">
                  <p className="font-semibold mb-2">Assigned Teachers:</p>
                  {kite.assignedTeachers && kite.assignedTeachers.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1 mb-4">
                      {kite.assignedTeachers.map((teacher) => (
                        <li
                          key={teacher.id}
                          className="flex justify-between items-center"
                        >
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
                    <Button
                      onClick={handleAssign}
                      disabled={
                        selectedTeachersToAssign.length === 0 ||
                        availableTeachers.length === 0
                      }
                    >
                      Assign
                    </Button>
                  </div>

                  <p className="font-semibold mb-2">Events Used In:</p>
                  {kite.events && kite.events.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1">
                      {kite.events.map((event) => (
                        <li key={event.id}>
                          {format(new Date(event.date), "dd-MM-yy | HH:mm")} -{" "}
                          {event.location} ({event.duration} min)
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No events found for this kite.</p>
                  )}
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
