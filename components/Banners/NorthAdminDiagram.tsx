"use client";

import { useState } from "react";
import Image from "next/image";
import { TrendingUp, Database } from "lucide-react";
import { HeadsetIcon, HelmetIcon, EquipmentIcon, FlagIcon, BookingIcon, PaymentIcon } from "@/svgs";

export function NorthAdminDiagram({ isDarkMode }: { isDarkMode: boolean }) {
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
                      <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
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