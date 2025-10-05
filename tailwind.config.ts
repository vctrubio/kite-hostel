import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    // Ensure status colors are always included - Enhanced with new palette
    'bg-yellow-100', 'bg-yellow-900/30', 'text-stone-800', 'text-stone-200',
    'hover:bg-yellow-200', 'hover:bg-yellow-900/50',
    'bg-blue-100', 'bg-blue-900/30', 'text-blue-800', 'text-blue-300',
    'hover:bg-blue-200', 'hover:bg-blue-900/50',
    'bg-green-100', 'bg-green-900/30', 'text-green-800', 'text-green-300',
    'hover:bg-green-200', 'hover:bg-green-900/50',
    'bg-orange-100', 'bg-orange-900/30', 'text-orange-800', 'text-orange-300',
    'hover:bg-orange-200', 'hover:bg-orange-900/50',
    'bg-red-100', 'bg-red-900/30', 'text-red-800', 'text-red-300',
    'hover:bg-red-200', 'hover:bg-red-900/50',
    'bg-gray-100', 'bg-gray-800', 'text-gray-800', 'text-gray-200',
    'hover:bg-gray-200', 'hover:bg-gray-700',
    'bg-purple-100', 'bg-purple-900/30', 'text-purple-800', 'text-purple-300',
    'hover:bg-purple-200', 'hover:bg-purple-900/50',
    // Entity colors for forms page
    'text-amber-500', 'bg-amber-500', 'text-purple-500', 'bg-purple-500',
    'text-slate-400', 'bg-slate-400', 'text-teal-500', 'bg-teal-500',
    'text-cyan-500', 'bg-cyan-500', 'text-fuchsia-500', 'bg-fuchsia-500',
    'text-green-500', 'bg-green-500', 'text-blue-500', 'bg-blue-500',
    'text-orange-500', 'bg-orange-500', 'text-yellow-500', 'bg-yellow-500',
    'text-lime-500', 'bg-lime-500', 'text-gray-500', 'bg-gray-500',
    // North teal brand colors
    'bg-teal-50', 'bg-teal-100', 'bg-teal-500', 'bg-teal-600',
    'text-teal-50', 'text-teal-600', 'text-teal-700',
    'border-teal-500', 'hover:bg-teal-600',
  ],
  theme: {
    extend: {
      screens: {
        'desktop': '1100px',
      },
      gridTemplateColumns: {
        '13': 'repeat(13, minmax(0, 1fr))'
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        // North Action Sports brand colors
        north: {
          teal: {
            50: '#e6f9f5',
            100: '#b3ede0',
            200: '#80e0cc',
            300: '#4dd4b7',
            400: '#1ac8a3',
            500: '#05A887', // North's signature color
            600: '#048c72',
            700: '#03715d',
            800: '#025548',
            900: '#013a33',
          },
          ocean: {
            50: '#e8f4f8',
            100: '#c5e4ed',
            200: '#a2d4e3',
            300: '#7fc4d8',
            400: '#5cb4ce',
            500: '#39a4c3',
            600: '#2e83a0',
            700: '#23627c',
            800: '#184259',
            900: '#0d2135',
          },
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 1s ease-in-out forwards',
      },
      backgroundImage: {
        'grid-pattern': 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'0.05\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/\%3E%3C/g\%3E%3C/svg\%3E")',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
