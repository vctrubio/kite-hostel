"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, LayoutGrid, Settings, ChevronDown } from "lucide-react";
import { ENTITY_DATA } from "@/lib/constants";
import { useUserWallet } from "@/provider/UserWalletProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogoutButtonUserWallet } from "@/components/users/LogoutButtonUserWallet";
import { ThemeSwitcher } from "@/components/supabase-init/theme-switcher";
import { useState } from "react";

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
}

export function RouteNav() {
  const pathname = usePathname();

  const isOnBillboard = pathname.startsWith("/billboard");
  const isOnTables = ENTITY_DATA.some((entity) =>
    pathname.startsWith(entity.link)
  );

  return (
    <div className="border-b bg-white">
      {/* Desktop Layout */}
      <div className="hidden md:block p-4">
        <div className="container mx-auto">
          {isOnBillboard && <BillboardView pathname={pathname} />}
          {isOnTables && <TablesView pathname={pathname} />}
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden p-3">
        <div className="flex items-center justify-center">
          {isOnBillboard && <BillboardView pathname={pathname} isMobile />}
          {isOnTables && <TablesView pathname={pathname} isMobile />}
        </div>
      </div>
    </div>
  );
}
