import { getStudentById } from "@/actions/student-actions";
import { StudentDetails } from "./StudentDetails";
import { languagesEnum } from "@/drizzle/migrations/schema";

export default async function StudentPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const { data: student } = await getStudentById(id);

  if (!student) {
    return <div>Student not found.</div>;
  }

  return (
    <StudentDetails student={student} availableLanguages={languagesEnum.enumValues} />
  );
}