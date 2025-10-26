"use client";

import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { Mail, Linkedin, ExternalLink } from "lucide-react";
import { WindToggle } from "@/components/WindToggle";
import Link from "next/link";

interface DevAboutMeFooterProps {
  onThemeChange?: () => void;
}

export function DevAboutMeFooter({ onThemeChange }: DevAboutMeFooterProps = {}) {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const isDarkMode = mounted ? (theme === "dark" || resolvedTheme === "dark") : false;
  
  return (
    <footer className={`border-t backdrop-blur-sm ${
      isDarkMode 
        ? 'border-gray-700 bg-gray-900/50' 
        : 'border-gray-200 bg-white/50'
    }`}>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Wind Toggle */}
          <div className="order-2 md:order-1">
            <WindToggle onThemeChange={onThemeChange} />
          </div>

          {/* Developer Info */}
          <div className="flex flex-col items-center md:items-start gap-3 order-1 md:order-2">
            {/* Title */}
            <div className={`text-sm font-medium ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Lesson Automation Management App • Developed by{" "}
              <span className={isDarkMode ? 'font-bold text-blue-400' : 'font-bold text-blue-600'}>vctrubio</span>
            </div>

            {/* All Links Row */}
            <div className="flex items-center gap-3">
              {/* Adrenalink Prototype Link */}
              <Link
                href="https://adrenalink.tech"
                target="_blank"
                rel="noopener noreferrer"
                className={`relative flex items-center gap-2 px-3 py-2 text-sm rounded-lg border-2 border-orange-500 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-orange-400 ${
                  isDarkMode
                    ? 'text-orange-400 bg-orange-500/10 hover:bg-orange-500/20'
                    : 'text-orange-600 bg-orange-50 hover:bg-orange-100'
                }`}
              >
                <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-md text-xs font-bold bg-orange-500 text-white shadow-md">
                  Prototype
                </span>
                <ExternalLink className="w-4 h-4" />
                <span className="font-bold hidden sm:inline">adrenalink.tech</span>
              </Link>

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
}
