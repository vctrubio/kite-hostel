import { getTeacherById } from "@/actions/teacher-actions";
import { TeacherDetails } from "./TeacherDetails";

export default async function TeacherPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const { data: teacher } = await getTeacherById(id);

  if (!teacher) {
    return <div>Teacher not found.</div>;
  }

  return (
    <TeacherDetails teacher={teacher} />
  );
}