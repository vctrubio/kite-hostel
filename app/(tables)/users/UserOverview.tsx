"use client";

import { useState } from "react";
import { UserCard } from "@/components/cards/User";
import { CreateUserWalletForm } from "@/components/forms/CreateUserWalletForm";

interface UserOverviewProps {
  userWallets: any[];
  usersData: any;
  allTeachers: any[];
  availableSks: any[];
  availablePks: any[];
}

export function UserOverview({
  userWallets,
  usersData, // Keep for debug display if needed, but not for unassignedAuthUsers calculation
  allTeachers,
  availableSks,
  availablePks,
}: UserOverviewProps) {
  const [selectedSkForForm, setSelectedSkForForm] = useState<string | null>(null);

  const handleSelectSk = (skId: string) => {
    setSelectedSkForForm(skId);
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">User Management Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* User Wallets Section */}
        <section className="border border-gray-200 rounded-lg shadow-sm p-6 bg-white">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Existing User Wallets</h2>
          <div className="space-y-4">
            {userWallets.length > 0 ? (
              userWallets.map((wallet: any) => (
                <UserCard
                  key={wallet.id}
                  id={wallet.id}
                  role={wallet.role}
                  teacher_name={wallet.teacher_name}
                  sk_full_name={wallet.sk_full_name}
                  sk_email={wallet.sk_email}
                  note={wallet.note}
                />
              ))
            ) : (
              <p className="text-gray-500">No user wallets found.</p>
            )}
          </div>
        </section>

        {/* Available Users & Create Form Section */}
        <section className="border border-gray-200 rounded-lg shadow-sm p-6 bg-white">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Create New User Wallet</h2>
          <CreateUserWalletForm
            allTeachers={allTeachers}
            availableSks={availableSks}
            availablePks={availablePks}
            initialSk={selectedSkForForm}
          />

          <h2 className="text-2xl font-semibold text-gray-700 mt-8 mb-4">Available Auth Users (for SK assignment)</h2>
          <div className="space-y-2">
            {availableSks.length > 0 ? (
              availableSks.map((user: any) => (
                <div
                  key={user.id}
                  className="p-3 border border-gray-100 rounded-md bg-gray-50 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSelectSk(user.id)}
                >
                  <p className="font-medium text-gray-800">{user.full_name}: {user.email}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">All available auth users have an SK assigned or no auth users found.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
