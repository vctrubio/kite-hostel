"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Send } from "lucide-react";
import { DateSince } from "@/components/formatters/DateSince";
import { getStatusColors, type LessonStatus } from "@/lib/constants";

// Sub-components for better organization
interface TeacherDetailsProps {
  teacher: any;
}

function TeacherDetailsSection({ teacher }: TeacherDetailsProps) {
  return (
    <div className="flex items-center gap-4 w-full p-3 bg-background/50 rounded-md border-l-4 border-green-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        <div>
          <span className="text-sm text-muted-foreground">Languages: </span>
          <span className="text-sm font-medium">
            {teacher.languages?.join(", ") || "N/A"}
          </span>
        </div>
        <div>
          <span className="text-sm text-muted-foreground">Country: </span>
          <span className="text-sm font-medium">{teacher.country || "N/A"}</span>
        </div>
        <div>
          <span className="text-sm text-muted-foreground">Passport: </span>
          <span className="text-sm font-medium">
            {teacher.passport_number || "N/A"}
          </span>
        </div>
        <div>
          <span className="text-sm text-muted-foreground">Phone: </span>
          <span className="text-sm font-medium">{teacher.phone || "N/A"}</span>
        </div>
      </div>
    </div>
  );
}

interface LessonsByStatusProps {
  lessonsByStatus?: {
    planned: number;
    rest: number;
    delegated: number;
    completed: number;
    cancelled: number;
  };
}

function LessonsByStatusSection({ lessonsByStatus }: LessonsByStatusProps) {
  if (!lessonsByStatus) return null;

  return (
    <div className="p-3 bg-background/50 rounded-md border-l-4 border-orange-500">
      <div className="text-sm text-muted-foreground mb-2">Lessons by Status:</div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {Object.entries(lessonsByStatus).map(([status, count]) => (
          <div key={status} className="text-sm">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize mr-1 ${getStatusColors(status as LessonStatus)}`}>
              {status}
            </span>
            <span className="font-medium">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface CommissionsProps {
  commissions?: any[];
}

function CommissionsSection({ commissions }: CommissionsProps) {
  if (!commissions || commissions.length === 0) return null;

  return (
    <div className="p-3 bg-background/50 rounded-md border-l-4 border-blue-500">
      <div className="text-sm text-muted-foreground mb-2">Commissions:</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {commissions.map((commission: any) => (
          <div key={commission.id} className="text-sm font-medium">
            €{commission.price_per_hour}/h{" "}
            {commission.desc && `- ${commission.desc}`}
          </div>
        ))}
      </div>
    </div>
  );
}

interface TeacherRowProps {
  data: any & {
    lessonCount?: number;
    eventCount?: number;
    totalEventHours?: number;
    activeLessonCount?: number;
    isActive?: boolean;
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
        <td className="py-2 px-4 text-left">{teacher.lessonCount || 0}</td>
        <td className="py-2 px-4 text-left">
          <div className="flex items-center gap-2">
            <span>{teacher.eventCount || 0}</span>
            <span>•</span>
            <span>{teacher.totalEventHours || 0} h</span>
          </div>
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
      {isExpanded && (
        <tr>
          <td colSpan={6} className="py-4 px-4 bg-background/30">
            <div className="w-full space-y-3">
              <TeacherDetailsSection teacher={teacher} />
              <LessonsByStatusSection lessonsByStatus={teacher.lessonsByStatus} />
              <CommissionsSection commissions={teacher.commissions} />
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
