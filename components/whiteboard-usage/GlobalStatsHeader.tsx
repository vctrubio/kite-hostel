'use client';

interface GlobalStatsHeaderProps {
  globalStats: {
    totalEvents: number;
    totalLessons: number;
    totalHours: number;
    totalEarnings: number;
    schoolRevenue: number;
  };
}

export default function GlobalStatsHeader({ globalStats }: GlobalStatsHeaderProps) {
  return (
    <div className="border border-border rounded-lg p-3 bg-card">
      <div className="space-y-2">
        {/* First row: Events/Lesson and Hours */}
        <div className="flex items-center justify-center gap-4 text-sm">
          <div className="text-center">
            <div className="font-semibold text-indigo-600 dark:text-indigo-400">
              {globalStats.totalEvents}/{globalStats.totalLessons}
            </div>
            <div className="text-xs text-muted-foreground">Events/Lesson</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-purple-600 dark:text-purple-400">
              {Math.round(globalStats.totalHours * 10) / 10}h
            </div>
            <div className="text-xs text-muted-foreground">Hours</div>
          </div>
        </div>
        
        {/* Second row: Teacher and School Revenue */}
        <div className="flex items-center justify-center gap-4 text-sm">
          <div className="text-center">
            <div className="font-semibold text-green-600 dark:text-green-400">
              €{Math.round(globalStats.totalEarnings)}
            </div>
            <div className="text-xs text-muted-foreground">Teacher</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-orange-600 dark:text-orange-400">
              €{Math.round(globalStats.schoolRevenue)}
            </div>
            <div className="text-xs text-muted-foreground">School</div>
          </div>
        </div>
      </div>
    </div>
  );
}