"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shield } from "lucide-react";
import { HelmetIcon, HeadsetIcon } from "@/svgs";

// Role configurations for the what-we-do component
const ROLE_CONFIGS = {
    student: {
        Icon: HelmetIcon,
        label: "Student",
        colors: { primary: "#eab308" },
        route: "/forms",
    },
    teacher: {
        Icon: HeadsetIcon,
        label: "Teacher",
        colors: { primary: "#22c55e" },
        route: "/teacher",
    },
    admin: {
        Icon: Shield,
        label: "Admin",
        colors: { primary: "#8b5cf6" },
        route: "/whiteboard",
    },
} as const;

// Connection colors between roles - declared in this file
const CONNECTION_COLORS = {
    studentTeacher: "text-yellow-500 dark:text-yellow-400",
    studentAdmin: "text-green-500 dark:text-green-400",
    teacherAdmin: "text-purple-500 dark:text-purple-400",
} as const;

// Convert role configs to array for iteration
const ROLE_ICONS = [
    ROLE_CONFIGS.student,
    ROLE_CONFIGS.teacher,
    ROLE_CONFIGS.admin,
] as const;

// Parent component that only renders children
export default function HomePage() {
    return (
        <main className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
            <div className="p-6 sm:p-8 my-auto">
                {/* Logo and Title */}
                <div className="flex flex-col text-center mb-6">
                    <RoleSelectionComponent />
                    <PageTitle />
                </div>
            </div>
        </main>
    );
}

// Title component
function PageTitle() {
    return (
        <div>
            {/* Subheading with decorative line */}
            <div className="flex items-center justify-center gap-3 mb-1">
                <div className="h-0.5 bg-gradient-to-r from-transparent via-slate-300 to-slate-400 dark:via-slate-400 dark:to-slate-300 w-12 shadow-sm"></div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider font-mono">
                    <div>Tarifa</div>
                    <div>Kite Hostel</div>
                </h2>
                <div className="h-0.5 bg-gradient-to-l from-transparent via-slate-400 to-slate-500 dark:via-slate-400 dark:to-slate-300 w-12 shadow-sm"></div>
            </div>
        </div>
    );
}

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
            {/* Outer compass ring */}
            <circle
                cx="12"
                cy="12"
                r="10"
                className="stroke-current opacity-40"
                strokeWidth="2"
            />

            {/* Inner compass ring */}
            <circle
                cx="12"
                cy="12"
                r="8"
                className="stroke-current opacity-20"
                strokeWidth="1"
            />

            {/* Compass markings - 12 equally spaced marks around the circle */}
            <g className="stroke-current opacity-60">
                {/* Main cardinal directions (longer marks) */}
                <line x1="12" y1="2" x2="12" y2="4" strokeWidth="2" />
                <line x1="22" y1="12" x2="20" y2="12" strokeWidth="2" />
                <line x1="12" y1="22" x2="12" y2="20" strokeWidth="2" />
                <line x1="2" y1="12" x2="4" y2="12" strokeWidth="2" />

                {/* Diagonal directions (medium marks) */}
                <line x1="17.66" y1="6.34" x2="16.95" y2="7.05" strokeWidth="1.5" />
                <line x1="17.66" y1="17.66" x2="16.95" y2="16.95" strokeWidth="1.5" />
                <line x1="6.34" y1="17.66" x2="7.05" y2="16.95" strokeWidth="1.5" />
                <line x1="6.34" y1="6.34" x2="7.05" y2="7.05" strokeWidth="1.5" />
            </g>

            {/* Compass needle - points north */}
            <g>
                <path
                    d="M12 4 L13.5 10 L12 9 L10.5 10 Z"
                    fill="currentColor"
                    className="text-red-500 dark:text-red-400"
                />
                <path
                    d="M12 20 L10.5 14 L12 15 L13.5 14 Z"
                    fill="currentColor"
                    className="opacity-60"
                />
            </g>

            {/* Center dot */}
            <circle
                cx="12"
                cy="12"
                r="1.5"
                fill="currentColor"
                className="opacity-80"
            />
        </svg>
    );
}

