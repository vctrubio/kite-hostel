import { getTeachers } from "@/actions/teacher-actions";
import { KiteForm } from "@/components/forms/KiteForm";

export default async function KiteFormPage() {
  const { data: teachers } = await getTeachers();
  return <KiteForm teachers={teachers} />;
}