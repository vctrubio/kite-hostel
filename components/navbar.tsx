"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeSwitcher } from "@/components/supabase-init/theme-switcher";

const primaryLinks = [
  { href: "/students", label: "Students" },
  { href: "/teachers", label: "Teachers" },
  { href: "/packages", label: "Packages" },
  { href: "/bookings", label: "Bookings" },
  { href: "/lessons", label: "Lessons" },
  { href: "/events", label: "Events" },
  { href: "/kites", label: "Kites" },
];

const secondaryLinks = [
  { href: "/users", label: "Users" },
  { href: "/references", label: "References" },
  { href: "/payments", label: "Payments" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="p-4 border">
      <div className="container mx-auto">
        {/* Top row: Home and Theme Switcher */}
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center space-x-4">
            <Link href="/" className="font-bold text-xl">
              Kite Hostel
            </Link>
            <Link
              href="/whiteboard"
              className={`text-lg ${pathname === "/whiteboard" ? "font-bold" : ""}`}
            >
              Whiteboard
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/docs"
              className={`text-lg ${pathname === "/docs" ? "font-bold" : ""}`}
            >
              Docs
            </Link>
            <ThemeSwitcher />
          </div>
        </div>

        {/* Bottom row: Schema-related links */}
        <div className="flex items-center space-x-4">
          {primaryLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`${pathname === href ? "font-bold" : ""}`}
            >
              {label}
            </Link>
          ))}
          <span className="text-muted-foreground">|</span>
          {secondaryLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`${pathname === href ? "font-bold" : ""}`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
