import { createClient } from "@/lib/supabase/server";
import React from "react";
import { UserList } from "./UserList";
import { LogoutButtonUserWallet } from "./LogoutButtonUserWallet";
import { NotLoggedInPrompt } from "./NotLoggedInPrompt";

export async function UserWallet() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let userFromAuth = null;
  if (user) {
    const name = user.user_metadata?.full_name || user.user_metadata?.name || null;
    const email = user.email || null;
    const phone = user.phone || null;
    userFromAuth = { name, email, phone };
  }
  console.log("dev:debug : userFromAuth in UserWallet:", userFromAuth);

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
            <p className="text-lg text-muted-foreground">{user.email}</p>
          </div>
        )}
        <UserList />
      </div>
    </div>
  );
}

