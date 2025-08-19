"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SeedTeacherForm } from "@/seed/SeedTeacherForm";
import { StatsBar } from "@/components/StatsBar";
import { TeacherRow } from "./TeacherRow";

interface TeachersTableProps {
  initialTeachers: any[];
}

export function TeachersTable({ initialTeachers }: TeachersTableProps) {
  const [teachers, setTeachers] = useState(initialTeachers);
  const router = useRouter();
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  useEffect(() => {
    setTeachers(initialTeachers);
  }, [initialTeachers]);

  const totalTeachers = teachers.length;
  const localTeachers = teachers.filter(t => t.country === "Spain").length;
  const foreignTeachers = totalTeachers - localTeachers;

  const teacherStats = [
    { value: totalTeachers, description: "Total Teachers" },
    { value: localTeachers, description: "Local Teachers (Spain)" },
    { value: foreignTeachers, description: "Foreign Teachers" },
  ];

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Teachers</h1>
        <SeedTeacherForm />
      </div>
      <StatsBar stats={teacherStats} />
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="py-2 px-4 text-left">Created At</th>
              <th className="py-2 px-4 text-left">Name</th>
              <th className="py-2 px-4 text-left">Phone</th>
              <th className="py-2 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((teacher) => (
              <TeacherRow
                key={teacher.id}
                teacher={teacher}
                expandedRow={expandedRow}
                setExpandedRow={setExpandedRow}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
