"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

export function NotLoggedInPrompt() {
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
          redirectTo: process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/auth/confirm` : `${window.location.origin}/auth/confirm`,
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
    <div className="flex flex-col items-center gap-4 text-center">
      <p className="text-2xl font-bold text-primary">Hey,</p>
      <p className="text-base text-muted-foreground">
        Noticed youre not a member yet.
      </p>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button
        type="button"
        variant="outline"
        className="w-full max-w-xs transition-all duration-300 hover:scale-105"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
      >
        {isLoading ? "Signing up..." : "Sign Up with Google"}
      </Button>
    </div>
  );
}
