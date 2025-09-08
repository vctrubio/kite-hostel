"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, LayoutGrid, Share2, Palette, LogOut, Tv } from "lucide-react";
import { ENTITY_DATA } from "@/lib/constants";
import { useUserWallet } from "@/provider/UserWalletProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogoutButtonUserWallet } from "@/components/users/LogoutButtonUserWallet";
import { ThemeSwitcher } from "@/components/supabase-init/theme-switcher";
import { useState } from "react";

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
  const displayName = user?.teacher?.name || user?.userAuth.name || "";
  const email = user?.userAuth.email || "";
  const role = user?.role || "";
  const avatar_url = user?.userAuth.avatar_url;

  const handleShare = () => {
    const url = "https://kite-hostel.vercel.app/";
    const message = `Check out Kite Hostel App: ${url}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    setIsOpen(false);
  };

  if (!user) {
    return (
      <div className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-200 cursor-pointer">
        <Avatar className="h-6 w-6">
          <AvatarImage
            src="/logo-tkh.png"
            alt="Kite Hostel"
            className="transition-opacity duration-300"
          />
          <AvatarFallback />
        </Avatar>
        <span>Logo</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center transition-all duration-200 hover:ring-2 hover:ring-gray-300 rounded-full"
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
        <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg border border-gray-200 shadow-lg z-50">
          <div className="p-4">
            <UserProfile
              displayName={displayName}
              role={role}
              email={email}
              avatar_url={avatar_url}
              loading={loading}
            />
                        <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
              <Link
                href="/whiteboard"
                className="w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-200"
              >
                <span>Whiteboard</span>
                <Tv className="h-4 w-4" />
              </Link>
              <div className="w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-200">
                <span>Theme</span>
                <div className="ml-auto">
                  <ThemeSwitcher />
                </div>
              </div>
              <button
                onClick={handleShare}
                className="w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-200"
              >
                <span>Share</span>
                <Share2 className="h-4 w-4" />
              </button>
              <div className="w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-200">
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
  isMobile = false,
  showPlus = false,
}: {
  entity: {
    name: string;
    icon: any;
    color: string;
    link: string;
  };
  isActive: boolean;
  isMobile?: boolean;
  showPlus?: boolean;
}) {
  const EntityIcon = entity.icon;
  return (
    <div className="flex items-center">
      <Link
        href={entity.link}
        className={`flex items-center space-x-2 px-3 py-2 rounded-l-lg text-sm font-medium transition-all duration-200 ${
          isActive
            ? "bg-gray-200 text-gray-800 shadow-sm"
            : `${entity.color} hover:bg-gray-100`
        } ${isMobile ? "justify-center" : ""}`}
      >
        <EntityIcon className="h-4 w-4" />
        {!isMobile && <span>{entity.name}s</span>}
      </Link>
      {showPlus && (
        <Link
          href={`${entity.link}/form`}
          className="flex items-center px-2 py-2 rounded-r-lg text-sm font-medium transition-all duration-200 border-l border-gray-300 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          title={`Add new ${entity.name.toLowerCase()}`}
        >
          <Plus className="h-3 w-3" />
        </Link>
      )}
    </div>
  );
}

function BillboardView({ pathname, isMobile = false }: { pathname: string; isMobile?: boolean }) {
  return (
    <div className="flex items-center space-x-3">
      <Link
        href="/billboard"
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
          pathname === "/billboard"
            ? "bg-gray-200 text-gray-800 shadow-sm"
            : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
        }`}
      >
        <LayoutGrid className="h-4 w-4" />
        {!isMobile && <span>Billboard</span>}
      </Link>
      <div className="flex items-center space-x-2 overflow-x-auto">
        {ENTITY_DATA.map((entity) => {
          const isActive = pathname.startsWith(entity.link);
          return (
            <TableButton
              key={entity.name}
              entity={entity}
              isActive={isActive}
              isMobile={isMobile}
              showPlus={true}
            />
          );
        })}
      </div>
    </div>
  );
}

function TablesView({ pathname, isMobile = false }: { pathname: string; isMobile?: boolean }) {
  return (
    <div className="flex items-center space-x-3">
      <Link
        href="/billboard"
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
          pathname === "/billboard"
            ? "bg-gray-200 text-gray-800 shadow-sm"
            : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
          }`}
      >
        <LayoutGrid className="h-4 w-4" />
        {!isMobile && <span>Billboard</span>}
      </Link>
      <div className="flex items-center space-x-2 overflow-x-auto">
        {ENTITY_DATA.map((entity) => {
          const isActive = pathname.startsWith(entity.link);
          return (
            <TableButton
              key={entity.name}
              entity={entity}
              isActive={isActive}
              isMobile={isMobile}
            />
          );
        })}
      </div>
    </div>
  );
}export function RouteNav() {
  const pathname = usePathname();
  const { user, loading } = useUserWallet();

  const isOnBillboard = pathname.startsWith("/billboard");
  const isOnTables = ENTITY_DATA.some((entity) =>
    pathname.startsWith(entity.link)
  );

  return (
    <div className="border-b bg-white">
      {/* Desktop Layout */}
      <div className="hidden md:block p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            {isOnBillboard && <BillboardView pathname={pathname} />}
            {isOnTables && <TablesView pathname={pathname} />}
          </div>
          <SettingsDropdown user={user} loading={loading} />
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden p-3">
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {isOnBillboard && <BillboardView pathname={pathname} isMobile />}
              {isOnTables && <TablesView pathname={pathname} isMobile />}
            </div>
            <SettingsDropdown user={user} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  );
}