// Role selection component
function RoleSelectionComponent() {
    const [isLoading, setIsLoading] = useState(true);
    const [hoveredIcon, setHoveredIcon] = useState<number | null>(null);
    const router = useRouter();

    const handleIconClick = (route: string, index: number) => {
        // if (index === 0) {
        //     // Student clicked
        //     alert("hello sexy student");
        // } else {
        router.push(route);
        // }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 800); // Much shorter timeout - just show compass spinners briefly

        return () => clearTimeout(timer);
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

// Loading spinners component
function LoadingSpinners() {
    return (
        /* 3 Loading Compass Spinners in Triangle Pattern */
        <div className="relative flex flex-col items-center gap-12 mb-8 py-8">
            {/* Top row - 2 compass spinners */}
            <div className="flex gap-16 relative z-10">
                {[0, 1].map((index) => (
                    <div key={index} className="flex justify-center">
                        <div className="p-4 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-xl shadow-inner">
                            <CompassSVG
                                className="h-10 w-10 text-slate-600 dark:text-slate-300"
                                isLoading={true}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom row - 1 compass spinner */}
            <div className="flex justify-center relative z-10">
                <div className="flex justify-center">
                    <div className="p-4 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-xl shadow-inner">
                        <CompassSVG
                            className="h-10 w-10 text-slate-600 dark:text-slate-300"
                            isLoading={true}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

// Desktop role selection component
interface RoleSelectionProps {
    hoveredIcon: number | null;
    setHoveredIcon: (index: number | null) => void;
    handleIconClick: (route: string, index: number) => void;
}

function DesktopRoleSelection({ hoveredIcon, setHoveredIcon, handleIconClick }: RoleSelectionProps) {
    return (
        /* Desktop: Triangle Pattern with Connecting Lines */
        <div className="hidden md:block relative">
            <div className="relative flex flex-col items-center gap-12 mb-8 py-8">
                {/* SVG for connecting lines */}
                <svg
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    viewBox="0 0 200 120"
                    preserveAspectRatio="xMidYMid meet"
                >
                    {/* Lines between icons - only show based on hover state */}
                    {/* Top-left to Top-right line */}
                    {(hoveredIcon === 0 || hoveredIcon === 1) && (
                        <line
                            x1="50"
                            y1="30"
                            x2="150"
                            y2="30"
                            stroke="currentColor"
                            strokeWidth="2"
                            className={`${CONNECTION_COLORS.studentTeacher} opacity-60 animate-pulse`}
                            strokeDasharray="4 4"
                        />
                    )}

                    {/* Top-left to Bottom-center line */}
                    {(hoveredIcon === 0 || hoveredIcon === 2) && (
                        <line
                            x1="50"
                            y1="30"
                            x2="100"
                            y2="90"
                            stroke="currentColor"
                            strokeWidth="2"
                            className={`${CONNECTION_COLORS.studentAdmin} opacity-60 animate-pulse`}
                            strokeDasharray="4 4"
                        />
                    )}

                    {/* Top-right to Bottom-center line */}
                    {(hoveredIcon === 1 || hoveredIcon === 2) && (
                        <line
                            x1="150"
                            y1="30"
                            x2="100"
                            y2="90"
                            stroke="currentColor"
                            strokeWidth="2"
                            className={`${CONNECTION_COLORS.teacherAdmin} opacity-60 animate-pulse`}
                            strokeDasharray="4 4"
                        />
                    )}
                </svg>

                {/* Top row - 2 icons */}
                <div className="flex gap-20 relative z-10">
                    {ROLE_ICONS.slice(0, 2).map(
                        ({ Icon, label, colors, route }, index) => (
                            <div
                                key={label}
                                className={`flex items-center gap-4 cursor-pointer ${index === 0 ? "flex-row-reverse" : "flex-row"}`}
                                onMouseEnter={() => setHoveredIcon(index)}
                                onMouseLeave={() => setHoveredIcon(null)}
                                onClick={() => handleIconClick(route, index)}
                            >
                                <div
                                    className={`p-5 border-2 bg-transparent rounded-xl shadow-inner transition-all duration-300 ${hoveredIcon === index ? `shadow-lg ring-2 ring-current/50` : ""}`}
                                    style={{ borderColor: colors.primary }}
                                >
                                    <Icon className="h-12 w-12 text-slate-700 dark:text-slate-200" />
                                </div>
                                <span className="text-2xl font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                                    {label}
                                </span>
                            </div>
                        ),
                    )}
                </div>

                {/* Bottom row - 1 centered icon */}
                <div className="flex justify-center relative z-10">
                    {ROLE_ICONS.slice(2).map(
                        ({ Icon, label, colors, route }, index) => (
                            <div
                                key={label}
                                className="flex flex-col items-center gap-2 cursor-pointer"
                                onMouseEnter={() => setHoveredIcon(2)}
                                onMouseLeave={() => setHoveredIcon(null)}
                                onClick={() => handleIconClick(route, index + 2)}
                            >
                                <div
                                    className={`p-5 border-2 bg-transparent rounded-xl shadow-inner transition-all duration-300 ${hoveredIcon === 2 ? `shadow-lg ring-2 ring-current/50` : ""}`}
                                    style={{ borderColor: colors.primary }}
                                >
                                    <Icon className="h-12 w-12 text-slate-700 dark:text-slate-200" />
                                </div>
                                <span className="text-2xl font-bold text-slate-700 dark:text-slate-300">
                                    {label}
                                </span>
                            </div>
                        ),
                    )}
                </div>
            </div>
        </div>
    );
}

// Mobile role selection component
function MobileRoleSelection({ hoveredIcon, setHoveredIcon, handleIconClick }: RoleSelectionProps) {
    return (
        /* Mobile/Tablet: Row Layout */
        <div className="md:hidden flex flex-col gap-4 mb-8 py-4">
            {ROLE_ICONS.map(({ Icon, label, colors, route }, index) => (
                <div
                    key={label}
                    className={`flex items-center gap-4 cursor-pointer p-4 border-4 bg-transparent rounded-xl transition-all duration-300 hover:shadow-lg ${hoveredIcon === index ? `ring-2 ring-current/50 shadow-lg` : ""}`}
                    style={{ borderColor: colors.primary }}
                    onMouseEnter={() => setHoveredIcon(index)}
                    onMouseLeave={() => setHoveredIcon(null)}
                    onClick={() => handleIconClick(route, index)}
                >
                    <div className="p-3 rounded-lg">
                        <Icon className="h-8 w-8 text-slate-700 dark:text-slate-200" />
                    </div>
                    <span className="text-xl font-bold text-slate-700 dark:text-slate-300">
                        {label}
                    </span>
                </div>
            ))}
        </div>
    );
}
