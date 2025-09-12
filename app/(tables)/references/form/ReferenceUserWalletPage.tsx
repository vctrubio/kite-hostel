"use client";

import { useState } from "react";
import { CreateUserWalletForm } from "@/components/forms/CreateUserWalletForm";
import { UpdateUserWalletForm } from "@/components/forms/UpdateUserWalletForm";
import { UserSelectionPanel } from "@/components/users/UserSelectionPanel";

interface UserWalletInfo {
  id: string;
  pk: string | null;
  sk: string;
  role: string;
  note: string | null;
  teacher_name: string | null;
  sk_email: string | null;
  sk_full_name: string | null;
}

interface ReferenceUserWalletPageProps {
  initialPks: { id: string; name: string }[];
  initialSks: { id: string; email: string; full_name?: string }[];
  initialUsers: any[];
  initialUserWallets: UserWalletInfo[];
}

export default function ReferenceUserWalletPage({
  initialPks,
  initialSks,
  initialUsers,
  initialUserWallets,
}: ReferenceUserWalletPageProps) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserWallet, setSelectedUserWallet] = useState<UserWalletInfo | null>(null);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">User Reference Management</h1>
        <p className="text-muted-foreground">Select an existing user to update or create a new user wallet reference</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <UserSelectionPanel 
          users={initialUsers} 
          availableSks={initialSks}
          userWallets={initialUserWallets}
          onUserSelect={setSelectedUserId}
          onUserWalletSelect={setSelectedUserWallet}
        />

        <div className="space-y-6">
          <CreateUserWalletForm
            availablePks={initialPks}
            availableSks={initialSks}
            initialSk={selectedUserId}
          />

          <UpdateUserWalletForm
            availablePks={initialPks}
            availableSks={initialSks}
            userWallet={selectedUserWallet}
          />
        </div>
      </div>
    </div>
  );
}