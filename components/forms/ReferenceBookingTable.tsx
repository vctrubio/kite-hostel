"use client";

import React from "react";

interface UserWallet {
  id: string;
  role: string;
  pk: string | null;
  teacher_name: string | null;
}

interface ReferenceBookingTableProps {
  userWallets: UserWallet[];
  onSelectReference: (referenceId: string) => void;
  selectedReferenceId: string | null;
}

export function ReferenceBookingTable({
  userWallets,
  onSelectReference,
  selectedReferenceId,
}: ReferenceBookingTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Role
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              PK (Teacher Name)
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Note
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {userWallets.map((wallet) => (
            <tr
              key={wallet.id}
              className={`cursor-pointer hover:bg-gray-100 ${selectedReferenceId === wallet.id ? 'bg-blue-100' : ''}`}
              onClick={() => onSelectReference(selectedReferenceId === wallet.id ? null : wallet.id)}
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {wallet.role}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {wallet.teacher_name || "N/A"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {wallet.note || "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
