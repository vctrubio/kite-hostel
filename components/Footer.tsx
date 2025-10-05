"use client";

import { useTheme } from "next-themes";
import { Mail, Linkedin } from "lucide-react";
import { WindToggle } from "@/components/WindToggle";

interface DevAboutMeFooterProps {
  onThemeChange?: () => void;
}

export function DevAboutMeFooter({ onThemeChange }: DevAboutMeFooterProps = {}) {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";
  
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
          <div className="flex items-center gap-6 order-1 md:order-2">
            <div className={`text-sm font-medium ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Kite School Management App • Developed by{" "}
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
}
