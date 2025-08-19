import { getStudents } from "@/actions/student-actions";
import { StudentsTable } from "./StudentsTable";

export default async function StudentsPage() {
  const { data: initialStudents } = await getStudents();

  return (
    <StudentsTable initialStudents={initialStudents} />
  );
}
