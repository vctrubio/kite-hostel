import { getPaymentsWithTeacher } from "@/actions/payment-actions";
import { getTeachers } from "@/actions/teacher-actions";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { PaymentRow } from "@/components/tables-tmp/PaymentRow";

export default async function PaymentsPage() {
  const { data: payments, error: paymentsError } = await getPaymentsWithTeacher();
  const { data: teachers, error: teachersError } = await getTeachers();

  if (paymentsError) {
    return <div className="container mx-auto p-4">Error loading payments: {paymentsError}</div>;
  }

  if (teachersError) {
    return <div className="container mx-auto p-4">Error loading teachers: {teachersError}</div>;
  }

  // Calculate stats based on all payments
  const totalPayments = payments?.length || 0;
  const totalAmount = payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
  
  // Calculate top 3 teachers by payment amounts
  const teacherPayments = (teachers || []).map(teacher => {
    const teacherPaymentsSum = payments?.filter(p => p.teacher.name === teacher.name)
      .reduce((sum, p) => sum + p.amount, 0) || 0;
    return { ...teacher, totalPaid: teacherPaymentsSum };
  }).sort((a, b) => b.totalPaid - a.totalPaid);

  const top3Teachers = teacherPayments.slice(0, 3);
  const avgPayment = totalPayments > 0 ? Math.round(totalAmount / totalPayments) : 0;

  const stats = [
    {
      description: "Total Payments Made",
      value: `€${totalAmount}`,
      subStats: [
        { label: "Number of Payments", value: totalPayments },
        { label: "Average Payment", value: `€${avgPayment}` },
      ],
    },
    {
      description: "Top Teachers",
      value: top3Teachers.length > 0 ? top3Teachers[0].name : "None",
      subStats: top3Teachers.slice(0, 3).map((teacher, index) => ({
        label: `${index + 1}. ${teacher.name}`,
        value: `€${teacher.totalPaid}`,
      })),
    },
  ];

  return (
    <Dashboard
      entityName="Payment"
      stats={stats}
      rowComponent={PaymentRow}
      data={payments || []}
      isFilterRangeSelected={true}
      isDropdown={true}
      formProps={{ teachers: teachers || [] }}
    />
  );
}
