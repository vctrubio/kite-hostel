"use client";

import Image from "next/image";
import { useUserWallet } from "@/provider/UserWalletProvider";
import Link from "next/link";
import { redirect } from "next/navigation";

export default function UserPage() {
  const handleInstall = () => {
    const promptEvent = (window as any).deferredPrompt;
    if (promptEvent) {
      promptEvent.prompt();
    } else {
      console.log('Install prompt not available');
    }
  };

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
      {/* Always show download button */}
      <button
        onClick={handleInstall}
        className="mt-6 mx-auto flex items-center gap-2 px-4 py-2 border border-gray-400 text-gray-600 rounded hover:bg-gray-100 transform hover:scale-105 transition duration-200"
      >
        <Image src="/logo-tkh.png" width={24} height={24} alt="Install" />
        Download for Home Screen
      </button>
    </div>
  );
}
