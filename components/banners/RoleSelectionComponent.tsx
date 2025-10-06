"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { LoadingSpinners } from "./LoadingSpinners";
import { DesktopRoleSelection } from "./DesktopRoleSelection";
import { MobileRoleSelection } from "./MobileRoleSelection";

export interface RoleSelectionProps {
  hoveredIcon: number | null;
  setHoveredIcon: (index: number | null) => void;
  handleIconClick: () => void;
}

export function RoleSelectionComponent() {
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredIcon, setHoveredIcon] = useState<number | null>(null);
  const supabase = createClient();

  const handleIconClick = async () => {
    setIsLoading(true);
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/confirm`,
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
    if (typeof window === 'undefined') return;
    
    try {
      const last = localStorage.getItem('lastLandingTime');
      const now = Date.now();
      if (!last || now - parseInt(last) > 60000) {
        setIsLoading(true);
        const timer = setTimeout(() => {
          setIsLoading(false);
          try {
            localStorage.setItem('lastLandingTime', now.toString());
          } catch (e) {
            console.warn('Could not save to localStorage:', e);
          }
        }, 800);
        return () => clearTimeout(timer);
      } else {
        setIsLoading(false);
      }
    } catch (e) {
      console.warn('localStorage not available:', e);
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return <LoadingSpinners />;
  }

  return (
    <>
      <DesktopRoleSelection 
        hoveredIcon={hoveredIcon} 
        setHoveredIcon={setHoveredIcon} 
        handleIconClick={handleIconClick}
      />
      <MobileRoleSelection 
        hoveredIcon={hoveredIcon} 
        setHoveredIcon={setHoveredIcon} 
        handleIconClick={handleIconClick}
      />
    </>
  );
}