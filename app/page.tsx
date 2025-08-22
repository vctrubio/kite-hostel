
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useUserWallet } from "@/provider/UserWalletProvider";


export default function Home() {
  const { user, loading } = useUserWallet();
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
      <div className="flex flex-col items-center text-center animate-fadeIn space-y-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Hello Development Mode</h1>
          <p className="text-muted-foreground">Quick access to main application areas</p>
        </div>

        <pre className="text-left bg-gray-100 dark:bg-gray-800 rounded p-4 w-full max-w-2xl overflow-x-auto mb-8">
          {loading ? "Loading user wallet..." : JSON.stringify(user, null, 2)}
        </pre>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-2xl">
          <Link
            href="/whiteboard"
            className="p-6 border border-border rounded-lg hover:shadow-md transition-shadow text-center"
          >
            <h2 className="text-xl font-semibold mb-2">Whiteboard</h2>
            <p className="text-sm text-muted-foreground">Daily lesson management</p>
          </Link>

          <Link
            href="/(tables)"
            className="p-6 border border-border rounded-lg hover:shadow-md transition-shadow text-center"
          >
            <h2 className="text-xl font-semibold mb-2">Tables</h2>
            <p className="text-sm text-muted-foreground">Data table views</p>
          </Link>

          <Link
            href="/users"
            className="p-6 border border-border rounded-lg hover:shadow-md transition-shadow text-center"
          >
            <h2 className="text-xl font-semibold mb-2">Users</h2>
            <p className="text-sm text-muted-foreground">User management</p>
          </Link>
        </div>
      </div>
    </main>
  );
}
