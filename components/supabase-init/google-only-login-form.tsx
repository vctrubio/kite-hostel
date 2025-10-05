"use client";

import { MiniGoogleSignInButton } from "@/components/supabase-init/GoogleSignInButton";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";

export function GoogleOnlyLoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const supabase = createClient();
  const { theme, resolvedTheme } = useTheme();
  
  // Prevent hydration mismatch by only using theme after mount
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Use resolvedTheme as fallback and only after mounted
  const isDarkMode = mounted ? (theme === "dark" || resolvedTheme === "dark") : false;

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

  // Don't render theme-dependent content until mounted to prevent hydration issues
  if (!mounted) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card className="overflow-hidden border-0 shadow-lg">
          <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
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
            <h2 className="text-2xl mt-2 text-center font-['Dancing_Script'] font-cursive italic">
              Welcome to{" "}
              <span className="not-italic text-cyan-600">
                tarifa
              </span>
              .
              <span className="font-bold not-italic">
                north-club
              </span>
              <span className="not-italic">.com</span>
            </h2>
          </CardHeader>
          <CardContent className="pt-0 pb-8 px-8">
            <div className="flex flex-col items-center gap-5">
              <MiniGoogleSignInButton
                onClick={handleGoogleSignIn}
                isLoading={isLoading}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden border-0 shadow-lg">
        <div className={`h-2 ${
          isDarkMode 
            ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
            : 'bg-gradient-to-r from-blue-500 to-cyan-500'
        }`}></div>
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
          <h2 className="text-2xl mt-2 text-center font-['Dancing_Script'] font-cursive italic">
            Welcome to{" "}
            <span className={`not-italic ${
              isDarkMode
                ? 'text-green-400'
                : 'text-cyan-600'
            }`}>
              tarifa
            </span>
            .
            <span className={`font-bold not-italic ${
              isDarkMode ? 'text-white' : 'text-black'
            }`}>
              north-club
            </span>
            <span className="not-italic">.com</span>
          </h2>
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
