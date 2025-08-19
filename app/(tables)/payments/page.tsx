import { getPaymentsWithTeacher } from "@/actions/payment-actions";
import { getTeachers } from "@/actions/teacher-actions";
import { PaymentsTable } from "./PaymentsTable";

export default async function PaymentsPage() {
  const { data: initialPayments, error: paymentsError } = await getPaymentsWithTeacher();
  const { data: teachers, error: teachersError } = await getTeachers();

  if (paymentsError) {
    return <div className="container mx-auto p-4">Error loading payments: {paymentsError}</div>;
  }

  if (teachersError) {
    return <div className="container mx-auto p-4">Error loading teachers: {teachersError}</div>;
  }

  return <PaymentsTable initialPayments={initialPayments || []} teachers={teachers || []} />;
}
