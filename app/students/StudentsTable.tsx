"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SeedStudentForm } from "@/seed/SeedStudentForm";

interface StudentsTableProps {
  initialStudents: any[];
}

export function StudentsTable({ initialStudents }: StudentsTableProps) {
  const [students, setStudents] = useState(initialStudents);
  const router = useRouter();

  // Update students state when initialStudents prop changes (due to revalidation)
  useEffect(() => {
    setStudents(initialStudents);
  }, [initialStudents]);

  const handleRowClick = (id: string) => {
    router.push(`/students/${id}`);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Students</h1>
      <SeedStudentForm />
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="py-2 px-4">Name</th>
              <th className="py-2 px-4">Languages</th>
              <th className="py-2 px-4">Passport Number</th>
              <th className="py-2 px-4">Country</th>
              <th className="py-2 px-4">Phone</th>
              <th className="py-2 px-4">Size</th>
              <th className="py-2 px-4">Description</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr
                key={student.id}
                onClick={() => handleRowClick(student.id)}
                className="cursor-pointer"
              >
                <td className="py-2 px-4">{student.name}</td>
                <td className="py-2 px-4">
                  {student.languages.join(", ")}
                </td>
                <td className="py-2 px-4">
                  {student.passport_number}
                </td>
                <td className="py-2 px-4">{student.country}</td>
                <td className="py-2 px-4">{student.phone}</td>
                <td className="py-2 px-4">{student.size}</td>
                <td className="py-2 px-4">{student.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}