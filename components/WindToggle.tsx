"use client";

import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { Waves, Tornado } from "lucide-react";

interface WindToggleProps {
  onThemeChange?: () => void;
}

export function WindToggle({ onThemeChange }: WindToggleProps = {}) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const isDarkMode = mounted ? (theme === "dark" || resolvedTheme === "dark") : false;
  
  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    if (onThemeChange) {
      onThemeChange();
    }
  };
  
  return (
    <div className={`inline-flex items-center gap-2 p-1.5 rounded-full border-2 shadow-lg ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-600' 
        : 'bg-white border-gray-200'
    }`}>
      <button
        onClick={() => handleThemeChange('light')}
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
        onClick={() => handleThemeChange('dark')}
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
