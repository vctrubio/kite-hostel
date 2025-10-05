export function CompassSVG({ className = "", isLoading = false }: { className?: string; isLoading?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${className} ${isLoading ? "animate-spin" : ""} transition-transform duration-300 drop-shadow-sm`}
      role="img"
      aria-label="Loading compass"
    >
      <circle cx="12" cy="12" r="10" className="stroke-current opacity-40" strokeWidth="2" />
      <circle cx="12" cy="12" r="8" className="stroke-current opacity-20" strokeWidth="1" />
      <g className="stroke-current opacity-60">
        <line x1="12" y1="2" x2="12" y2="4" strokeWidth="2" />
        <line x1="22" y1="12" x2="20" y2="12" strokeWidth="2" />
        <line x1="12" y1="22" x2="12" y2="20" strokeWidth="2" />
        <line x1="2" y1="12" x2="4" y2="12" strokeWidth="2" />
        <line x1="17.66" y1="6.34" x2="16.95" y2="7.05" strokeWidth="1.5" />
        <line x1="17.66" y1="17.66" x2="16.95" y2="16.95" strokeWidth="1.5" />
        <line x1="6.34" y1="17.66" x2="7.05" y2="16.95" strokeWidth="1.5" />
        <line x1="6.34" y1="6.34" x2="7.05" y2="7.05" strokeWidth="1.5" />
      </g>
      <g>
        <path d="M12 4 L13.5 10 L12 9 L10.5 10 Z" fill="currentColor" className="text-red-500 dark:text-red-400" />
        <path d="M12 20 L10.5 14 L12 15 L13.5 14 Z" fill="currentColor" className="opacity-60" />
      </g>
      <circle cx="12" cy="12" r="1.5" fill="currentColor" className="opacity-80" />
    </svg>
  );
}