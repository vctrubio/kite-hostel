"use client";

import React from "react";
import { UserList } from "./UserList";
import { LogoutButtonUserWallet } from "./LogoutButtonUserWallet";
import { NotLoggedInPrompt } from "./NotLoggedInPrompt";
import { useUserWallet } from "@/provider/UserWalletProvider";

export function UserWallet() {
  const { user, loading } = useUserWallet();

  if (loading) {
    return (
      <div className="relative w-full max-w-md mx-auto bg-gradient-to-br from-primary/10 to-background rounded-2xl shadow-xl p-6 border border-primary/20 overflow-hidden transform transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl">
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col gap-6">
          <div className="flex items-center justify-center">
            <p className="text-lg text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  console.log("dev:debug : user in UserWallet:", user);

  return (
    <div className="relative w-full max-w-md mx-auto bg-gradient-to-br from-primary/10 to-background rounded-2xl shadow-xl p-6 border border-primary/20 overflow-hidden transform transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl">
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
      <div className="relative z-10 flex flex-col gap-6">
        {!user ? (
          <NotLoggedInPrompt />
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-xl font-bold text-foreground">Welcome back!</p>
              <LogoutButtonUserWallet />
            </div>
            <p className="text-lg text-muted-foreground">{user.userAuth.email}</p>
            {user.userAuth.name && (
              <p className="text-sm text-muted-foreground">{user.userAuth.name}</p>
            )}
            <p className="text-xs text-muted-foreground">Role: {user.role}</p>
            <p className="text-xs text-muted-foreground">
              SK: {user.wallet.sk}
            </p>
            <p className="text-xs text-muted-foreground">
              PK: {user.wallet.pk || "Not generated yet"}
            </p>
          </div>
        )}
        <UserList />
      </div>
    </div>
  );
}

