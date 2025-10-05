"use client";

import Image from "next/image";
import { useUserWallet } from "@/provider/UserWalletProvider";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PWAInstallButton, usePWAInstallation } from "@/components/PWAInstallButton";
import { Smartphone, Monitor, Book } from "lucide-react";

export default function UserPage() {
  const { user, loading } = useUserWallet();
  const { isInstalled } = usePWAInstallation();

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
        <nav className="text-sm space-y-4">
          <div>
            <Link href="/" className="text-primary hover:underline">
              ← Back to Main
            </Link>
          </div>
          <div>
            <Link href="/docs" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors underline">
              <Book className="h-4 w-4" />
              Read the docs
            </Link>
          </div>
        </nav>
      </div>

      {/* PWA Installation Section */}
      <div className="mt-8 w-full max-w-md">
        {isInstalled ? (
          // Already installed
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center dark:bg-green-900/20 dark:border-green-800">
            <div className="flex items-center justify-center mb-3">
              <div className="bg-green-100 rounded-full p-3 dark:bg-green-800">
                <Monitor className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
              App Installed!
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300">
              Tarifa Kite Hostel is now installed on your device. You can access it from your home screen.
            </p>
          </div>
        ) : (
          // Show installation option
          <div className="bg-accent/30 border border-border rounded-lg p-6 text-center card-premium">
            <div className="flex items-center justify-center mb-4">
              <Image
                src="/logo-tkh.png"
                width={80}
                height={80}
                alt="Tarifa Kite Hostel"
                className="rounded-2xl shadow-lg"
              />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              Download the Mobile Web App
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              <span className="text-lg font-bold text-primary font-mono">Download</span> Tarifa Kite Hostel on your mobile device
            </p>

            <div className="space-y-3">
              <PWAInstallButton
                className="w-full py-3 px-3 rounded-lg font-semibold transform hover:scale-105 transition-all duration-200"
                showInstructions={true}
              />

              <div className="flex items-center justify-center space-x-1 text-xs text-muted-foreground">
                <Smartphone className="w-4 h-4" />
                <span>Works on Mobile</span>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
