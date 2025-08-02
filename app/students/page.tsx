import { getStudents } from "@/actions/getters";
import { StudentsTable } from "./StudentsTable";

export default async function StudentsPage() {
  const { data: initialStudents } = await getStudents();

  return (
    <StudentsTable initialStudents={initialStudents} />
  );
}
