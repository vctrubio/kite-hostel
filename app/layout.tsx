import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "sonner";
import { UserWalletProvider } from "@/provider/UserWalletProvider";
import { createClient } from "@/lib/supabase/server";
import { RouteNav } from "@/components/RouteNav";

import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Kite Hostel",
  description: "Tarifa Kite Hostel Management App",
  icons: "/logo-tkh.png",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log("dev:User in RootLayout:", user);
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={"antialiased"}>
        <UserWalletProvider initialUser={user}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Analytics />
            {/* <UserNav /> */}
            <RouteNav />
            {children}
            <Toaster position="top-left" />
          </ThemeProvider>
        </UserWalletProvider>
      </body>
    </html>
  );
}
