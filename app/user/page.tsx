"use client";

import Image from "next/image";
import { useUserWallet } from "@/provider/UserWalletProvider";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PWAInstallButton, usePWAInstallation } from "@/components/PWAInstallButton";
import { Download, Smartphone, Monitor } from "lucide-react";

export default function UserPage() {
  const { user, loading } = useUserWallet();
  const { isInstalled, canInstall } = usePWAInstallation();

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
        ) : canInstall ? (
          // Can be installed
          <div className="bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-200 rounded-lg p-6 text-center dark:from-sky-900/20 dark:to-blue-900/20 dark:border-sky-800">
            <div className="flex items-center justify-center mb-4">
              <Image
                src="/logo-tkh.png"
                width={80}
                height={80}
                alt="Tarifa Kite Hostel"
                className="rounded-2xl shadow-lg"
              />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Download the Mobile Web App
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              <span className="text-lg font-bold text-sky-600 dark:text-sky-400 font-mono">Download</span> Tarifa Kite Hostel on your mobile device with offline access and home screen installation
            </p>

            <div className="space-y-3">
              <PWAInstallButton
                className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white py-3 px-6 rounded-lg font-semibold shadow-lg transform hover:scale-105 transition-all duration-200"
                showInstructions={true}
              />

              <div className="grid grid-cols-2 gap-3 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center justify-center space-x-1">
                  <Smartphone className="w-4 h-4" />
                  <span>Works on Mobile</span>
                </div>
                <div className="flex items-center justify-center space-x-1">
                  <Monitor className="w-4 h-4" />
                  <span>Works on Desktop</span>
                </div>
              </div>
            </div>

            <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              <p>✓ Offline access</p>
              <p>✓ Push notifications</p>
              <p>✓ Native app experience</p>
            </div>
          </div>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}
