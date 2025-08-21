import { getTeachers } from "@/actions/teacher-actions";
import { PaymentForm } from "@/components/forms/PaymentForm";

export default async function PaymentFormPage() {
  const { data: teachers } = await getTeachers();

  return <PaymentForm teachers={teachers || []} />;
}