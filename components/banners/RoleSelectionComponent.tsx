"use client";

import { useState, useEffect } from "react";
import { LoadingSpinners } from "./LoadingSpinners";
import { DesktopRoleSelection } from "./DesktopRoleSelection";
import { MobileRoleSelection } from "./MobileRoleSelection";

export interface RoleSelectionProps {
  hoveredIcon: number | null;
  setHoveredIcon: (index: number | null) => void;
  handleIconClick: (href: string) => void;
  visibleWords?: {
    student: boolean;
    teacher: boolean;
    bookings: boolean;
  };
}

export function RoleSelectionComponent() {
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredIcon, setHoveredIcon] = useState<number | null>(null);
  const [spinningIcons, setSpinningIcons] = useState({
    student: true,
    teacher: true,
    bookings: true,
  });
  const [visibleWords, setVisibleWords] = useState({
    student: false,
    teacher: false,
    bookings: false,
  });

  const handleIconClick = (href: string) => {
    if (typeof window !== 'undefined') {
      window.location.href = href;
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const last = localStorage.getItem('lastLandingTime');
      const now = Date.now();
      if (!last || now - parseInt(last) > 60000) {
        setIsLoading(true);

        // Sequential animation: stop each icon spinning and show text one by one
        const studentTimer = setTimeout(() => {
          setSpinningIcons(prev => ({ ...prev, student: false }));
          setVisibleWords(prev => ({ ...prev, student: true }));
        }, 600);

        const teacherTimer = setTimeout(() => {
          setSpinningIcons(prev => ({ ...prev, teacher: false }));
          setVisibleWords(prev => ({ ...prev, teacher: true }));
        }, 1200);

        const bookingsTimer = setTimeout(() => {
          setSpinningIcons(prev => ({ ...prev, bookings: false }));
          setVisibleWords(prev => ({ ...prev, bookings: true }));
        }, 1800);

        const finalTimer = setTimeout(() => {
          setIsLoading(false);
          try {
            localStorage.setItem('lastLandingTime', now.toString());
          } catch (e) {
            console.warn('Could not save to localStorage:', e);
          }
        }, 2400);

        return () => {
          clearTimeout(studentTimer);
          clearTimeout(teacherTimer);
          clearTimeout(bookingsTimer);
          clearTimeout(finalTimer);
        };
      } else {
        setIsLoading(false);
      }
    } catch (e) {
      console.warn('localStorage not available:', e);
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8">
        {/* Row 1: Connecting text */}
        <DesktopRoleSelection
          hoveredIcon={hoveredIcon}
          setHoveredIcon={setHoveredIcon}
          handleIconClick={handleIconClick}
          visibleWords={visibleWords}
        />
        {/* Row 2: Spinning icons */}
        <LoadingSpinners spinningIcons={spinningIcons} visibleWords={visibleWords} />
      </div>
    );
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