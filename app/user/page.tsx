"use client";

import { useUserWallet } from "@/provider/UserWalletProvider";
import Link from "next/link";
import { redirect } from "next/navigation";

export default function UserPage() {
  const { user, loading } = useUserWallet();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-card p-8 rounded-lg shadow-lg text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Loading...
          </h1>
        </div>
      </div>
    );
  }

  if (!user) {
    redirect("/auth/login");
  }

  const userName = user.userAuth.name || user.userAuth.email || "User";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
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
    </div>
  );
}
