
interface FlagIconProps {
  className?: string;
  status?: "planned" | "tbc" | "completed" | "cancelled";
}

const STATUS_COLORS = {
  planned: "#6b7280", // gray-500
  tbc: "#a855f7", // purple-500
  completed: "#10b981", // green-500
  cancelled: "#ea580c", // orange-600
} as const;

export const FlagIcon = ({ className = "w-4 h-4", status }: FlagIconProps) => {
  const color = status ? STATUS_COLORS[status] : "#00eeff"; // default cyan
  
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={{ transform: 'scaleX(-1)' }}>
      <path d="M4 15V21M4 15L8 12L12 15L16 12L20 15V3L16 6L12 3L8 6L4 3V15Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill={color} fillOpacity="0.3"/>
    </svg>
  );
};
