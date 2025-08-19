"use client";

import { useEffect, useState } from "react";
import { PaymentRow } from "./PaymentRow";
import { PaymentForm } from "@/components/forms/PaymentForm";

interface PaymentsTableProps {
  initialPayments: any[];
  teachers: any[];
}

export function PaymentsTable({ initialPayments, teachers }: PaymentsTableProps) {
  const [payments, setPayments] = useState(initialPayments);

  useEffect(() => {
    setPayments(initialPayments);
  }, [initialPayments]);

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 space-y-2 md:space-y-0">
        <h1 className="text-2xl font-bold">Payments</h1>
        <PaymentForm teachers={teachers} />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="py-2 px-4 text-left border-b">Date</th>
              <th className="py-2 px-4 text-left border-b">Teacher</th>
              <th className="py-2 px-4 text-left border-b">Amount (€)</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <PaymentRow key={payment.id} payment={payment} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
