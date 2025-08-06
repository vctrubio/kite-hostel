"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { StudentRow } from "./StudentRow";
import { SeedStudentForm } from "@/seed/SeedStudentForm";
import { StatsBar } from "@/components/StatsBar";

interface StudentsTableProps {
  initialStudents: any[];
}

export function StudentsTable({ initialStudents }: StudentsTableProps) {
  const [students, setStudents] = useState(initialStudents);
  const router = useRouter();
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  useEffect(() => {
    setStudents(initialStudents);
  }, [initialStudents]);

  const totalStudents = students.length;
  const localStudents = students.filter(s => s.country === "Spain").length;
  const foreignStudents = totalStudents - localStudents;

  const studentStats = [
    { value: totalStudents, description: "Total Students" },
    { value: localStudents, description: "Local Students (Spain)" },
    { value: foreignStudents, description: "Foreign Students" },
  ];

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Students</h1>
        <SeedStudentForm />
      </div>
      <StatsBar stats={studentStats} />
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="py-2 px-4 text-left">Created At</th>
              <th className="py-2 px-4 text-left">Name</th>
              <th className="py-2 px-4 text-left">Description</th>
              <th className="py-2 px-4 text-left">Total Bookings</th>
              <th className="py-2 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <StudentRow
                key={student.id}
                student={student}
                expandedRow={expandedRow}
                setExpandedRow={setExpandedRow}
                isAvailable={student.isAvailable}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}