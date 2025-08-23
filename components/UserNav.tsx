"use client";

import { useUserWallet } from "@/provider/UserWalletProvider";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogoutButtonUserWallet } from "@/components/users/LogoutButtonUserWallet";
import { ThemeSwitcher } from "@/components/supabase-init/theme-switcher";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tv, FileText, UserPlus, ChevronDown, Plus } from "lucide-react";
import {
  HelmetIcon,
  HeadsetIcon,
  BookmarkIcon,
  BookingIcon,
  FlagIcon,
  KiteIcon,
  EquipmentIcon,
  PaymentIcon,
  BookIcon,
} from "@/svgs";
import { ENTITY_DATA } from "@/lib/constants";

function UserNavRoutes() {
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Form routes that should show the forms navigation
  const formRoutes = [
    "/students",
    "/teachers",
    "/packages",
    "/bookings",
    "/lessons",
    "/events",
    "/kites",
    "/payments",
    "/references",
  ];
  const isOnFormRoute = formRoutes.some((route) => pathname.startsWith(route));

  // Get current entity info for form routes
  const getCurrentEntityInfo = () => {
    if (pathname.startsWith("/students"))
      return {
        label: "Students",
        icon: "HelmetIcon",
        color: "text-yellow-500",
      };
    if (pathname.startsWith("/teachers"))
      return {
        label: "Teachers",
        icon: "HeadsetIcon",
        color: "text-green-500",
      };
    if (pathname.startsWith("/packages"))
      return {
        label: "Packages",
        icon: "BookmarkIcon",
        color: "text-orange-500",
      };
    if (pathname.startsWith("/bookings"))
      return { label: "Bookings", icon: "BookingIcon", color: "text-blue-500" };
    if (pathname.startsWith("/lessons"))
      return { label: "Lessons", icon: "FlagIcon", color: "text-cyan-500" };
    if (pathname.startsWith("/events"))
      return { label: "Events", icon: "KiteIcon", color: "text-teal-500" };
    if (pathname.startsWith("/kites"))
      return {
        label: "Kites",
        icon: "EquipmentIcon",
        color: "text-purple-500",
      };
    if (pathname.startsWith("/payments"))
      return {
        label: "Payments",
        icon: "PaymentIcon",
        color: "text-amber-500",
      };
    if (pathname.startsWith("/references"))
      return { label: "References", icon: "BookIcon", color: "text-slate-400" };
    return { label: "Forms", icon: "FileText", color: "text-muted-foreground" };
  };

  const entityInfo = getCurrentEntityInfo();

  const routes = [
    {
      href: "/whiteboard",
      label: "Whiteboard",
      icon: Tv,
      color: "text-gray-500",
      hoverColor: "hover:text-gray-700 hover:bg-gray-100",
      hasQuickAction: true,
      quickActionHref: "/bookings/form",
      quickActionIcon: Plus,
    },
    {
      href: "/forms",
      label: isOnFormRoute ? entityInfo.label : "Forms",
      icon:
        isOnFormRoute && entityInfo.icon !== "FileText"
          ? entityInfo.icon === "HelmetIcon"
            ? HelmetIcon
            : entityInfo.icon === "HeadsetIcon"
              ? HeadsetIcon
              : entityInfo.icon === "BookmarkIcon"
                ? BookmarkIcon
                : entityInfo.icon === "BookingIcon"
                  ? BookingIcon
                  : entityInfo.icon === "FlagIcon"
                    ? FlagIcon
                    : entityInfo.icon === "KiteIcon"
                      ? KiteIcon
                      : entityInfo.icon === "EquipmentIcon"
                        ? EquipmentIcon
                        : entityInfo.icon === "PaymentIcon"
                          ? PaymentIcon
                          : entityInfo.icon === "BookIcon"
                            ? BookIcon
                            : FileText
          : FileText,
      color: isOnFormRoute ? entityInfo.color : "text-gray-500",
      hoverColor: isOnFormRoute
        ? `hover:opacity-80 hover:bg-gray-50`
        : "hover:text-gray-700 hover:bg-gray-100",
    },
    {
      href: "/users",
      label: "Users",
      icon: UserPlus,
      color: "text-gray-500",
      hoverColor: "hover:text-gray-700 hover:bg-white hover:shadow-sm",
      hasQuickAction: true,
      quickActionHref: "/invitation",
      quickActionIcon: Plus,
    },
  ];

  return (
    <div className="flex items-center space-x-3">
      {routes.map(
        ({
          href,
          label,
          icon: Icon,
          color,
          hoverColor,
          hasQuickAction,
          quickActionHref,
          quickActionIcon: QuickActionIcon,
        }) => {
          const isActive =
            pathname === href ||
            pathname.startsWith(href.replace("(", "").replace(")", "")) ||
            (href === "/forms" && isOnFormRoute);

          // Special handling for Whiteboard button with quick action
          if (hasQuickAction && QuickActionIcon) {
            return (
              <div key={href} className="relative">
                <div className="flex items-center">
                  <Link
                    href={href}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-l-lg text-sm font-medium transition-all duration-200 ${isActive
                      ? "bg-gray-200 text-gray-800 shadow-sm"
                      : `${color} ${hoverColor}`
                      }`}
                  >
                    <Icon className={`h-4 w-4`} />
                    <span>{label}</span>
                  </Link>

                  <Link
                    href={quickActionHref}
                    className="flex items-center px-2 py-2 rounded-r-lg text-sm font-medium transition-all duration-200 border-l border-gray-300 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    title="Quick add booking"
                  >
                    <QuickActionIcon className={`h-3 w-3`} />
                  </Link>
                </div>
              </div>
            );
          }

          // Special handling for Forms button with dropdown
          if (href === "/forms") {
            return (
              <div key={href} className="relative">
                <div className="flex items-center">
                  <Link
                    href={href}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-l-lg text-sm font-medium transition-all duration-200 ${isActive
                      ? "bg-gray-200 text-gray-800 shadow-sm"
                      : `${color} ${hoverColor}`
                      }`}
                  >
                    <Icon
                      className={`h-4 w-4 ${isOnFormRoute ? entityInfo.color : ""}`}
                    />
                    <span>{label}</span>
                  </Link>

                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center px-2 py-2 rounded-r-lg text-sm font-medium transition-all duration-200 border-l border-gray-300 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  >
                    <ChevronDown
                      className={`h-3 w-3 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                </div>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg border border-gray-200 shadow-lg z-50">
                    <div className="p-2">
                      {ENTITY_DATA.map((entity) => {
                        const EntityIcon = entity.icon;
                        const getHoverColor = () => {
                          if (entity.name === "Students") return "#fef3c7"; // yellow-100
                          if (entity.name === "Teachers") return "#d1fae5"; // green-100
                          if (entity.name === "Packages") return "#fed7aa"; // orange-100
                          if (entity.name === "Bookings") return "#dbeafe"; // blue-100
                          if (entity.name === "Lessons") return "#cffafe"; // cyan-100
                          if (entity.name === "Events") return "#ccfbf1"; // teal-100
                          if (entity.name === "Kites") return "#e9d5ff"; // purple-100
                          if (entity.name === "Payments") return "#fef3c7"; // amber-100
                          if (entity.name === "References") return "#f1f5f9"; // slate-100
                          return "#f9fafb"; // gray-50
                        };
                        return (
                          <div key={entity.name} className="flex items-center">
                            <Link
                              href={entity.link}
                              onClick={() => setIsDropdownOpen(false)}
                              className={`flex items-center space-x-3 px-3 py-2 rounded-l-lg text-sm font-medium transition-colors duration-200 ${entity.color} flex-1`}
                              style={
                                {
                                  "--hover-bg": getHoverColor(),
                                } as React.CSSProperties
                              }
                              onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                getHoverColor())
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor = "")
                              }
                            >
                              <EntityIcon
                                className={`h-4 w-4 ${entity.color}`}
                              />
                              <span>{entity.name}</span>
                            </Link>

                            <Link
                              href={`${entity.link}/form`}
                              onClick={() => setIsDropdownOpen(false)}
                              className={`flex items-center px-2 py-2 rounded-r-lg text-sm font-medium transition-colors duration-200 ${entity.color}`}
                              title={`Add new ${entity.name.toLowerCase()}`}
                              onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                getHoverColor())
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor = "")
                              }
                            >
                              <Plus className="h-3 w-3" />
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          }

          // Regular button for other routes
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                ? "bg-gray-200 text-gray-800 shadow-sm"
                : `${color} ${hoverColor}`
                }`}
            >
              <Icon className={`h-4 w-4`} />
              <span>{label}</span>
            </Link>
          );
        },
      )}
    </div>
  );
}

