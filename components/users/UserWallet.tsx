import { createClient } from "@/lib/supabase/server";
import React from "react";

export async function UserWallet() {
  // Placeholder for user info, replace with real user data as needed

  const supabase = createClient();
  const user = await supabase.auth.getUser();
  console.log("dev:debug : user in UserWallet:", user);

  return (
    <div className="p-4 rounded border flex flex-col gap-1">
      <div className="font-bold">Who am I?</div>
    </div>
  );
}
