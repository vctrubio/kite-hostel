import { getStudentById } from "@/actions/student-actions";
import { StudentDetails } from "./StudentDetails";
import { languagesEnum } from "@/drizzle/migrations/schema";

export default async function StudentPage({ params }: { params: { id: string } }) {
  const { data: student } = await getStudentById(params.id);

  if (!student) {
    return <div>Student not found.</div>;
  }

  return (
    <StudentDetails student={student} availableLanguages={languagesEnum.enumValues} />
  );
}