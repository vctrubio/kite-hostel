"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { StudentRow } from "./StudentRow";
import { SeedStudentForm } from "@/seed/SeedStudentForm";
import { StatsBar } from "@/components/StatsBar";
import { Button } from "@/components/ui/button";
import { PackageSelectionModal } from "@/components/modals/PackageSelectionModal";
import { getPackages } from "@/actions/package-actions";

interface StudentsTableProps {
  initialStudents: any[];
}

export function StudentsTable({ initialStudents }: StudentsTableProps) {
  const [students, setStudents] = useState(initialStudents);
  const router = useRouter();
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [packages, setPackages] = useState<any[]>([]);

  useEffect(() => {
    setStudents(initialStudents);
  }, [initialStudents]);

  useEffect(() => {
    const fetchPackages = async () => {
      const { data, error } = await getPackages();
      if (data) {
        setPackages(data);
      } else if (error) {
        console.error("Error fetching packages:", error);
      }
    };
    fetchPackages();
  }, []);

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudentIds((prev) => {
      if (prev.includes(studentId)) {
        return prev.filter((id) => id !== studentId);
      } else {
        if (prev.length < 4) {
          return [...prev, studentId];
        } else {
          // Optionally, show a toast or alert here
          return prev;
        }
      }
    });
  };

  const handleCreateBookingClick = () => {
    setIsModalOpen(true);
  };

  const handlePackageSelected = (packageId: string) => {
    router.push(`/bookings/form?studentIds=${selectedStudentIds.join(',')}&packageId=${packageId}`);
  };

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
        <div className="flex items-center gap-4">
          <Button
            onClick={handleCreateBookingClick}
            disabled={selectedStudentIds.length === 0}
          >
            Create Booking ({selectedStudentIds.length})
          </Button>
          <SeedStudentForm />
        </div>
      </div>
      <StatsBar stats={studentStats} />
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="py-2 px-4 text-left"></th>
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
                isSelected={selectedStudentIds.includes(student.id)}
                onSelectStudent={handleSelectStudent}
              />
            ))}
          </tbody>
        </table>
      </div>
      {isModalOpen && (
        <PackageSelectionModal
          packages={packages}
          selectedStudentIds={selectedStudentIds}
          onSelectPackage={handlePackageSelected}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}