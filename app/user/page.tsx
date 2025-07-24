import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function UserPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  const userName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email ||
    "User";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="bg-card p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-3xl font-bold text-foreground mb-4">
          Hello, {userName}!
        </h1>
        <p className="text-muted-foreground mb-6">
          Thank you for sigining up, you are free to leave
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
