"use client";

import { MiniGoogleSignInButton } from "@/components/supabase-init/GoogleSignInButton";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useState } from "react";
import Image from "next/image";

export function GoogleOnlyLoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/confirm`,
        },
      });
      if (error) throw error;
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden border-0 shadow-lg">
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2"></div>
        <CardHeader className="flex flex-col items-center justify-center py-6">
          <div className="w-40 h-40 relative mb-3">
            <Image
              src="/logo-tkh.png"
              alt="Tarifa Kite Hostel"
              fill
              className="object-contain"
              priority
            />
          </div>
          <h2 className="text-xl mt-2 text-center font-['Dancing_Script'] font-cursive italic">Welcome to Tarifa Kite Hostel</h2>
        </CardHeader>
        <CardContent className="pt-0 pb-8 px-8">
          <div className="flex flex-col items-center gap-5">
            
            <MiniGoogleSignInButton
              onClick={handleGoogleSignIn}
              isLoading={isLoading}
              className="w-full"
            />
            
            {error && (
              <p className="text-sm text-red-500 text-center mt-1">{error}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
