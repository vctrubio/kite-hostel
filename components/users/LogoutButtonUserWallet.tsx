"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function LogoutButtonUserWallet() {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("You have been logged out.");
    router.refresh();
  };

  return (
    <Button variant="ghost" size="icon" onClick={handleSignOut} className="ml-2">
      <LogOut className="h-5 w-5" />
    </Button>
  );
}