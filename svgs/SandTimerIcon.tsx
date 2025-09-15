
interface SandTimerIconProps {
  className?: string;
}

export const SandTimerIcon = ({ className = "w-4 h-4" }: SandTimerIconProps) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    {/* Top half of the hourglass with sand */}
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 1v6a2 2 0 002 2h-4a2 2 0 002-2V1z"
    />
    {/* Bottom half of the hourglass, empty */}
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 23v-6a2 2 0 00-2-2h4a2 2 0 00-2 2v6z"
    />
    {/* Connecting middle part */}
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10 9l-2 2v2l2 2m4-4l2-2v-2l-2-2"
    />
    {/* Sand in the top half */}
    <path
      fill="currentColor" // Use current color for sand to match text
      d="M12 2a4 4 0 00-4 4v1a4 4 0 004 4h0a4 4 0 004-4V6a4 4 0 00-4-4z"
    />
  </svg>
);