export function UserNav() {
  const { user, loading } = useUserWallet();

  const displayName = user?.teacher?.name || user?.userAuth.name || "";
  const email = user?.userAuth.email || "";
  const role = user?.role || "";
  const avatar_url = user?.userAuth.avatar_url;
  const note = user?.teacher?.user_wallet?.note || "";

  return (
    <div className="border-b">
      {/* Desktop Layout */}
      <div className="hidden md:block p-2">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Avatar
              className={`h-8 w-8 transition-all duration-300 ${loading ? "ring-2 ring-border ring-offset-2 ring-offset-background" : ""}`}
            >
              <AvatarImage
                src={avatar_url || "/logo-tkh.png"}
                alt={displayName}
                className="transition-opacity duration-300"
              />
              <AvatarFallback />
            </Avatar>
            <div className="text-sm">
              <div className="font-semibold min-h-[16px]">{displayName}</div>
              <div className="text-xs text-muted-foreground min-h-[12px]">
                {role}
              </div>
              <div className="text-xs text-muted-foreground min-h-[12px]">
                {email ? `(${email})` : ""}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <UserNavRoutes />

            <div className="flex items-center space-x-2">
              <div className="text-xs text-muted-foreground min-h-[12px]">
                {note && <span>{note}</span>}
              </div>
              <ThemeSwitcher />
              {user && (
                <div className="transition-opacity duration-300">
                  <LogoutButtonUserWallet />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        {/* Top Section - Profile and Logout */}
        <div className="p-3 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar
                className={`h-10 w-10 transition-all duration-300 ${loading ? "ring-2 ring-border ring-offset-2 ring-offset-background" : ""}`}
              >
                <AvatarImage
                  src={avatar_url || "/logo-tkh.png"}
                  alt={displayName}
                  className="transition-opacity duration-300"
                />
                <AvatarFallback />
              </Avatar>
              <div className="flex-1">
                <div className="font-semibold min-h-[18px]">{displayName}</div>
                <div className="text-xs text-muted-foreground min-h-[14px]">
                  {role}
                </div>
                {email && (
                  <div className="text-xs text-muted-foreground min-h-[14px]">
                    {`(${email})`}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {note && (
                <div className="text-xs text-muted-foreground">{note}</div>
              )}
              <ThemeSwitcher />
              {user && (
                <div className="transition-opacity duration-300">
                  <LogoutButtonUserWallet />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Section - Navigation Routes */}
        <div className="p-3">
          <UserNavRoutes />
        </div>
      </div>
    </div>
  );
}
