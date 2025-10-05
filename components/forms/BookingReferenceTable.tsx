"use client";

import React from "react";

interface UserWallet {
  id: string;
  role: string;
  pk: string | null;
  teacher_name: string | null;
  note?: string | null;
}

interface ReferenceBookingTableProps {
  userWallets: UserWallet[];
  onSelectReference: (referenceId: string) => void;
  selectedReferenceId: string | null;
}

export function BookingReferenceTable({
  userWallets,
  onSelectReference,
  selectedReferenceId,
}: ReferenceBookingTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-muted/50">
          <tr>
            <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-foreground uppercase tracking-wide">
              Role
            </th>
            <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-foreground uppercase tracking-wide">
              Name
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-card">
          {userWallets.map((wallet) => (
            <tr
              key={wallet.id}
              className={`cursor-pointer transition-all duration-200 ${
                selectedReferenceId === wallet.id 
                  ? 'bg-primary/10 hover:bg-primary/15 border-l-4 border-l-primary' 
                  : 'hover:bg-muted/30'
              }`}
              onClick={() => onSelectReference(selectedReferenceId === wallet.id ? null : wallet.id)}
            >
              <td className="px-6 py-4 text-sm font-semibold text-foreground">
                <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                  {wallet.role}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-foreground">
                {(wallet.role === "teacher" || wallet.role === "teacherAdmin") 
                  ? (wallet.teacher_name || "N/A")
                  : (wallet.note || "N/A")
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
