"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUserWallet } from "@/provider/UserWalletProvider";
import { UserSettingsDropdown } from "./UserSettingsDropdown";
import { TableRouteButton } from "./TableRouteButton";
import { LayoutGrid, BarChart3, Menu, Table, Plus } from "lucide-react";
import { ENTITY_DATA } from "@/lib/constants";
import { useState, useRef, useEffect } from "react";

const ACTIVE_BUTTON_CLASSES = "bg-gray-200 text-gray-800 shadow-sm dark:bg-gray-700 dark:text-gray-200";
const INACTIVE_BUTTON_CLASSES = "text-gray-600 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-800";

export function AppNavigation() {
  const pathname = usePathname();
  const { user, loading } = useUserWallet();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showTables, setShowTables] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && event.target && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  // Check if we're on a table route
  const isOnTableRoute = ENTITY_DATA.some(entity => pathname.startsWith(entity.link));
  
  // Show bottom row if: user clicked Show Tables OR we're on a table route
  const shouldShowBottomRow = showTables || isOnTableRoute;

  return (
    <div className="border-b bg-white dark:bg-gray-900 dark:border-gray-700">
      {/* Desktop Layout */}
      <div className="hidden md:block">
        {/* Top Row: Billboard | Add Booking | Statistics */}
        <div className="p-4">
          <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              {/* Billboard */}
              <Link
                href="/billboard"
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  pathname.startsWith("/billboard") ? ACTIVE_BUTTON_CLASSES : INACTIVE_BUTTON_CLASSES
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
                <span>Billboard</span>
              </Link>

              {/* Show Tables */}
              <button
                onClick={() => setShowTables(!showTables)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  shouldShowBottomRow ? ACTIVE_BUTTON_CLASSES : INACTIVE_BUTTON_CLASSES
                }`}
              >
                <Table className="h-4 w-4" />
                <span>Show Tables</span>
              </button>

              {/* Statistics */}
              <Link
                href="/statistics"
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  pathname.startsWith("/statistics") ? ACTIVE_BUTTON_CLASSES : INACTIVE_BUTTON_CLASSES
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                <span>Statistics</span>
              </Link>

              {/* Add Check In (Desktop Only) */}
              <Link
                href="/bookings/form"
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${INACTIVE_BUTTON_CLASSES}`}
              >
                <Plus className="h-4 w-4" />
                <span>Add Check In</span>
              </Link>
            </div>
            <UserSettingsDropdown user={user} loading={loading} />
          </div>
        </div>

        {/* Bottom Row: Show when on table routes or Show Tables is clicked */}
        {shouldShowBottomRow && (
          <div className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="w-full">
            <div className="flex items-center justify-center w-full space-x-2">
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
          </div>
        )}
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        <div className="p-3">
          <div className="flex items-center justify-between">
            {/* Mobile Burger Menu */}
            <div className="relative" ref={mobileMenuRef}>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`p-2 rounded-lg transition-all duration-200 ${INACTIVE_BUTTON_CLASSES}`}
              >
                <Menu className="h-5 w-5" />
              </button>

              {/* Mobile Sidebar */}
              {isMobileMenuOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg border border-gray-200 shadow-lg z-50 dark:bg-gray-800 dark:border-gray-600">
                  <div className="p-4">
                    {/* Billboard */}
                    <Link
                      href="/billboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 mb-2 ${
                        pathname.startsWith("/billboard") ? ACTIVE_BUTTON_CLASSES : INACTIVE_BUTTON_CLASSES
                      }`}
                    >
                      <LayoutGrid className="h-4 w-4" />
                      <span>Billboard</span>
                    </Link>

                    {/* Statistics */}
                    <Link
                      href="/statistics"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 mb-4 ${
                        pathname.startsWith("/statistics") ? ACTIVE_BUTTON_CLASSES : INACTIVE_BUTTON_CLASSES
                      }`}
                    >
                      <BarChart3 className="h-4 w-4" />
                      <span>Statistics</span>
                    </Link>

                    {/* Tables Section */}
                    <div className="pt-4">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3 px-3">
                        Tables
                      </div>
                      <div className="space-y-2">
                        {ENTITY_DATA.map((entity) => {
                          const isActive = pathname.startsWith(entity.link);
                          const EntityIcon = entity.icon;
                          return (
                            <div key={entity.name} className="rounded-lg border border-gray-200 dark:border-gray-600 p-3">
                              <div className="flex items-center justify-between">
                                <Link
                                  href={entity.link}
                                  onClick={() => setIsMobileMenuOpen(false)}
                                  className={`flex items-center space-x-2 text-sm font-medium transition-all duration-200 ${
                                    isActive ? `${entity.color} font-semibold` : "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
                                  }`}
                                >
                                  <EntityIcon className={`h-4 w-4 ${entity.color}`} />
                                  <span>{entity.name}s</span>
                                </Link>
                                <Link
                                  href={`${entity.link}/form`}
                                  onClick={() => setIsMobileMenuOpen(false)}
                                  className={`flex items-center p-1 rounded transition-all duration-200 ${entity.color} hover:bg-gray-100 dark:hover:bg-gray-800`}
                                  title={`Add new ${entity.name.toLowerCase()}`}
                                >
                                  <Plus className="h-3 w-3" />
                                </Link>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <UserSettingsDropdown user={user} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  );
}