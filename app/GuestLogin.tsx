"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";
import { Book, Mail, Linkedin, Shield, Waves, Tornado, TrendingUp, Database } from "lucide-react";
import { HeadsetIcon, HelmetIcon, EquipmentIcon, FlagIcon, BookingIcon, PaymentIcon } from "@/svgs";
import { GoogleOnlyLoginForm } from "@/components/supabase-init/google-only-login-form";

// Role configurations with consistent color scheme
const ROLE_CONFIGS = {
  student: {
    Icon: HelmetIcon,
    label: "Student",
    color: "#eab308", // yellow-500
    tailwindConnection: "text-yellow-500 dark:text-yellow-400",
  },
  teacher: {
    Icon: HeadsetIcon,
    label: "Teacher",
    color: "#22c55e", // green-500
    tailwindConnection: "text-green-500 dark:text-green-400",
  },
  admin: {
    Icon: Shield,
    label: "Admin",
    color: "#06b6d4", // cyan-500 (North's signature teal)
    tailwindConnection: "text-cyan-500 dark:text-cyan-400",
  },
} as const;

const ROLE_ICONS = [
  ROLE_CONFIGS.student,
  ROLE_CONFIGS.teacher,
  ROLE_CONFIGS.admin,
] as const;

// CompassSVG component
function CompassSVG({ className = "", isLoading = false }: { className?: string; isLoading?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${className} ${isLoading ? "animate-spin" : ""} transition-transform duration-300 drop-shadow-sm`}
    >
      <circle cx="12" cy="12" r="10" className="stroke-current opacity-40" strokeWidth="2" />
      <circle cx="12" cy="12" r="8" className="stroke-current opacity-20" strokeWidth="1" />
      <g className="stroke-current opacity-60">
        <line x1="12" y1="2" x2="12" y2="4" strokeWidth="2" />
        <line x1="22" y1="12" x2="20" y2="12" strokeWidth="2" />
        <line x1="12" y1="22" x2="12" y2="20" strokeWidth="2" />
        <line x1="2" y1="12" x2="4" y2="12" strokeWidth="2" />
        <line x1="17.66" y1="6.34" x2="16.95" y2="7.05" strokeWidth="1.5" />
        <line x1="17.66" y1="17.66" x2="16.95" y2="16.95" strokeWidth="1.5" />
        <line x1="6.34" y1="17.66" x2="7.05" y2="16.95" strokeWidth="1.5" />
        <line x1="6.34" y1="6.34" x2="7.05" y2="7.05" strokeWidth="1.5" />
      </g>
      <g>
        <path d="M12 4 L13.5 10 L12 9 L10.5 10 Z" fill="currentColor" className="text-red-500 dark:text-red-400" />
        <path d="M12 20 L10.5 14 L12 15 L13.5 14 Z" fill="currentColor" className="opacity-60" />
      </g>
      <circle cx="12" cy="12" r="1.5" fill="currentColor" className="opacity-80" />
    </svg>
  );
}

// Loading spinners component
function LoadingSpinners({ isDarkMode }: { isDarkMode: boolean }) {
  return (
    <div className="relative flex flex-col items-center gap-12 mb-8 py-8">
      <div className="flex gap-16 relative z-10">
        {[0, 1].map((index) => (
          <div key={index} className="flex justify-center">
            <div className={`p-4 rounded-xl shadow-inner ${
              isDarkMode 
                ? 'bg-gradient-to-br from-slate-700 to-slate-600' 
                : 'bg-gradient-to-br from-slate-100 to-slate-200'
            }`}>
              <CompassSVG
                className={`h-10 w-10 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}
                isLoading={true}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center relative z-10">
        <div className={`p-4 rounded-xl shadow-inner ${
          isDarkMode 
            ? 'bg-gradient-to-br from-slate-700 to-slate-600' 
            : 'bg-gradient-to-br from-slate-100 to-slate-200'
        }`}>
          <CompassSVG
            className={`h-10 w-10 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}
            isLoading={true}
          />
        </div>
      </div>
    </div>
  );
}

// Desktop role selection component
interface RoleSelectionProps {
  hoveredIcon: number | null;
  setHoveredIcon: (index: number | null) => void;
  handleIconClick: () => void;
  isDarkMode: boolean;
}

function DesktopRoleSelection({ hoveredIcon, setHoveredIcon, handleIconClick, isDarkMode }: RoleSelectionProps) {
  return (
    <div className="hidden md:block relative">
      {/* Title with Interactive Entities */}
      <div className={`text-center mb-8 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
        <h2 className="text-2xl font-bold tracking-tight mb-4" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '-0.02em' }}>
          Connecting{" "}
          <span 
            className={`underline decoration-2 underline-offset-4 cursor-pointer transition-all duration-300 ${
              hoveredIcon === 0 
                ? 'decoration-yellow-500 bg-yellow-500/10 px-2 rounded' 
                : 'decoration-yellow-500/50 hover:decoration-yellow-500 hover:bg-yellow-500/10 hover:px-2 hover:rounded'
            }`}
            onMouseEnter={() => setHoveredIcon(0)}
            onMouseLeave={() => setHoveredIcon(null)}
          >
            Student
          </span>
          ,{" "}
          <span 
            className={`underline decoration-2 underline-offset-4 cursor-pointer transition-all duration-300 ${
              hoveredIcon === 1 
                ? 'decoration-green-500 bg-green-500/10 px-2 rounded' 
                : 'decoration-green-500/50 hover:decoration-green-500 hover:bg-green-500/10 hover:px-2 hover:rounded'
            }`}
            onMouseEnter={() => setHoveredIcon(1)}
            onMouseLeave={() => setHoveredIcon(null)}
          >
            Teacher
          </span>
          {" "}and{" "}
          <span 
            className={`underline decoration-2 underline-offset-4 cursor-pointer transition-all duration-300 ${
              hoveredIcon === 2 
                ? 'decoration-cyan-500 bg-cyan-500/10 px-2 rounded' 
                : 'decoration-cyan-500/50 hover:decoration-cyan-500 hover:bg-cyan-500/10 hover:px-2 hover:rounded'
            }`}
            onMouseEnter={() => setHoveredIcon(2)}
            onMouseLeave={() => setHoveredIcon(null)}
          >
            Administration
          </span>
        </h2>
      </div>

      <div className="relative flex flex-col items-center gap-12 mb-8 py-8">
        {/* Connection lines between roles */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 200 120" preserveAspectRatio="xMidYMid meet">
          {/* Student to Teacher connection - uses yellow (student color) */}
          {(hoveredIcon === 0 || hoveredIcon === 1) && (
            <line 
              x1="50" y1="30" x2="150" y2="30" 
              stroke="currentColor" 
              strokeWidth="2" 
              className={`${ROLE_CONFIGS.student.tailwindConnection} opacity-60 animate-pulse`} 
              strokeDasharray="4 4" 
            />
          )}
          {/* Student to Admin connection - uses purple (admin color) */}
          {(hoveredIcon === 0 || hoveredIcon === 2) && (
            <line 
              x1="50" y1="30" x2="100" y2="90" 
              stroke="currentColor" 
              strokeWidth="2" 
              className={`${ROLE_CONFIGS.admin.tailwindConnection} opacity-60 animate-pulse`} 
              strokeDasharray="4 4" 
            />
          )}
          {/* Teacher to Admin connection - uses green (teacher color) */}
          {(hoveredIcon === 1 || hoveredIcon === 2) && (
            <line 
              x1="150" y1="30" x2="100" y2="90" 
              stroke="currentColor" 
              strokeWidth="2" 
              className={`${ROLE_CONFIGS.teacher.tailwindConnection} opacity-60 animate-pulse`} 
              strokeDasharray="4 4" 
            />
          )}
        </svg>

        <div className="flex gap-20 relative z-10">
          {ROLE_ICONS.slice(0, 2).map(({ Icon, label, color }, index) => (
            <div
              key={label}
              className={`flex items-center gap-3 cursor-pointer ${index === 0 ? "flex-row-reverse" : "flex-row"}`}
              onMouseEnter={() => setHoveredIcon(index)}
              onMouseLeave={() => setHoveredIcon(null)}
              onClick={handleIconClick}
            >
              <div
                className={`p-4 border-2 bg-transparent rounded-xl shadow-inner transition-all duration-300 ${
                  hoveredIcon === index ? `shadow-lg ring-2 ring-current/50` : ""
                }`}
                style={{ borderColor: color }}
              >
                <Icon className={`h-10 w-10 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`} />
              </div>
              <span className={`text-lg font-bold whitespace-nowrap ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                {label}
              </span>
            </div>
          ))}
        </div>

        <div className="flex justify-center relative z-10">
          {ROLE_ICONS.slice(2).map(({ Icon, label, color }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-2 cursor-pointer"
              onMouseEnter={() => setHoveredIcon(2)}
              onMouseLeave={() => setHoveredIcon(null)}
              onClick={handleIconClick}
            >
              <div
                className={`p-4 border-2 bg-transparent rounded-xl shadow-inner transition-all duration-300 ${
                  hoveredIcon === 2 ? `shadow-lg ring-2 ring-current/50` : ""
                }`}
                style={{ borderColor: color }}
              >
                <Icon className={`h-10 w-10 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`} />
              </div>
              <span className={`text-lg font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Mobile role selection component
function MobileRoleSelection({ hoveredIcon, setHoveredIcon, handleIconClick, isDarkMode }: RoleSelectionProps) {
  return (
    <div className="md:hidden flex flex-col gap-4 mb-8 py-4">
      {ROLE_ICONS.map(({ Icon, label, color }, index) => (
        <div
          key={label}
          className={`flex items-center gap-4 cursor-pointer p-4 border-4 bg-transparent rounded-xl transition-all duration-300 hover:shadow-lg ${
            hoveredIcon === index ? `ring-2 ring-current/50 shadow-lg` : ""
          }`}
          style={{ borderColor: color }}
          onMouseEnter={() => setHoveredIcon(index)}
          onMouseLeave={() => setHoveredIcon(null)}
          onClick={handleIconClick}
        >
          <div className="p-3 rounded-lg">
            <Icon className={`h-8 w-8 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`} />
          </div>
          <span className={`text-xl font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

// Role selection component
function RoleSelectionComponent({ isDarkMode }: { isDarkMode: boolean }) {
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredIcon, setHoveredIcon] = useState<number | null>(null);
  const supabase = createClient();

  const handleIconClick = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/confirm`,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error("Sign in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const last = localStorage.getItem('lastLandingTime');
    const now = Date.now();
    if (!last || now - parseInt(last) > 60000) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
        localStorage.setItem('lastLandingTime', now.toString());
      }, 800);
      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return <LoadingSpinners isDarkMode={isDarkMode} />;
  }

  return (
    <>
      <DesktopRoleSelection 
        hoveredIcon={hoveredIcon} 
        setHoveredIcon={setHoveredIcon} 
        handleIconClick={handleIconClick}
        isDarkMode={isDarkMode}
      />
      <MobileRoleSelection 
        hoveredIcon={hoveredIcon} 
        setHoveredIcon={setHoveredIcon} 
        handleIconClick={handleIconClick}
        isDarkMode={isDarkMode}
      />
    </>
  );
}

// Wind Toggle Component
function WindToggle({ theme, setTheme }: { theme: string | undefined; setTheme: (theme: string) => void }) {
  const isDarkMode = theme === "dark";
  
  return (
    <div className={`inline-flex items-center gap-2 p-1.5 rounded-full border-2 shadow-lg ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-600' 
        : 'bg-white border-gray-200'
    }`}>
      <button
        onClick={() => setTheme('light')}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-300 ${
          !isDarkMode
            ? 'bg-blue-500 text-white shadow-md scale-105'
            : 'text-gray-400 hover:text-gray-300'
        }`}
        title="Switch to Poniente (Light mode)"
      >
        <Waves className="w-5 h-5" />
        Poniente
      </button>
      
      <button
        onClick={() => setTheme('dark')}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-300 ${
          isDarkMode
            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md scale-105'
            : 'text-gray-400 hover:text-gray-600'
        }`}
        title="Switch to Levante (Dark mode)"
      >
        <Tornado className="w-5 h-5" />
        Levante
      </button>
    </div>
  );
}

// North Administration Diagram Component
function NorthAdminDiagram({ isDarkMode }: { isDarkMode: boolean }) {
  const [currentMonthIndex, setCurrentMonthIndex] = useState(3); // Start at July (index 3)

  // Entity tokens representing school management data
  const schoolEntities = [
    { icon: HelmetIcon, label: 'Students', color: '#eab308' },
    { icon: HeadsetIcon, label: 'Teachers', color: '#22c55e' },
    { icon: BookingIcon, label: 'Bookings', color: '#3b82f6' },
    { icon: FlagIcon, label: 'Lessons', color: '#ec4899' },
    { icon: EquipmentIcon, label: 'Equipment', color: '#f97316' },
    { icon: PaymentIcon, label: 'Payments', color: '#f97316' },
  ];

  const northMetrics = [
    { icon: BookingIcon, label: 'Bookings', color: '#3b82f6' },
    { icon: TrendingUp, label: 'Revenue', color: '#10b981' },
  ];

  // Monthly data for schools
  const monthlyData = {
    april: [
      { name: 'Feelviana', students: 98, bookings: 67, revenue: '18K' },
      { name: 'Riah', students: 54, bookings: 38, revenue: '10K' },
      { name: 'Vertigo', students: 142, bookings: 78, revenue: '21K' },
      { name: 'Icarus', students: 81, bookings: 52, revenue: '15K' },
    ],
    may: [
      { name: 'Feelviana', students: 112, bookings: 76, revenue: '20K' },
      { name: 'Riah', students: 61, bookings: 42, revenue: '11K' },
      { name: 'Vertigo', students: 149, bookings: 85, revenue: '23K' },
      { name: 'Icarus', students: 88, bookings: 58, revenue: '16K' },
    ],
    june: [
      { name: 'Feelviana', students: 118, bookings: 82, revenue: '21K' },
      { name: 'Riah', students: 65, bookings: 44, revenue: '11K' },
      { name: 'Vertigo', students: 153, bookings: 89, revenue: '24K' },
      { name: 'Icarus', students: 92, bookings: 61, revenue: '17K' },
    ],
    july: [
      { name: 'Feelviana', students: 124, bookings: 87, revenue: '22K' },
      { name: 'Riah', students: 68, bookings: 45, revenue: '12K' },
      { name: 'Vertigo', students: 156, bookings: 92, revenue: '25K' },
      { name: 'Icarus', students: 95, bookings: 63, revenue: '18K' },
    ],
    august: [
      { name: 'Feelviana', students: 131, bookings: 94, revenue: '24K' },
      { name: 'Riah', students: 72, bookings: 49, revenue: '13K' },
      { name: 'Vertigo', students: 164, bookings: 98, revenue: '27K' },
      { name: 'Icarus', students: 101, bookings: 68, revenue: '19K' },
    ],
    september: [
      { name: 'Feelviana', students: 108, bookings: 71, revenue: '19K' },
      { name: 'Riah', students: 58, bookings: 40, revenue: '10K' },
      { name: 'Vertigo', students: 145, bookings: 81, revenue: '22K' },
      { name: 'Icarus', students: 85, bookings: 56, revenue: '16K' },
    ],
    october: [
      { name: 'Feelviana', students: 95, bookings: 64, revenue: '17K' },
      { name: 'Riah', students: 51, bookings: 35, revenue: '9K' },
      { name: 'Vertigo', students: 138, bookings: 74, revenue: '20K' },
      { name: 'Icarus', students: 78, bookings: 49, revenue: '14K' },
    ],
  };

  const months = ['april', 'may', 'june', 'july', 'august', 'september', 'october'] as const;
  const currentMonth = months[currentMonthIndex];
  const schoolsData = monthlyData[currentMonth];

  const handlePreviousMonth = () => {
    setCurrentMonthIndex((prev) => (prev === 0 ? months.length - 1 : prev - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthIndex((prev) => (prev === months.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-16">
      <div className={`relative rounded-3xl border-2 p-10 md:p-12 ${
        isDarkMode 
          ? 'bg-gray-800/50 border-cyan-500/30' 
          : 'bg-white/80 border-cyan-400/40'
      } backdrop-blur-sm shadow-2xl`}>
        
        {/* Title */}
        <div className="text-center mb-12">
          <h3 className={`text-3xl md:text-4xl font-bold mb-6 flex items-center justify-center gap-3 ${
            isDarkMode ? 'text-gray-100' : 'text-gray-900'
          }`}>
            <Database className="w-8 h-8 md:w-10 md:h-10" />
            Infrastructure Proposal
          </h3>
          <p className={`text-base leading-relaxed max-w-3xl mx-auto ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            <span className={`inline-block text-xs mb-2 px-4 py-2 rounded-full ${
              isDarkMode ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-200/70 text-gray-700'
            }`}>
              Entities ⇒ Table ⇒ Data ⇒ Control ⇒ Actions
            </span>
            <span className="block mt-2">
              Each school manages entities
              {" "}[
              <span className={`font-semibold ${
                isDarkMode ? 'text-yellow-400' : 'text-yellow-600'
              }`}>
                students
              </span>
              ,{" "}
              <span className={`font-semibold ${
                isDarkMode ? 'text-green-400' : 'text-green-600'
              }`}>
                teachers
              </span>
              ,{" "}
              <span className={`font-semibold ${
                isDarkMode ? 'text-blue-400' : 'text-blue-600'
              }`}>
                bookings
              </span>
              ,{" "}
              <span className={`font-semibold ${
                isDarkMode ? 'text-cyan-400' : 'text-cyan-600'
              }`}>
                lessons
              </span>
              ,{" "}
              <span className={`font-semibold ${
                isDarkMode ? 'text-purple-400' : 'text-purple-600'
              }`}>
                equipment
              </span>
              , and{" "}
              <span className={`font-semibold ${
                isDarkMode ? 'text-amber-400' : 'text-amber-600'
              }`}>
                payments
              </span>
              ],
            </span>
            <span className="block mt-2">
              with{" "}
              <span className={`font-bold ${
                isDarkMode ? 'text-blue-400' : 'text-blue-600'
              }`}>
                full operational control
              </span>
              .{" "}
              <span className={`font-semibold ${
                isDarkMode ? 'text-cyan-400' : 'text-cyan-600'
              }`}>
                North Administration
              </span>
              {" "}has{" "}
              <span className={`font-bold ${
                isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
              }`}>
                read-only access
              </span>
            </span>
            <span className="block mt-2">
              to view{" "}
              <span className={`font-semibold ${
                isDarkMode ? 'text-green-400' : 'text-green-600'
              }`}>
                revenue metrics
              </span>
              {" "}and{" "}
              <span className={`font-semibold ${
                isDarkMode ? 'text-cyan-400' : 'text-cyan-600'
              }`}>
                compare performances
              </span>
              .
            </span>
          </p>
        </div>

        {/* Main Diagram */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_auto_1fr] gap-2 items-start">
          
          {/* North Administration Section - Left */}
          <div className="w-full max-w-md mx-auto xl:mx-0 xl:justify-self-end">
            <div className="relative">
              <div className={`absolute inset-0 rounded-2xl blur-2xl opacity-50 ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-cyan-500 to-teal-500' 
                  : 'bg-gradient-to-r from-cyan-400 to-teal-400'
              }`}></div>
              
              <div className={`relative p-6 md:p-8 rounded-2xl border-2 ${
                isDarkMode 
                  ? 'bg-gray-900 border-cyan-500' 
                  : 'bg-white border-cyan-500'
              } shadow-xl`}>
                
                {/* North Header */}
                <div className={`flex flex-col items-center gap-4 mb-6 pb-6 border-b ${
                  isDarkMode ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <div className="w-24 h-24 rounded-full overflow-hidden shadow-lg">
                    <Image 
                      src="/northsail.webp" 
                      alt="North Sail Logo" 
                      width={96} 
                      height={96}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="text-center">
                    <p className={`font-bold text-2xl ${
                      isDarkMode ? 'text-cyan-400' : 'text-cyan-600'
                    }`}>
                      Administration
                    </p>
                    <p className={`text-sm font-medium ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Analytics & Insights Hub
                    </p>
                  </div>
                </div>

                {/* Analytics Capabilities */}
                <div className="space-y-3">
                  <p className={`text-xs font-semibold uppercase tracking-wider mb-4 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Master Table View
                  </p>
                  
                  {northMetrics.map((metric) => {
                    const Icon = metric.icon;
                    return (
                      <div 
                        key={metric.label}
                        className={`flex items-center gap-3 p-3 rounded-lg border ${
                          isDarkMode
                            ? 'bg-gray-800/50 border-gray-700'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div style={{ color: metric.color }}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className={`text-sm font-medium ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {metric.label}
                        </span>
                      </div>
                    );
                  })}

                  {/* Schools Table */}
                  <div className={`mt-6 rounded-lg border overflow-hidden relative pb-4 ${
                    isDarkMode 
                      ? 'bg-gray-800/30 border-gray-700' 
                      : 'bg-gray-50/50 border-gray-200'
                  }`}>
                    {/* Month Stamp - Overlapping with Navigation */}
                    <div className="absolute top-12 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
                      <div className="flex items-center justify-center gap-3">
                        {/* Left Arrow */}
                        <button
                          onClick={handlePreviousMonth}
                          className={`p-2 rounded-lg transition-all hover:scale-110 ${
                            isDarkMode
                              ? 'bg-orange-500/20 hover:bg-orange-500/30 text-orange-400'
                              : 'bg-orange-100 hover:bg-orange-200 text-orange-600'
                          }`}
                          aria-label="Previous month"
                        >
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 4 L6 10 L12 16" />
                          </svg>
                        </button>

                        {/* Month Stamp */}
                        <div className={`relative inline-block transform rotate-[-5deg]`}>
                          <div className={`w-[220px] px-5 py-2 rounded-lg border-4 font-bold uppercase tracking-wider shadow-2xl backdrop-blur-sm text-center ${
                            isDarkMode
                              ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                              : 'bg-orange-100 border-orange-500 text-orange-600'
                          }`}>
                            <div className="text-xs">Month of</div>
                            <div className="text-xl leading-tight">{currentMonth.toUpperCase()}</div>
                          </div>
                        </div>

                        {/* Right Arrow */}
                        <button
                          onClick={handleNextMonth}
                          className={`p-2 rounded-lg transition-all hover:scale-110 ${
                            isDarkMode
                              ? 'bg-orange-500/20 hover:bg-orange-500/30 text-orange-400'
                              : 'bg-orange-100 hover:bg-orange-200 text-orange-600'
                          }`}
                          aria-label="Next month"
                        >
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M8 4 L14 10 L8 16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <table className="w-full">
                      {/* Column Headers */}
                      <thead className={`${
                        isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100/50'
                      }`}>
                        <tr>
                          <th className={`text-left text-xs font-semibold uppercase tracking-wider p-3 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            School
                          </th>
                          <th className={`text-center text-xs font-semibold uppercase tracking-wider p-3 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            Students
                          </th>
                          <th className={`text-center text-xs font-semibold uppercase tracking-wider p-3 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            Bookings
                          </th>
                          <th className={`text-right text-xs font-semibold uppercase tracking-wider p-3 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            Revenue
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}">
                        {schoolsData.map((school) => (
                          <tr key={school.name} className={`${
                            isDarkMode 
                              ? 'hover:bg-gray-800/30' 
                              : 'hover:bg-white/50'
                          } transition-colors`}>
                            <td className={`p-3 text-sm font-medium ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                              {school.name}
                            </td>
                            <td className={`p-3 text-sm text-center ${
                              isDarkMode ? 'text-yellow-400' : 'text-yellow-600'
                            }`}>
                              {school.students}
                            </td>
                            <td className={`p-3 text-sm text-center ${
                              isDarkMode ? 'text-blue-400' : 'text-blue-600'
                            }`}>
                              {school.bookings}
                            </td>
                            <td className={`p-3 text-sm text-right font-medium ${
                              isDarkMode ? 'text-green-400' : 'text-green-600'
                            }`}>
                              €{school.revenue}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Connection Arrow - Center */}
          <div className="flex items-center justify-center order-2 xl:order-none">
            <div className="relative">
              {/* Horizontal arrow for desktop */}
              <div className="hidden xl:block">
                <svg width="180" height="140" viewBox="0 0 180 140" className="overflow-visible">
                  <path
                    d="M 20 70 L 160 70 L 155 65 M 160 70 L 155 75"
                    stroke={isDarkMode ? "#06b6d4" : "#0891b2"}
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <text x="20" y="50" fill={isDarkMode ? "#a5f3fc" : "#0891b2"} fontSize="18" textAnchor="start" className="font-bold">
                    ← Data Analytics
                  </text>
                  <text x="20" y="100" fill={isDarkMode ? "#a5f3fc" : "#0891b2"} fontSize="18" textAnchor="start" className="font-mono">
                    App Usage
                  </text>
                </svg>
              </div>
              
              {/* Mobile arrow */}
              <div className="xl:hidden">
                <svg width="300" height="160" viewBox="0 0 300 160" className="overflow-visible">
                  {/* Left side - Data Analytics with down arrow */}
                  <path
                    d="M 70 50 L 70 110 L 65 105 M 70 110 L 75 105"
                    stroke={isDarkMode ? "#06b6d4" : "#0891b2"}
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  
                  <text x="70" y="40" fill={isDarkMode ? "#a5f3fc" : "#0891b2"} fontSize="14" textAnchor="middle" className="font-bold">
                    App Usage

                  </text>
                  {/* Right side - Up arrow with App Usage */}
                  <path
                    d="M 230 110 L 230 50 L 225 55 M 230 50 L 235 55"
                    stroke={isDarkMode ? "#06b6d4" : "#0891b2"}
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <text x="230" y="135" fill={isDarkMode ? "#a5f3fc" : "#0891b2"} fontSize="14" textAnchor="middle" className="font-mono">
                    Data Analytics

                  </text>
                </svg>
              </div>
            </div>
          </div>

          {/* Kite School Section - Right */}
          <div className="w-full max-w-md mx-auto xl:mx-0 xl:justify-self-start order-3 xl:order-none">
            <div className="relative">
              <div className={`absolute inset-0 rounded-2xl blur-2xl opacity-40 ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500' 
                  : 'bg-gradient-to-r from-blue-400 to-cyan-400'
              }`}></div>
              
              <div className={`relative p-6 md:p-8 rounded-2xl border-2 ${
                isDarkMode 
                  ? 'bg-gray-900 border-blue-500' 
                  : 'bg-white border-blue-500'
              } shadow-xl`}>
                
                {/* School Header */}
                <div className={`flex flex-col items-center gap-4 mb-6 pb-6 border-b ${
                  isDarkMode ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <div className="w-24 h-24 rounded-full overflow-hidden shadow-lg">
                    <Image 
                      src="/logo-tkh.png" 
                      alt="Tarifa Kite Hostel Logo" 
                      width={96} 
                      height={96}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="text-center">
                    <p className={`font-bold text-2xl ${
                      isDarkMode ? 'text-blue-400' : 'text-blue-600'
                    }`}>
                      School
                    </p>
                    <p className={`text-sm font-medium ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Full App Management Control
                    </p>
                  </div>
                </div>

                {/* Entity Management */}
                <div className="space-y-3">
                  <p className={`text-xs font-semibold uppercase tracking-wider mb-4 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Daily Operations
                  </p>
                  {schoolEntities.map((entity) => {
                    const Icon = entity.icon;
                    return (
                      <div 
                        key={entity.label}
                        className={`flex items-center gap-3 p-3 rounded-lg border ${
                          isDarkMode
                            ? 'bg-gray-800/50 border-gray-700'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div style={{ color: entity.color }}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className={`text-sm font-medium ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {entity.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export function GuestLogin() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // useEffect only runs on the client
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isDarkMode = theme === "dark";

  // Sub-component: Hero Header
  const HeroHeader = () => {
    const features = [
      { 
        icon: EquipmentIcon, 
        text: "Equipment Tracking",
        iconType: "svg" as const,
      },
      { 
        icon: FlagIcon, 
        text: "Lesson Management",
        iconType: "svg" as const,
      },
      { 
        icon: BookingIcon, 
        text: "Booking Automation",
        iconType: "svg" as const,
      },
      { 
        icon: TrendingUp, 
        text: "Statistic Filtering",
        iconType: "lucide" as const,
      },
      { 
        icon: Database, 
        text: "One Source of Truth",
        iconType: "lucide" as const,
      },
    ];

    return (
      <div className="text-center space-y-6">
        <h1 className={`text-4xl md:text-5xl font-bold leading-tight drop-shadow-lg ${
          isDarkMode ? 'text-gray-100' : 'text-gray-900'
        }`}>
          Welcome to the Kite School{" "}
          <span className={`${
            isDarkMode 
              ? 'text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500 drop-shadow-[0_0_30px_rgba(34,197,94,0.5)]' 
              : 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-teal-600 drop-shadow-[0_0_30px_rgba(6,182,212,0.3)]'
          }`}>
            Management App
          </span>
        </h1>
        
        {/* Feature List with Depth */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-6 mt-6">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border backdrop-blur-sm ${
                  isDarkMode
                    ? 'bg-gray-800/70 border-gray-700 text-gray-300 shadow-[0_8px_30px_rgb(0,0,0,0.4)]'
                    : 'bg-white/90 border-gray-200 text-gray-700 shadow-[0_8px_30px_rgb(0,0,0,0.12)]'
                } hover:shadow-xl hover:scale-105 transition-all duration-200 hover:-translate-y-1`}
              >
                <IconComponent className={`${feature.iconType === 'svg' ? 'h-5 w-5' : 'h-4 w-4'} ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`} />
                <span className="text-sm font-medium">{feature.text}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Sub-component: Background Effects
  const BackgroundEffects = () => (
    <div className="absolute inset-0 pointer-events-none">
      {/* Radial glow effect */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-3xl opacity-20 ${
        isDarkMode
          ? 'bg-gradient-to-r from-green-500 to-cyan-500'
          : 'bg-gradient-to-r from-blue-400 to-cyan-400'
      }`}></div>
      
      {/* Floating orbs for depth */}
      <div className={`absolute top-20 left-10 w-32 h-32 rounded-full blur-2xl opacity-30 animate-pulse ${
        isDarkMode ? 'bg-cyan-500' : 'bg-blue-400'
      }`} style={{ animationDuration: '4s' }}></div>
      <div className={`absolute bottom-20 right-10 w-40 h-40 rounded-full blur-2xl opacity-20 animate-pulse ${
        isDarkMode ? 'bg-green-500' : 'bg-cyan-400'
      }`} style={{ animationDuration: '6s', animationDelay: '2s' }}></div>
    </div>
  );

  // Sub-component: Footer
  const Footer = () => (
    <footer className={`border-t backdrop-blur-sm ${
      isDarkMode 
        ? 'border-gray-700 bg-gray-900/50' 
        : 'border-gray-200 bg-white/50'
    }`}>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Wind Toggle */}
          <div className="order-2 md:order-1">
            <WindToggle theme={theme} setTheme={setTheme} />
          </div>

          {/* Developer Info */}
          <div className="flex items-center gap-6 order-1 md:order-2">
            <div className={`text-sm font-medium ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Developed by{" "}
              <span className={isDarkMode ? 'font-bold text-blue-400' : 'font-bold text-blue-600'}>vctrubio</span>
            </div>
            
            <div className="flex items-center gap-3">
              <a
                href="mailto:vctrubio@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition-colors ${
                  isDarkMode 
                    ? 'text-gray-300 border-gray-600 hover:text-blue-400 hover:border-blue-500 hover:shadow-sm' 
                    : 'text-gray-700 border-gray-300 hover:text-blue-600 hover:border-blue-400 hover:shadow-sm'
                }`}
                title="Email vctrubio"
              >
                <Mail className="w-4 h-4" />
                <span className="hidden sm:inline">Email</span>
              </a>
              
              <a
                href="https://www.linkedin.com/in/vctrubio/"
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition-colors ${
                  isDarkMode 
                    ? 'text-gray-300 border-gray-600 hover:text-blue-400 hover:border-blue-500 hover:shadow-sm' 
                    : 'text-gray-700 border-gray-300 hover:text-blue-600 hover:border-blue-400 hover:shadow-sm'
                }`}
                title="LinkedIn Profile"
              >
                <Linkedin className="w-4 h-4" />
                <span className="hidden sm:inline">LinkedIn</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );

  return (
    <main className={`min-h-screen flex flex-col transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-cyan-50'
    }`}>
      {/* Hero Section with Depth */}
      <div className="flex-1 flex items-center justify-center p-6 py-12 relative overflow-hidden">
        <BackgroundEffects />

        <div className="w-full max-w-6xl space-y-12 relative z-10">
          <HeroHeader />

          {/* Role Selection & Login - Unified Card with Blur Effect */}
          <div className={`rounded-3xl backdrop-blur-sm p-8 md:p-12 ${
            isDarkMode
              ? 'bg-gray-800/30 shadow-[0_20px_60px_rgba(0,0,0,0.5)]'
              : 'bg-white/40 shadow-[0_20px_60px_rgba(0,0,0,0.15)]'
          }`}>
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              
              {/* Left Side - Role Selection */}
              <div className="flex justify-center">
                <RoleSelectionComponent isDarkMode={isDarkMode} />
              </div>

              {/* Right Side - Login Form */}
              <div className="flex justify-center">
                <div className="w-full max-w-md mx-auto space-y-6">
                  {/* Documentation Link Title */}
                  <div className={`text-center ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    <h2 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '-0.02em' }}>
                      <Link
                        href="/docs"
                        className={`inline-flex items-center gap-2 underline decoration-2 underline-offset-4 transition-all duration-300 ${
                          isDarkMode 
                            ? 'decoration-blue-500/50 hover:decoration-blue-500 hover:bg-blue-500/10 hover:px-2 hover:rounded' 
                            : 'decoration-blue-500/50 hover:decoration-blue-500 hover:bg-blue-500/10 hover:px-2 hover:rounded'
                        }`}
                      >
                        <Book className="h-6 w-6" />
                        Read Our Documentation
                      </Link>
                    </h2>
                  </div>
                  
                  <GoogleOnlyLoginForm />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <NorthAdminDiagram isDarkMode={isDarkMode} />
      <Footer />
    </main>
  );
}
