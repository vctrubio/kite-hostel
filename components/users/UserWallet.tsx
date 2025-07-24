import { createClient } from "@/lib/supabase/server";
import React from "react";
import Link from "next/link";
import { UserList } from "./UserList";
import { Button } from "@/components/ui/button";

export async function UserWallet() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;
  console.log("dev:debug : user in UserWallet:", user);

  return (
    <div className="p-4 rounded-lg border border-border bg-card text-card-foreground shadow-sm flex flex-col gap-6">
      {!user ? (
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-2xl font-bold text-primary">Hey,</p>
          <p className="text-base text-muted-foreground">
            Noticed your not a member yet.
          </p>
          <Button
            asChild
            size="lg"
            className="w-full max-w-xs /* Add animation/hovering styles here */"
          >
            <Link href="/auth/sign-up">Sign Up Now</Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <p className="text-xl font-bold text-foreground">Welcome back!</p>
          <p className="text-lg text-muted-foreground">{user.email}</p>
        </div>
      )}
      <UserList />
    </div>
  );
}
