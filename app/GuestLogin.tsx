import Link from "next/link";
import Image from "next/image";
import {
  Book,
  TrendingUp,
  Database,
  ArrowRight,
  Calendar,
  LayoutGrid,
  Rocket,
} from "lucide-react";
import { EquipmentIcon, FlagIcon, BookingIcon } from "@/svgs";
import { GoogleOnlyLoginForm } from "@/components/supabase-init/google-only-login-form";
import { DevAboutMeFooter } from "@/components/banners/DevAboutMeFooter";
import { RoleSelectionComponent } from "@/components/banners/RoleSelectionComponent";
import { NorthAdminDiagram } from "@/components/banners/NorthAdminDiagram";
import { demo } from "@/lib/demo";

export function GuestLogin() {
  // Sub-component: Demo Mode Buttons
  const EnterAdministration = () => {
    const buttons = [
      {
        href: "/billboard",
        icon: LayoutGrid,
        text: "Enter App",
        label: "Demo",
        borderColor:
          "border-cyan-600 hover:border-cyan-700 dark:border-green-500 dark:hover:border-green-400",
        textColor:
          "text-cyan-700 hover:bg-cyan-50 dark:text-green-400 dark:hover:bg-green-500/10",
        labelBg: "bg-cyan-600 dark:bg-green-500",
        labelText: "text-white",
      },
      {
        href: "https://adrenalink.tech",
        icon: Rocket,
        text: "Go to Beta",
        label: "Prototype",
        borderColor:
          "border-orange-600 hover:border-orange-700 dark:border-orange-500 dark:hover:border-orange-400",
        textColor:
          "text-orange-700 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-500/10",
        labelBg: "bg-orange-600 dark:bg-orange-500",
        labelText: "text-white",
      },
      {
        href: "https://calendly.com/vctrubio/adrenalink-earlybird",
        icon: Calendar,
        text: "Early Bird",
        label: "Sign Up",
        borderColor:
          "border-blue-600 hover:border-blue-700 dark:border-blue-500 dark:hover:border-blue-400",
        textColor:
          "text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10",
        labelBg: "bg-blue-600 dark:bg-blue-500",
        labelText: "text-white",
      },
      {
        href: "https://donkeydrills.com",
        icon: "image",
        imageSrc: "/donkey.png",
        text: "Visit My Portfolio",
        label: "donkeydrills",
        borderColor:
          "border-black hover:border-black dark:border-white dark:hover:border-white",
        textColor:
          "text-black hover:bg-gray-50 dark:text-white dark:hover:bg-white/10",
        labelBg: "bg-black dark:bg-white",
        labelText: "text-white dark:text-black",
      },
    ];

    return (
      <div className="space-y-4">
        {buttons.map((button, index) => (
          <Link
            key={index}
            href={button.href}
            className={`relative grid grid-cols-[42px_1fr] items-center gap-3 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 border-2 ${button.borderColor} ${button.textColor} shadow-lg hover:shadow-xl hover:scale-105`}
          >
            {button.icon === "image" ? (
              <Image
                src={button.imageSrc!}
                alt={button.text}
                width={42}
                height={42}
                className="h-[42px] w-[42px]"
              />
            ) : (
              <button.icon className="h-[42px] w-[42px]" />
            )}
            <span className="text-left">{button.text}</span>

            {/* Label stamp in top right */}
            <span
              className={`absolute -top-2 -right-2 px-3 py-1 rounded-xl text-base font-bold ${button.labelBg} ${button.labelText} shadow-md`}
            >
              {button.label}
            </span>
          </Link>
        ))}
      </div>
    );
  };

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
        <h1
          className="text-3xl md:text-4xl font-bold leading-tight drop-shadow-lg text-gray-900 dark:text-gray-100"
          style={{ fontFamily: "Geist, Geist Fallback, sans-serif" }}
        >
          Welcome to the{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-teal-600 drop-shadow-[0_0_30px_rgba(6,182,212,0.3)] dark:from-green-400 dark:to-emerald-500 dark:drop-shadow-[0_0_30px_rgba(34,197,94,0.5)]">
            Adrenaline
          </span>{" "}
          School Management App
        </h1>

        {/* Feature List with Depth */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-6 mt-6">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border backdrop-blur-sm bg-white/90 border-gray-200 text-gray-700 shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:bg-gray-800/70 dark:border-gray-700 dark:text-gray-300 dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] hover:shadow-xl hover:scale-105 transition-all duration-200 hover:-translate-y-1"
              >
                <IconComponent
                  className={`${feature.iconType === "svg" ? "h-5 w-5" : "h-4 w-4"} text-gray-700 dark:text-gray-300`}
                />
                <span className="text-sm font-medium">{feature.text}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Sub-component: Background Effects
  const BackgroundEffects = () => {
    return (
      <div className="absolute inset-0 pointer-events-none">
        {/* Radial glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-3xl opacity-20 bg-gradient-to-r from-blue-400 to-cyan-400 dark:from-green-500 dark:to-cyan-500"></div>

        {/* Floating orbs for depth */}
        <div
          className="absolute top-20 left-10 w-32 h-32 rounded-full blur-2xl opacity-30 animate-pulse bg-blue-400 dark:bg-cyan-500"
          style={{ animationDuration: "4s" }}
        ></div>
        <div
          className="absolute bottom-20 right-10 w-40 h-40 rounded-full blur-2xl opacity-20 animate-pulse bg-cyan-400 dark:bg-green-500"
          style={{ animationDuration: "6s", animationDelay: "2s" }}
        ></div>
      </div>
    );
  };

  return (
    <main className="min-h-screen flex flex-col transition-colors duration-300 bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section with Depth */}
      <div className="flex-1 flex items-center justify-center p-6 py-12 relative overflow-hidden">
        <BackgroundEffects />

        <div className="w-full max-w-7xl space-y-12 relative z-10">
          <HeroHeader />

          {/* Role Selection & Login - Unified Card with Blur Effect */}
          <div className="rounded-3xl backdrop-blur-sm p-8 md:p-12 bg-white/40 shadow-[0_20px_60px_rgba(0,0,0,0.15)] dark:bg-gray-800/30 dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Side - Role Selection */}
              <div className="flex justify-center">
                <RoleSelectionComponent />
              </div>

              {/* Right Side - Login Form or Demo Entry */}
              <div className="flex justify-center">
                <div className="w-full max-w-md mx-auto space-y-6">
                  {/* Documentation Link Title */}
                  <div className="text-center text-gray-800 dark:text-gray-200">
                    <h2
                      className="text-2xl font-bold tracking-tight"
                      style={{
                        fontFamily: "system-ui, -apple-system, sans-serif",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      <Link
                        href="/docs"
                        className="mb-3 inline-flex items-center gap-2 underline decoration-2 underline-offset-4 transition-all duration-300 decoration-blue-500/50 hover:decoration-blue-500 hover:bg-blue-500/10 hover:px-2 hover:rounded"
                      >
                        <Book className="h-6 w-6" />
                        Read Our Documentation
                      </Link>
                    </h2>
                  </div>

                  {demo ? <EnterAdministration /> : <GoogleOnlyLoginForm />}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <NorthAdminDiagram />
      <DevAboutMeFooter />
    </main>
  );
}
