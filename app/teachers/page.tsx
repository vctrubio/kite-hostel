import { getTeachers } from "@/actions/getters";
import { TeachersTable } from "./TeachersTable";

export default async function TeachersPage() {
  const { data: initialTeachers } = await getTeachers();

  return (
    <TeachersTable initialTeachers={initialTeachers} />
  );
}