"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, LayoutGrid } from "lucide-react";
import { ENTITY_DATA } from "@/lib/constants";
import { useUserWallet } from "@/provider/UserWalletProvider";
import { UserSettingsDropdown } from "./UserSettingsDropdown";
import { TableRouteButton } from "./TableRouteButton";

// Reusable CSS classes
const ACTIVE_BUTTON_CLASSES = "bg-gray-200 text-gray-800 shadow-sm dark:bg-gray-700 dark:text-gray-200";
const INACTIVE_BUTTON_CLASSES = "text-gray-600 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-800";



function BillboardView({ pathname }: { pathname: string }) {
  return (
    <div className="flex items-center space-x-3">
      <Link
        href="/billboard"
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${pathname === "/billboard" ? ACTIVE_BUTTON_CLASSES : INACTIVE_BUTTON_CLASSES}`}
      >
        <LayoutGrid className="h-4 w-4" />
        <span className="hidden lg:block">Billboard</span>
      </Link>
      <div className="flex items-center space-x-2 overflow-x-auto">
        {ENTITY_DATA.map((entity) => {
          const isActive = pathname.startsWith(entity.link);
          return (
            <TableRouteButton
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
          <UserSettingsDropdown user={user} loading={loading} />
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden p-3">
        <div className="max-w-7xl mx-auto px-2 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {user && <BillboardView pathname={pathname} />}
            </div>
            <UserSettingsDropdown user={user} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  );
}