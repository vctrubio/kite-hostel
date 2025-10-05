"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Send, CreditCard } from "lucide-react";
import { DateSince } from "@/components/formatters/DateSince";
import { getStatusColors, type LessonStatus, ENTITY_DATA } from "@/lib/constants";
import { LessonCountWithEvent } from "@/getters/lesson-formatters";
import { DropdownExpandableRow } from "./DropdownExpandableRow";


interface TeacherRowProps {
  data: any & {
    lessonCount?: number;
    eventCount?: number;
    totalEventMinutes?: number;
    activeLessonCount?: number;
    isActive?: boolean;
    balance?: number;
    lessonsByStatus?: {
      planned: number;
      rest: number;
      delegated: number;
      completed: number;
      cancelled: number;
    };
  };
  expandedRow: string | null;
  setExpandedRow: (id: string | null) => void;
}

export function TeacherRow({
  data: teacher,
  expandedRow,
  setExpandedRow,
}: TeacherRowProps) {
  const isExpanded = expandedRow === teacher.id;
  const router = useRouter();

  const teacherEntity = ENTITY_DATA.find(entity => entity.name === "Teacher");
  const lessonEntity = ENTITY_DATA.find(entity => entity.name === "Lesson");

  const toggleExpand = () => {
    if (isExpanded) {
      setExpandedRow(null);
    } else {
      setExpandedRow(teacher.id);
    }
  };

  return (
    <>
      <tr className="border-b border-border">
        <td className="py-2 px-4 text-left">
          <DateSince dateString={teacher.created_at} />
        </td>
        <td className="py-2 px-4 text-left">{teacher.name}</td>
        <td className="py-2 px-4 text-left">
          <LessonCountWithEvent 
            lessonCount={teacher.lessonCount || 0}
            eventCount={teacher.eventCount || 0}
            totalEventMinutes={teacher.totalEventMinutes || 0}
          />
        </td>
        <td className="py-2 px-4 text-left">
          <span className="font-medium">
            €{((teacher.balance || 0) % 1 === 0 
              ? (teacher.balance || 0).toString() 
              : (teacher.balance || 0).toFixed(2))}
          </span>
        </td>
        <td className="py-2 px-4 text-left">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${teacher.isActive
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
              }`}
          >
            {teacher.isActive
              ? `(${teacher.activeLessonCount || 0}) Active`
              : "Inactive"}
          </span>
        </td>
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
                router.push(`/teachers/${teacher.id}`);
              }}
              className="h-8 w-8"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </td>
      </tr>
      <DropdownExpandableRow
        isExpanded={isExpanded}
        colSpan={6}
        sections={[
          {
            title: "Teacher Details",
            icon: teacherEntity?.icon,
            color: teacherEntity?.color || "text-green-500",
            children: (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground min-w-20">Languages:</span>
                  <span className="text-sm font-medium">
                    {teacher.languages?.join(", ") || "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground min-w-16">Country:</span>
                  <span className="text-sm font-medium">{teacher.country || "N/A"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground min-w-16">Passport:</span>
                  <span className="text-sm font-medium">
                    {teacher.passport_number || "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground min-w-12">Phone:</span>
                  <span className="text-sm font-medium">{teacher.phone || "N/A"}</span>
                </div>
              </div>
            )
          },
          ...(teacher.lessonsByStatus ? [{
            title: "Lessons by Status",
            icon: lessonEntity?.icon,
            color: lessonEntity?.color || "text-cyan-500",
            children: (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {Object.entries(teacher.lessonsByStatus).map(([status, count]) => (
                  <div key={status} className="text-sm">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize mr-1 ${getStatusColors(status as LessonStatus)}`}>
                      {status}
                    </span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            )
          }] : []),
          ...(teacher.commissions && teacher.commissions.length > 0 ? [{
            title: "Commissions",
            icon: CreditCard,
            color: "text-gray-600",
            children: (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {teacher.commissions.map((commission: any) => (
                  <div key={commission.id} className="text-sm font-medium">
                    €{commission.price_per_hour}/h{" "}
                    {commission.desc && `- ${commission.desc}`}
                  </div>
                ))}
              </div>
            )
          }] : [])
        ]}
      />
    </>
  );
}
