"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";
import { KiteIcon, ClockIcon, HeadsetIcon } from "@/svgs";

interface TeacherStats {
  name: string;
  totalEarned: number;
  totalHours: number;
  eventCount: number;
  teacherId?: string;
}

interface StatisticsTeacherRankingProps {
  teacherRankings: TeacherStats[];
  isOpen: boolean;
  onToggle: () => void;
}

export function StatisticsTeacherRanking({
  teacherRankings,
  isOpen,
  onToggle,
}: StatisticsTeacherRankingProps) {
  const router = useRouter();
  
  const totalCommissions = teacherRankings.reduce(
    (sum, teacher) => sum + teacher.totalEarned,
    0
  );

  const handleTeacherClick = (teacher: TeacherStats) => {
    if (teacher.teacherId) {
      router.push(`/teachers/${teacher.teacherId}`);
    }
  };

  // Format hours to remove unnecessary decimals
  const formatHours = (hours: number) => {
    return hours % 1 === 0 ? hours.toString() : hours.toFixed(1);
  };

  return (
    <Card>
      <CardHeader 
        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-muted/30 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center justify-between flex-1">
            <div className="flex items-center gap-2">
              <HeadsetIcon className="w-5 h-5 text-green-600 dark:text-green-500" />
              <span>Teacher Rankings</span>
            </div>
            <span className="text-sm font-normal text-muted-foreground">
              Total Commissions: €{totalCommissions.toFixed(2)}
            </span>
          </CardTitle>
          <div className="ml-2">
            {isOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </div>
        </div>
      </CardHeader>
      {isOpen && (
        <CardContent>
          <div className="space-y-2">
            {teacherRankings.map((teacher, index) => (
              <div
                key={teacher.name}
                onClick={() => handleTeacherClick(teacher)}
                className="flex items-center justify-between p-4 bg-gray-100 dark:bg-muted/20 rounded-lg hover:bg-gray-200 dark:hover:bg-muted/40 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="font-semibold text-gray-500 dark:text-muted-foreground w-8">
                    #{index + 1}
                  </div>
                  <div>
                    <div className="font-medium">{teacher.name}</div>
                    <div className="text-sm text-gray-600 dark:text-muted-foreground flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1.5">
                        <KiteIcon className="h-3.5 w-3.5" />
                        <span>{teacher.eventCount}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <ClockIcon className="h-3.5 w-3.5" />
                        <span>{formatHours(teacher.totalHours)}h</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-lg font-bold">
                  €{teacher.totalEarned.toFixed(2)}
                </div>
              </div>
            ))}
            {teacherRankings.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No teacher data available
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
