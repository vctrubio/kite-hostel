"use client";

import { DateSince } from "@/components/formatters/DateSince";
import { PaymentIcon } from "@/svgs/PaymentIcon";
import { type TeacherPortalData } from "@/actions/teacher-actions";

interface TeacherPaymentCardProps {
  payment: TeacherPortalData["payments"][0];
}

export default function TeacherPaymentCard({ payment }: TeacherPaymentCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <PaymentIcon className="w-5 h-5 text-yellow-600" />
            <div className="text-lg font-bold">
              €{payment.amount}
            </div>
          </div>
          <div className="text-right">
            <DateSince dateString={payment.created_at} />
          </div>
        </div>
      </div>
    </div>
  );
}