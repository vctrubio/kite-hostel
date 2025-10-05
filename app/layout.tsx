import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0ea5e9",
};

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Tarifa Kite Hostel",
  description:
    "A full comprehensive kite school manangement app, synchronized and automated so you don't have to waste time on administrative tasks.",
  manifest: "/manifest.json",
  // Open Graph metadata for WhatsApp, Facebook, LinkedIn
  openGraph: {
    type: "website",
    locale: "en_US",
    url: defaultUrl,
    title: "Tarifa Kite Hostel",
    description:
      "A full comprehensive kite school manangement app, synchronized and automated so you don't have to waste time on administrative tasks.",
    siteName: "Tarifa Kite Hostel",
    images: [
      {
        url: "/logo-tkh.png",
        width: 1200,
        height: 630,
        alt: "Tarifa Kite Hostel Logo",
      },
    ],
  },
  // Twitter Card metadata
  twitter: {
    card: "summary_large_image",
    title: "Tarifa Kite Hostel",
    description:
      "A full comprehensive kite school manangement app, synchronized and automated so you don't have to waste time on administrative tasks.",
    images: ["/logo-tkh.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Kite Hostel",
    startupImage: ["/icons/icon-192x192.png"],
  },
  icons: {
    icon: [
      { url: "/logo-tkh.png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/logo-tkh.png" },
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/logo-tkh.png",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Kite Hostel",
    "application-name": "Kite Hostel",
    "msapplication-TileColor": "#0ea5e9",
    "msapplication-config": "none",
  },
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
            <RouteNav />
            {children}
            <Toaster position="top-left" />
          </ThemeProvider>
        </UserWalletProvider>
      </body>
    </html>
  );
}
