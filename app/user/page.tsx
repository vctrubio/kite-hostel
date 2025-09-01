"use client";

import Image from "next/image";
import { useUserWallet } from "@/provider/UserWalletProvider";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useState } from 'react';

export default function UserPage() {
  // State to show manual install instructions
  const [showInstructions, setShowInstructions] = useState(false);
  const handleInstall = () => {
    // For iOS/Safari manual install
    setShowInstructions(true);
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
      {/* Manual install instructions for iOS */}
      {showInstructions && (
        <div className="mt-4 mx-auto max-w-sm p-4 bg-white border border-gray-200 rounded-lg text-center text-sm text-gray-700 shadow">
          <button
            onClick={() => setShowInstructions(false)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
          <p>To install on your device:</p>
          <ol className="list-decimal list-inside text-left mt-2">
            <li>Tap the browser’s <strong>Share</strong> icon</li>
            <li>Select <strong>Add to Home Screen</strong></li>
          </ol>
        </div>
      )}
    </div>
  );
}
