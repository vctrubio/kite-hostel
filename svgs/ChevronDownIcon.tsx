
interface ChevronDownIconProps {
  className?: string;
}

export const ChevronDownIcon = ({ className = "w-4 h-4" }: ChevronDownIconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);