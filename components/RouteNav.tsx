"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, LayoutGrid, Home, Tv, Sun, Moon } from "lucide-react";
import { ENTITY_DATA } from "@/lib/constants";
import { useUserWallet } from "@/provider/UserWalletProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogoutButtonUserWallet } from "@/components/users/LogoutButtonUserWallet";
import { useState, useRef, useEffect } from "react";

// Reusable CSS classes
const DROPDOWN_ITEM_CLASSES = "w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-200 dark:text-gray-300 dark:hover:bg-gray-700";
const ACTIVE_BUTTON_CLASSES = "bg-gray-200 text-gray-800 shadow-sm dark:bg-gray-700 dark:text-gray-200";
const INACTIVE_BUTTON_CLASSES = "text-gray-600 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-800";

function CustomThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState<string>("light");

  useEffect(() => {
    const theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    setCurrentTheme(theme);
  }, []);

  const setTheme = (theme: string) => {
    const isDark = theme === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', theme);
    setCurrentTheme(theme);
  };

  const buttonClasses = (isActive: boolean) =>
    `p-1 rounded-md transition-all duration-200 ${isActive
      ? 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700'
    }`;

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => setTheme('light')}
        className={buttonClasses(currentTheme === 'light')}
        title="Light mode"
      >
        <Sun className="h-4 w-4" />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={buttonClasses(currentTheme === 'dark')}
        title="Dark mode"
      >
        <Moon className="h-4 w-4" />
      </button>
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
          {role} - {email ? `${email}` : ""}
        </div>
      </div>
    </div>
  );
}

function SettingsDropdown({ user, loading }: { user: any; loading: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const displayName = user?.teacher?.name || user?.userAuth.name || "";
  const email = user?.userAuth.email || "";
  const role = user?.role || "";
  const avatar_url = user?.userAuth.avatar_url;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleHome = () => {
    setIsOpen(false);
  };

  if (!user) {
    return (
      <div className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-200 cursor-pointer dark:text-gray-300 dark:hover:bg-gray-800">
        <Avatar className="h-6 w-6">
          <AvatarImage
            src="/logo-tkh.png"
            alt="Kite Hostel"
            className="transition-opacity duration-300"
          />
          <AvatarFallback />
        </Avatar>
        <span>Tarifa Kite Hostel</span>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center ml-6 transition-all duration-200 hover:ring-2 hover:ring-gray-300 rounded-full"
      >
        <Avatar className="h-8 w-8">
          <AvatarImage
            src={avatar_url || "/logo-tkh.png"}
            alt={displayName}
            className="transition-opacity duration-300"
          />
          <AvatarFallback />
        </Avatar>
      </button>
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg border border-gray-200 shadow-lg z-50 dark:bg-gray-800 dark:border-gray-600">
          <div className="p-4">
            <UserProfile
              displayName={displayName}
              role={role}
              email={email}
              avatar_url={avatar_url}
              loading={loading}
            />
            <div className="mt-4 pt-4 border-t border-gray-200 space-y-2 dark:border-gray-600">
              <Link
                href="/whiteboard"
                className="w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-200 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <span>Whiteboard</span>
                <Tv className="h-4 w-4 ml-auto" />
              </Link>
              <div
                className={DROPDOWN_ITEM_CLASSES}
                onClick={(e) => e.stopPropagation()}
              >
                <span>Theme</span>
                <div className="ml-auto">
                  <CustomThemeSwitcher />
                </div>
              </div>
              <Link
                href="/"
                onClick={handleHome}
                className="w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-200 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <span>Home</span>
                <Home className="h-4 w-4 ml-auto" />
              </Link>
              <div
                className={DROPDOWN_ITEM_CLASSES}
                onClick={(e) => e.stopPropagation()}
              >
                <span>Logout</span>
                <div className="ml-auto">
                  <LogoutButtonUserWallet />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TableButton({
  entity,
  isActive,
  showPlus = false,
}: {
  entity: {
    name: string;
    icon: any;
    color: string;
    link: string;
  };
  isActive: boolean;
  showPlus?: boolean;
}) {
  const EntityIcon = entity.icon;
  return (
    <div className="flex items-center">
      <Link
        href={entity.link}
        className={`flex items-center space-x-2 px-3 py-2 rounded-l-lg text-sm font-medium transition-all duration-200 ${isActive ? ACTIVE_BUTTON_CLASSES : `${entity.color} hover:bg-gray-100 dark:hover:bg-gray-800`
          }`}
      >
        <EntityIcon className="h-4 w-4" />
        <span className="hidden lg:block">{entity.name}s</span>
      </Link>
      {showPlus && (
        <div className="hidden lg:block">
          <Link
            href={`${entity.link}/form`}
            className="flex items-center px-2 py-2 rounded-r-lg text-sm font-medium transition-all duration-200 border-l border-gray-300 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800"
            title={`Add new ${entity.name.toLowerCase()}`}
          >
            <Plus className="h-3 w-3" />
          </Link>
        </div>
      )}
    </div>
  );
}

function BillboardView({ pathname }: { pathname: string }) {
  return (
    <div className="flex items-center space-x-3">
      <Link
        href="/billboard"
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${pathname === "/billboard" ? ACTIVE_BUTTON_CLASSES : INACTIVE_BUTTON_CLASSES
          }`}
      >
        <LayoutGrid className="h-4 w-4" />
        <span className="hidden lg:block">Billboard</span>
      </Link>
      <div className="flex items-center space-x-2 overflow-x-auto">
        {ENTITY_DATA.map((entity) => {
          const isActive = pathname.startsWith(entity.link);
          return (
            <TableButton
              key={entity.name}
              entity={entity}
              isActive={isActive}
              showPlus={true}
            />
          );
        })}
      </div>
    </div>
  );
}


export function RouteNav() {
  const pathname = usePathname();
  const { user, loading } = useUserWallet();

  return (
    <div className="border-b bg-white dark:bg-gray-900 dark:border-gray-700">
      {/* Desktop Layout */}
      <div className="hidden md:block p-4">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div>
            {user && <BillboardView pathname={pathname} />}
          </div>
          <SettingsDropdown user={user} loading={loading} />
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden p-3">
        <div className="max-w-7xl mx-auto px-2 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {user && <BillboardView pathname={pathname} />}
            </div>
            <SettingsDropdown user={user} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  );
}
