"use client";

import { useEffect, useState } from "react";
import { Waves, Tornado } from "lucide-react";
import { useTheme } from "next-themes";

interface ToggleLevantePonienteProps {
  showLabel?: boolean;
  customText?: string;
  className?: string;
  onThemeChange?: (isDarkMode: boolean) => void;
}

export function ToggleLevantePoniente({ 
  showLabel = true, 
  customText,
  className = "",
  onThemeChange
}: ToggleLevantePonienteProps) {
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
  const themeName = isDarkMode ? 'Levante' : 'Poniente';

  const handleToggle = () => {
    const newTheme = isDarkMode ? "light" : "dark";
    setTheme(newTheme);
    onThemeChange?.(newTheme === "dark");
  };

  return (
    <button
      onClick={handleToggle}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
        isDarkMode 
          ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' 
          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
      } ${className}`}
    >
      {isDarkMode ? <Tornado className="w-4 h-4" /> : <Waves className="w-4 h-4" />}
      {showLabel && (
        <span className="text-sm font-medium">
          {customText || themeName}
        </span>
      )}
    </button>
  );
}