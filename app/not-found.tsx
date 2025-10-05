"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { Compass, Book, Users, ArrowRight } from "lucide-react";
import { HelmetIcon } from "@/svgs/HelmetIcon";
import { HeadsetIcon } from "@/svgs/HeadsetIcon";
import { BookingIcon } from "@/svgs/BookingIcon";
import { CalendarIcon } from "@/svgs/CalendarIcon";
import { DevAboutMeFooter } from "@/components/DevAboutMeFooter";

// Role Navigation Cards
function RoleNavigationCards({ isDarkMode }: { isDarkMode: boolean }) {
  const roleRoutes = [
    {
      Icon: HelmetIcon,
      label: "Students",
      description: "Manage students",
      href: "/students",
      color: "#eab308",
      gradientFrom: "from-yellow-500",
      gradientTo: "to-amber-600",
    },
    {
      Icon: HeadsetIcon,
      label: "Teachers",
      description: "View teacher portals",
      href: "/teacher",
      color: "#22c55e",
      gradientFrom: "from-green-500",
      gradientTo: "to-emerald-600",
    },
    {
      Icon: BookingIcon,
      label: "Bookings",
      description: "View and create new bookings",
      href: "/bookings",
      color: "#3b82f6",
      gradientFrom: "from-blue-500",
      gradientTo: "to-cyan-600",
    },
  ];

  return (
    <div className="grid md:grid-cols-3 gap-6 w-full max-w-4xl">
      {roleRoutes.map(({ Icon, label, description, href, color, gradientFrom, gradientTo }) => (
        <Link
          key={label}
          href={href}
          className={`group relative overflow-hidden rounded-2xl border-2 p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
            isDarkMode
              ? 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
              : 'bg-white/80 border-gray-200 hover:border-gray-300'
          } backdrop-blur-sm`}
          style={{ borderColor: `${color}40` }}
        >
          {/* Gradient overlay on hover */}
          <div className={`absolute inset-0 bg-gradient-to-br ${gradientFrom} ${gradientTo} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
          
          <div className="relative flex flex-col items-center text-center gap-4">
            <div 
              className={`p-4 rounded-full bg-gradient-to-br ${gradientFrom} ${gradientTo} shadow-lg`}
            >
              <Icon className="w-10 h-10 text-white" />
            </div>
            
            <div>
              <h3 className={`text-xl font-bold mb-2 ${
                isDarkMode ? 'text-gray-100' : 'text-gray-900'
              }`}>
                {label}
              </h3>
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {description}
              </p>
            </div>
            
            <ArrowRight className={`w-5 h-5 transform group-hover:translate-x-2 transition-transform duration-300 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-400'
            }`} />
          </div>
        </Link>
      ))}
    </div>
  );
}

// Quick Links Section
function QuickLinks({ isDarkMode }: { isDarkMode: boolean }) {
  const links = [
    {
      icon: Book,
      label: "Read Documentation",
      description: "Learn how the system works",
      href: "/docs",
      color: isDarkMode ? "text-blue-400" : "text-blue-600",
    },
    {
      icon: Users,
      label: "View Members",
      description: "See who's in the team",
      href: "/invitation",
      color: isDarkMode ? "text-purple-400" : "text-purple-600",
    },
    {
      icon: CalendarIcon,
      label: "Billboard",
      description: "Check the schedule",
      href: "/billboard",
      color: isDarkMode ? "text-green-400" : "text-green-600",
    },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-4">
      {links.map(({ icon: Icon, label, description, href, color }) => (
        <Link
          key={label}
          href={href}
          className={`group flex items-center gap-3 px-6 py-3 rounded-xl border transition-all duration-300 hover:scale-105 hover:shadow-lg ${
            isDarkMode
              ? 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
              : 'bg-white/80 border-gray-200 hover:border-gray-300'
          } backdrop-blur-sm`}
        >
          <Icon className={`w-5 h-5 ${color}`} />
          <div className="text-left">
            <div className={`font-semibold text-sm ${
              isDarkMode ? 'text-gray-200' : 'text-gray-800'
            }`}>
              {label}
            </div>
            <div className={`text-xs ${
              isDarkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>
              {description}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default function NotFound() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeToggle = () => {
    setIsSpinning(true);
    setTheme(theme === "dark" ? "light" : "dark");
    setTimeout(() => setIsSpinning(false), 600);
  };

  const isDarkMode = mounted ? (theme === "dark" || resolvedTheme === "dark") : false;

  if (!mounted) {
    return (
      <main className="min-h-screen flex flex-col transition-colors duration-300 bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="animate-pulse text-gray-400">Loading...</div>
        </div>
      </main>
    );
  }

  return (
    <main className={`min-h-screen flex flex-col transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-cyan-50'
    }`}>
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-3xl opacity-20 ${
          isDarkMode
            ? 'bg-gradient-to-r from-green-500 to-cyan-500'
            : 'bg-gradient-to-r from-blue-400 to-cyan-400'
        }`}></div>
        
        <div className={`absolute top-20 right-20 w-32 h-32 rounded-full blur-2xl opacity-30 animate-pulse ${
          isDarkMode ? 'bg-cyan-500' : 'bg-blue-400'
        }`} style={{ animationDuration: '4s' }}></div>
        <div className={`absolute bottom-20 left-20 w-40 h-40 rounded-full blur-2xl opacity-20 animate-pulse ${
          isDarkMode ? 'bg-green-500' : 'bg-cyan-400'
        }`} style={{ animationDuration: '6s', animationDelay: '2s' }}></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-5xl space-y-12">
          
          {/* 404 Header with Compass */}
          <div className="text-center space-y-6">
            <div className="flex justify-center mb-6">
              <button
                onClick={handleThemeToggle}
                className={`p-6 rounded-full transition-all duration-300 hover:scale-110 cursor-pointer ${
                  isDarkMode
                    ? 'bg-gray-800/50 border-2 border-gray-700 hover:border-cyan-500'
                    : 'bg-white/80 border-2 border-gray-200 hover:border-blue-500'
                } backdrop-blur-sm hover:shadow-xl`}
                title="Toggle theme"
              >
                <Compass className={`w-20 h-20 transition-all duration-600 ${
                  isDarkMode ? 'text-cyan-400' : 'text-blue-600'
                } ${isSpinning ? 'animate-spin' : ''} ${
                  isDarkMode ? 'rotate-180' : 'rotate-0'
                }`} />
              </button>
            </div>

            <div>
              <h1 className={`text-8xl md:text-9xl font-bold mb-4 ${
                isDarkMode
                  ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-green-500'
                  : 'text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600'
              }`}>
                404
              </h1>
              <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${
                isDarkMode ? 'text-gray-100' : 'text-gray-900'
              }`}>
                Oh hi! I think you're lost
              </h2>
              <p className={`text-lg md:text-xl ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                This page doesn't exist, but don't worry—let's get you back on course
              </p>
            </div>
          </div>

          {/* Role Navigation */}
          <div className="space-y-6">
            <h3 className={`text-2xl font-bold text-center ${
              isDarkMode ? 'text-gray-200' : 'text-gray-800'
            }`}>
              Where do you want to go?
            </h3>
            <RoleNavigationCards isDarkMode={isDarkMode} />
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className={`text-xl font-semibold text-center ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Or explore these
            </h3>
            <QuickLinks isDarkMode={isDarkMode} />
          </div>

          {/* Home Link */}
          <div className="text-center">
            <Link
              href="/"
              className={`inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                isDarkMode
                  ? 'bg-gradient-to-r from-cyan-600 to-green-600 text-white hover:from-cyan-500 hover:to-green-500'
                  : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-500 hover:to-cyan-500'
              }`}
            >
              Take me home
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      <DevAboutMeFooter onThemeChange={handleThemeToggle} />
    </main>
  );
}
