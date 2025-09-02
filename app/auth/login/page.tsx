"use client";

import { useUserWallet } from "@/provider/UserWalletProvider";
import Link from "next/link";
import { GoogleOnlyLoginForm } from "../../../components/supabase-init/google-only-login-form";
import { useState, useEffect } from "react";

export default function LoginPage() {
  const { user, loading } = useUserWallet();
  const [showUserInfo, setShowUserInfo] = useState(false);

  useEffect(() => {
    // Only change the view after loading is complete
    if (!loading) {
      setShowUserInfo(!!user);
    }
  }, [user, loading]);

  const UserInfo = () => {
    // This component will only be rendered when showUserInfo is true, so user should exist.
    if (!user) return null;
    const userName = user.userAuth.name || user.userAuth.email || "User";
    return (
      <div className="bg-card p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-3xl font-bold text-foreground mb-4">
          Hello, {userName}!
        </h1>
        <p className="text-muted-foreground mb-6">
          Thank you for sigining up, you are free to leave
        </p>
        <p className="text-muted-foreground mb-6">
          Your role is: {user.role}
        </p>
        <nav className="text-sm">
          <Link href="/" className="text-primary hover:underline">
            ← Back to Main
          </Link>
        </nav>
      </div>
    );
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="relative w-full max-w-sm h-96 flex items-center justify-center">
        {/* Login Form Container */}
        <div
          className={`w-full transition-opacity duration-500 ease-in-out absolute top-0 left-0 ${ 
            showUserInfo ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <GoogleOnlyLoginForm />
        </div>

        {/* User Info Container */}
        <div
          className={`w-full transition-opacity duration-500 ease-in-out absolute top-0 left-0 ${ 
            showUserInfo ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <UserInfo />
        </div>
      </div>
    </div>
  );
}
