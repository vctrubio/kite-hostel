export const ProgressBar = ({
  usedMinutes,
  totalMinutes,
}: {
  usedMinutes: number;
  totalMinutes: number;
}) => {
  if (!totalMinutes || totalMinutes === 0) {
    return <span className="text-xs text-muted-foreground">N/A</span>;
  }

  const totalUsedHours = usedMinutes / 60;
  const totalPackageHours = totalMinutes / 60;
  const progressPercentage =
    totalPackageHours > 0 ? (totalUsedHours / totalPackageHours) * 100 : 0;

  const displayUsedHours =
    totalUsedHours % 1 === 0
      ? `${Math.floor(totalUsedHours)}`
      : `${totalUsedHours.toFixed(1)}`;
  const displayTotalHours =
    totalPackageHours % 1 === 0
      ? `${Math.floor(totalPackageHours)}h`
      : `${totalPackageHours.toFixed(1)}h`;

  const isOverused = totalUsedHours > totalPackageHours;

  const getFillColor = () => {
    if (isOverused) return "bg-red-500"; // Over limit
    if (usedMinutes === totalMinutes) return "bg-gray-500"; // Exactly at limit
    return "bg-green-500"; // Normal progress
  };

  const fillColor = getFillColor();

  return (
    <div className="inline-flex items-center gap-3">
      {/* Simple Progress Bar - 80px constant width */}
      <div
        className="h-3 rounded-full overflow-hidden border"
        style={{ width: "80px" }}
      >
        <div
          className={`h-full ${fillColor} rounded-full transition-all duration-300`}
          style={{
            width: `${isOverused ? 100 : Math.min(progressPercentage, 100)}%`,
          }}
        />
      </div>

      {/* Hours Display */}
      <span className="text-xs text-foreground">
        {displayUsedHours}/{displayTotalHours}
      </span>
    </div>
  );
};
