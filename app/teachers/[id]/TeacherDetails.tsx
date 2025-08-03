"use client";

import { InferSelectModel } from "drizzle-orm";
import { Teacher, Commission, Lesson, TeacherKite, Payment, Kite } from "@/drizzle/migrations/schema";

interface TeacherDetailsProps {
  teacher: InferSelectModel<typeof Teacher> & {
    commissions: InferSelectModel<typeof Commission>[];
    lessons: InferSelectModel<typeof Lesson>[];
    kites: (InferSelectModel<typeof TeacherKite> & { kite: InferSelectModel<typeof Kite> })[];
    payments: InferSelectModel<typeof Payment>[];
  };
}

export function TeacherDetails({ teacher }: TeacherDetailsProps) {
  if (!teacher) {
    return <div>Teacher not found.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{teacher.name}</h1>
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-semibold">Languages:</p>
            <p>{teacher.languages.join(", ")}</p>
          </div>
          <div>
            <p className="font-semibold">Passport Number:</p>
            <p>{teacher.passport_number}</p>
          </div>
          <div>
            <p className="font-semibold">Country:</p>
            <p>{teacher.country}</p>
          </div>
          <div>
            <p className="font-semibold">Phone:</p>
            <p>{teacher.phone}</p>
          </div>
        </div>

        <h2 className="text-xl font-bold mt-8 mb-4">Commissions</h2>
        {teacher.commissions.length > 0 ? (
          <ul className="list-disc pl-5">
            {teacher.commissions.map((commission) => (
              <li key={commission.id}>
                Price per hour: {commission.price_per_hour}€, Description: {commission.desc || 'N/A'}
              </li>
            ))}
          </ul>
        ) : (
          <p>No commissions found.</p>
        )}

        

        <h2 className="text-xl font-bold mt-8 mb-4">Kites</h2>
        {teacher.kites.length > 0 ? (
          <ul className="list-disc pl-5">
            {teacher.kites.map((teacherKite) => (
              <li key={teacherKite.id}>
                Model: {teacherKite.kite.model}, Size: {teacherKite.kite.size}
              </li>
            ))}
          </ul>
        ) : (
          <p>No kites found.</p>
        )}

        <h2 className="text-xl font-bold mt-8 mb-4">Payments</h2>
        {teacher.payments.length > 0 ? (
          <ul className="list-disc pl-5">
            {teacher.payments.map((payment) => (
              <li key={payment.id}>
                Amount: {payment.amount}€, Created At: {new Date(payment.created_at).toLocaleDateString()}
              </li>
            ))}
          </ul>
        ) : (
          <p>No payments found.</p>
        )}
      </div>
    </div>
  );
}
