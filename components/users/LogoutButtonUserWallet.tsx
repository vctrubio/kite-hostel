"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function LogoutButtonUserWallet() {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <Button variant="ghost" size="icon" onClick={handleSignOut} className="ml-2">
      <LogOut className="h-5 w-5" />
    </Button>
  );
}