import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserWallet } from "@/actions/user-actions";
import { GuestLogin } from "@/app/GuestLogin";
import { Shield } from "lucide-react";
import { HeadsetIcon } from "@/svgs";
import { ENTITY_DATA } from "@/lib/constants";
import Image from "next/image";
import { NorthAdminDiagram } from "@/components/banners/NorthAdminDiagram";

function PrimaryRoutes({ role }: { role: string }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Link
        href="/billboard"
        className={`block p-6 rounded-xl hover:shadow-lg transition-all duration-300 ${
          role === "admin" || role === "teacherAdmin"
            ? "border-2 border-primary hover:ring-2 hover:ring-primary/50 bg-accent/30 glow-teal"
            : "border border-border hover:shadow-md bg-card hover-teal-border"
        }`}
      >
        <div className="flex items-center gap-4">
          <Shield className="h-8 w-8 text-foreground" />
          <div>
            <h3 className="text-xl font-bold text-foreground">Billboard</h3>
            <p className="text-sm text-muted-foreground">
              Main admin dashboard
            </p>
          </div>
        </div>
      </Link>

      <Link
        href="/teacher"
        className={`block p-6 rounded-xl hover:shadow-lg transition-all duration-300 ${
          role === "teacher" || role === "teacherAdmin"
            ? "border-2 border-primary hover:ring-2 hover:ring-primary/50 bg-accent/30 glow-teal"
            : "border border-border hover:shadow-md bg-card hover-teal-border"
        }`}
      >
        <div className="flex items-center gap-4">
          <HeadsetIcon className="h-8 w-8 text-foreground" />
          <div>
            <h3 className="text-xl font-bold text-foreground">Teacher</h3>
            <p className="text-sm text-muted-foreground">
              Teacher portal & hours
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
}

function EntityManagement() {
  return (
    <div className="mt-6 pt-4 border-t border-border">
      <h3 className="text-sm font-semibold text-muted-foreground mb-3">
        Entity Management
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {ENTITY_DATA.map((entity) => {
          const EntityIcon = entity.icon;
          // Extract the color from entity.color (e.g., "text-yellow-500" -> "yellow-500")
          const colorName = entity.color.replace("text-", "");
          const borderColor = `border-${colorName}`;
          // Get the base color for entity shadow (e.g., "yellow-500" -> "yellow")
          const baseColor = colorName.split("-")[0];
          const entityShadowClass = `entity-${baseColor}`;

          return (
            <Link
              key={entity.name}
              href={entity.link}
              className={`flex items-center gap-2 p-3 bg-card rounded-lg shadow-sm border ${borderColor} entity-card ${entityShadowClass}`}
            >
              <EntityIcon className={`h-4 w-4 ${entity.color}`} />
              <span className="text-sm font-medium text-foreground">
                {entity.name}s
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function GuestBanner({ role }: { role: string }) {
  if (role !== "guest") return null;

  return (
    <div className="mb-8 p-4 border-2 border-primary bg-accent/30 rounded-xl shadow-md glow-teal">
      <p className="text-primary font-semibold mb-2">👋 Guest Access</p>
      <p className="text-sm text-accent-foreground">
        You have guest privileges. Check out the invitation page!
      </p>
    </div>
  );
}

function Footer() {
  return (
    <footer className="mt-12 text-center space-y-3">
      <Link
        href="/user"
        className="block text-sm text-primary hover:text-primary/80 transition-colors underline font-medium"
      >
        Go to User Page
      </Link>
      <Link
        href="/docs"
        className="block text-sm text-muted-foreground hover:text-foreground transition-colors underline"
      >
        Read the Docs
      </Link>
    </footer>
  );
}

export default async function WelcomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // No authenticated user - show login with docs link
  if (!user) {
    return <GuestLogin />;
  }

  // Get user wallet data
  const { role } = await getCurrentUserWallet();
  const name =
    user.user_metadata?.full_name || user.user_metadata?.name || user.email;

  // Authenticated user with role - show menu
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-8">
      <div className="w-full max-w-2xl text-center">
        <Image
          src="/logo-tkh.png"
          alt="Tarifa Kite Hostel Logo"
          width={120}
          height={120}
          className="mx-auto mb-8"
        />

        <h1 className="text-3xl font-bold mb-2">Welcome, {name}</h1>
        <p className="text-muted-foreground mb-8">Choose your destination</p>

        <GuestBanner role={role} />

        <div className="grid gap-4 max-w-4xl">
          <PrimaryRoutes role={role} />
          <EntityManagement />
        </div>
      </div>

      <NorthAdminDiagram />
      {/* <UserStatus role={role} name={name} /> */}
      <Footer />
    </main>
  );
}
