import { getTeacherById } from "@/actions/teacher-actions";
import { TeacherDetails } from "./TeacherDetails";

export default async function TeacherPage({ params }: { params: { id: string } }) {
  const { data: teacher } = await getTeacherById(params.id);

  if (!teacher) {
    return <div>Teacher not found.</div>;
  }

  return (
    <TeacherDetails teacher={teacher} />
  );
}