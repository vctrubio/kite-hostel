"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SeedTeacherForm } from "@/seed/SeedTeacherForm";

interface TeachersTableProps {
  initialTeachers: any[];
}

export function TeachersTable({ initialTeachers }: TeachersTableProps) {
  const [teachers, setTeachers] = useState(initialTeachers);
  const router = useRouter();

  useEffect(() => {
    setTeachers(initialTeachers);
  }, [initialTeachers]);

  const handleRowClick = (id: string) => {
    router.push(`/teachers/${id}`);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Teachers</h1>
      <SeedTeacherForm />
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="py-2 px-4">Name</th>
              <th className="py-2 px-4">Languages</th>
              <th className="py-2 px-4">Passport Number</th>
              <th className="py-2 px-4">Country</th>
              <th className="py-2 px-4">Phone</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((teacher) => (
              <tr
                key={teacher.id}
                onClick={() => handleRowClick(teacher.id)}
                className="cursor-pointer"
              >
                <td className="py-2 px-4">{teacher.name}</td>
                <td className="py-2 px-4">
                  {teacher.languages.join(", ")}
                </td>
                <td className="py-2 px-4">
                  {teacher.passport_number}
                </td>
                <td className="py-2 px-4">{teacher.country}</td>
                <td className="py-2 px-4">{teacher.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
