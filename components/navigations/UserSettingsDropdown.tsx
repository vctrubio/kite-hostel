"use client";

import Link from "next/link";
import { Waves, Tornado, Home, Tv, User } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogoutButtonUserWallet } from "@/components/users/LogoutButtonUserWallet";

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

export function UserSettingsDropdown({ user, loading, userPath }: { user: any; loading: boolean; userPath?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { theme, resolvedTheme, setTheme } = useTheme();
  
  const displayName = user?.teacher?.name || user?.userAuth.name || "";
  const email = user?.userAuth.email || "";
  const role = user?.role || "";
  const avatar_url = user?.userAuth.avatar_url;

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDarkMode = mounted && (theme === "dark" || resolvedTheme === "dark");

  useEffect(() => {
    if (!mounted) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && event.target && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, mounted]);

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
                onClick={() => setIsOpen(false)}
                className={`group flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                  isDarkMode
                    ? 'hover:bg-gray-700/50 text-gray-300'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <Tv className={`w-5 h-5 ${
                  isDarkMode ? 'text-cyan-400' : 'text-blue-600'
                }`} />
                <span className="font-medium">Whiteboard</span>
              </Link>
              
              {userPath && (
                <Link
                  href={userPath}
                  onClick={() => setIsOpen(false)}
                  className={`group flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                    isDarkMode
                      ? 'hover:bg-gray-700/50 text-gray-300'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <User className={`w-5 h-5 ${
                    isDarkMode ? 'text-purple-400' : 'text-purple-600'
                  }`} />
                  <span className="font-medium">Profile</span>
                </Link>
              )}
              
              <Link
                href="/"
                onClick={handleHome}
                className={`group flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                  isDarkMode
                    ? 'hover:bg-gray-700/50 text-gray-300'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <Home className={`w-5 h-5 ${
                  isDarkMode ? 'text-green-400' : 'text-green-600'
                }`} />
                <span className="font-medium">Home</span>
              </Link>
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                <div className="px-3 py-2">
                  <div className="flex w-full border-2 shadow-lg bg-white dark:bg-gray-800 dark:border-gray-600 border-gray-200">
                    <button
                      onClick={() => setTheme('light')}
                      className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-bold transition-all duration-300 ${
                        !isDarkMode
                          ? 'bg-blue-500 text-white shadow-md'
                          : 'text-gray-400 hover:text-gray-300'
                      }`}
                    >
                      <Waves className="w-3 h-3" />
                      Poniente
                    </button>
                    <button
                      onClick={() => setTheme('dark')}
                      className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-bold transition-all duration-300 ${
                        isDarkMode
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md'
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      <Tornado className="w-3 h-3" />
                      Levante
                    </button>
                  </div>
                </div>
              </div>

              <div
                className={`group flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                  isDarkMode
                    ? 'bg-gray-700/30 hover:bg-gray-800/50'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <span className={`font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>Logout</span>
                <LogoutButtonUserWallet />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}