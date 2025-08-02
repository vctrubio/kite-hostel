import { getStudentById } from "@/actions/getters";
import { StudentDetails } from "./StudentDetails";

export default async function StudentPage({ params }: { params: { id: string } }) {
  const { data: student } = await getStudentById(params.id);

  if (!student) {
    return <div>Student not found.</div>;
  }

  return (
    <StudentDetails student={student} />
  );
}