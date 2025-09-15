
interface StethoscopeIconProps {
  className?: string;
}

export const StethoscopeIcon = ({ className = "w-4 h-4" }: StethoscopeIconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M4.8 2.3A.3.3 0 1 0 4.2 2.7l.6-.4z" stroke="currentColor" strokeWidth="2"/>
    <path d="M7 3.3V7c0 1.1-.9 2-2 2C3.9 9 3 8.1 3 7V3.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M11 21.9V16.2c0-1.8 1.1-3.3 2.6-3.9C14.9 11.9 16 10.4 16 8.6V3.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M19.8 2.3a.3.3 0 1 1 .6.4l-.6-.4z" stroke="currentColor" strokeWidth="2"/>
    <path d="M17 3.3V7c0 1.1.9 2 2 2s2-.9 2-2V3.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="11" cy="21" r="2" stroke="currentColor" strokeWidth="2"/>
  </svg>
);