import { getTeachers } from "@/actions/teacher-actions";
import { TeachersTable } from "../../../components/tables-tmp/TeachersTable";

export default async function TeachersPage() {
  const { data: initialTeachers } = await getTeachers();

  return (
    <TeachersTable initialTeachers={initialTeachers} />
  );
}