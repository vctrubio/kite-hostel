"use client";

import { useUserWallet } from "@/provider/UserWalletProvider";
import { useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogoutButtonUserWallet } from "@/components/users/LogoutButtonUserWallet";
import { ThemeSwitcher } from "@/components/supabase-init/theme-switcher";
import { usePathname } from "next/navigation";
import {
  Tv,
  FileText,
  UserPlus,
  ChevronDown,
  Plus,
  Home,
  LayoutGrid,
} from "lucide-react";
import { ENTITY_DATA } from "@/lib/constants";

function RouteButton({
  href,
  label,
  icon: Icon,
  color,
  hoverColor,
  isActive,
}: {
  href: string;
  label: string;
  icon: any;
  color: string;
  hoverColor: string;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
        isActive
          ? "bg-gray-200 text-gray-800 shadow-sm"
          : `${color} ${hoverColor}`
      }`}
    >
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}

function RouteButtonWithAction({
  href,
  label,
  icon: Icon,
  color,
  hoverColor,
  isActive,
  quickActionHref,
  quickActionIcon: QuickActionIcon,
  actionTitle,
}: {
  href: string;
  label: string;
  icon: any;
  color: string;
  hoverColor: string;
  isActive: boolean;
  quickActionHref: string;
  quickActionIcon: any;
  actionTitle: string;
}) {
  return (
    <div className="relative">
      <div className="flex items-center">
        <Link
          href={href}
          className={`flex items-center space-x-2 px-4 py-2 rounded-l-lg text-sm font-medium transition-all duration-200 ${
            isActive
              ? "bg-gray-200 text-gray-800 shadow-sm"
              : `${color} ${hoverColor}`
          }`}
        >
          <Icon className="h-4 w-4" />
          <span className="hidden sm:inline">{label}</span>
        </Link>
        <Link
          href={quickActionHref}
          className="flex items-center px-2 py-2 rounded-r-lg text-sm font-medium transition-all duration-200 border-l border-gray-300 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          title={actionTitle}
        >
          <QuickActionIcon className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}

function EntityDropdownItem({
  entity,
  onClose,
}: {
  entity: (typeof ENTITY_DATA)[number];
  onClose: () => void;
}) {
  const EntityIcon = entity.icon;
  return (
    <div className="flex items-center">
      <Link
        href={entity.link}
        onClick={onClose}
        className={`flex items-center space-x-3 px-3 py-2 rounded-l-lg text-sm font-medium transition-colors duration-200 ${entity.color} flex-1`}
        style={{ "--hover-bg": entity.hoverColor } as React.CSSProperties}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = entity.hoverColor)
        }
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}
        title={entity.name}
      >
        <EntityIcon className={`h-4 w-4 ${entity.color}`} />
        <span className="hidden sm:inline">{entity.name}</span>
      </Link>
      <Link
        href={`${entity.link}/form`}
        onClick={onClose}
        className={`flex items-center px-2 py-2 rounded-r-lg text-sm font-medium transition-colors duration-200 ${entity.color}`}
        title={`Add new ${entity.name.toLowerCase()}`}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = entity.hoverColor)
        }
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}
      >
        <Plus className="h-3 w-3" />
      </Link>
    </div>
  );
}

function FormsDropdown({
  href,
  label,
  icon: Icon,
  color,
  hoverColor,
  isActive,
  entityInfo,
  isOnFormRoute,
  isDropdownOpen,
  setIsDropdownOpen,
}: {
  href: string;
  label: string;
  icon: any;
  color: string;
  hoverColor: string;
  isActive: boolean;
  entityInfo: { label: string; icon: any; color: string };
  isOnFormRoute: boolean;
  isDropdownOpen: boolean;
  setIsDropdownOpen: (open: boolean) => void;
}) {
  return (
    <div className="relative">
      <div className="flex items-center">
        <Link
          href={href}
          className={`flex items-center space-x-2 px-4 py-2 rounded-l-lg text-sm font-medium transition-all duration-200 ${
            isActive
              ? "bg-gray-200 text-gray-800 shadow-sm"
              : `${color} ${hoverColor}`
          }`}
        >
          <Icon
            className={`h-4 w-4 ${isOnFormRoute ? entityInfo.color : ""}`}
          />
          <span className="hidden sm:inline">{label}</span>
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
      {isDropdownOpen && (
        <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg border border-gray-200 shadow-lg z-50">
          <div className="p-2">
            {ENTITY_DATA.map((entity) => (
              <EntityDropdownItem
                key={entity.name}
                entity={entity}
                onClose={() => setIsDropdownOpen(false)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function UserProfile({
  displayName,
  role,
  email,
  avatar_url,
  loading,
  isMobile = false,
}: {
  displayName: string;
  role: string;
  email: string;
  avatar_url?: string;
  loading: boolean;
  isMobile?: boolean;
}) {
  return (
    <div className="flex items-center space-x-3">
      <Link href="/">
        <Avatar
          className={`${isMobile ? "h-10 w-10" : "h-8 w-8"} transition-all duration-300 ${loading ? "ring-2 ring-border ring-offset-2 ring-offset-background" : ""}`}
        >
          <AvatarImage
            src={avatar_url || "/logo-tkh.png"}
            alt={displayName}
            className="transition-opacity duration-300"
          />
          <AvatarFallback />
        </Avatar>
      </Link>
      <div className={isMobile ? "flex-1" : "text-sm"}>
        <div
          className={`font-semibold ${isMobile ? "min-h-[18px]" : "min-h-[16px]"}`}
        >
          {displayName}
        </div>
        <div
          className={`text-xs text-muted-foreground ${isMobile ? "min-h-[14px]" : "min-h-[12px]"}`}
        >
          {role} {email ? ` - ${email}` : ""}
        </div>
      </div>
    </div>
  );
}

function ActionButtons({ user, note }: { user: any; note: string }) {
  return (
    <div className="flex items-center space-x-2">
      {note && <div className="text-xs text-muted-foreground">{note}</div>}
      <ThemeSwitcher />
      {user ? (
        <div className="transition-opacity duration-300">
          <LogoutButtonUserWallet />
        </div>
      ) : (
        <Link
          href="/auth/login"
          className="flex items-center space-x-2 px-3 py-1.5 text-sm border border-blue-800 hover:border-gray-400 text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-all rounded-md"
          title="Sign in"
        >
          <span>Login</span>
        </Link>
      )}
    </div>
  );
}

// Admin navigation routes (for admin and teacherAdmin roles)
function AdminNavRoutes() {
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
    const entity = ENTITY_DATA.find((entity) =>
      pathname.startsWith(entity.link),
    );

    if (entity) {
      return {
        label: entity.name + "s", // pluralize for consistency with existing labels
        icon: entity.icon,
        color: entity.color,
      };
    }

    return { label: "Forms", icon: FileText, color: "text-muted-foreground" };
  };

  const entityInfo = getCurrentEntityInfo();

  const routes = [
    {
      href: "/billboard",
      label: "Billboard",
      icon: LayoutGrid,
      color: "text-gray-500",
      hoverColor: "hover:text-gray-700 hover:bg-gray-100",
      hasQuickAction: true,
      quickActionHref: "/bookings/form",
      quickActionIcon: Plus,
    },
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
        isOnFormRoute && entityInfo.icon !== FileText
          ? entityInfo.icon
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

          // Handle different route types
          if (hasQuickAction && QuickActionIcon) {
            return (
              <RouteButtonWithAction
                key={href}
                href={href}
                label={label}
                icon={Icon}
                color={color}
                hoverColor={hoverColor}
                isActive={isActive}
                quickActionHref={quickActionHref}
                quickActionIcon={QuickActionIcon}
                actionTitle={
                  href === "/whiteboard" || href === "/billboard"
                    ? "Quick add booking"
                    : `Quick add ${label.toLowerCase()}`
                }
              />
            );
          }

          if (href === "/forms") {
            return (
              <FormsDropdown
                key={href}
                href={href}
                label={label}
                icon={Icon}
                color={color}
                hoverColor={hoverColor}
                isActive={isActive}
                entityInfo={entityInfo}
                isOnFormRoute={isOnFormRoute}
                isDropdownOpen={isDropdownOpen}
                setIsDropdownOpen={setIsDropdownOpen}
              />
            );
          }

          return (
            <RouteButton
              key={href}
              href={href}
              label={label}
              icon={Icon}
              color={color}
              hoverColor={hoverColor}
              isActive={isActive}
            />
          );
        },
      )}
    </div>
  );
}

// Teacher navigation (home only)
function TeacherNavRoutes() {
  return (
    <div className="flex items-center space-x-3">
      <Link
        href="/teachers"
        className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100"
      >
        <Home className="h-4 w-4" />
        <span className="hidden sm:inline">Home</span>
      </Link>
    </div>
  );
}

// Reference navigation (home only)
function ReferenceNavRoutes() {
  return (
    <div className="flex items-center space-x-3">
      <Link
        href="/user"
        className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100"
      >
        <Home className="h-4 w-4" />
        <span className="hidden sm:inline">Home</span>
      </Link>
    </div>
  );
}

// Locked account message
function LockedNavRoutes() {
  return (
    <div className="p-4 bg-red-100 text-red-800 rounded-md">
      Your account has been temporarily locked. Please contact the
      administrator.
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

  // Determine which navigation to show based on role
  const getNavigationComponent = () => {
    if (!user) return null;
    
    switch (role) {
      case "admin":
      case "teacherAdmin":
        return <AdminNavRoutes />;
      case "teacher":
        return <TeacherNavRoutes />;
      case "reference":
        return <ReferenceNavRoutes />;
      case "locked":
        return <LockedNavRoutes />;
      default:
        return null;
    }
  };

  const NavigationComponent = getNavigationComponent();

  return (
    <div className="border-b">
      {/* Desktop Layout */}
      <div className="hidden md:block p-2">
        <div className="container mx-auto flex justify-between items-center">
          <UserProfile
            displayName={displayName}
            role={role}
            email={email}
            avatar_url={avatar_url}
            loading={loading}
          />
          {NavigationComponent}
          <ActionButtons user={user} note={note} />
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden p-3">
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between order-1">
            <UserProfile
              displayName={displayName}
              role={role}
              email={email}
              avatar_url={avatar_url}
              loading={loading}
              isMobile
            />
            <ActionButtons user={user} note={note} />
          </div>
          {NavigationComponent}
        </div>
      </div>
    </div>
  );
}
