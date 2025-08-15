'use client';

import React from 'react';
import { TeacherSchedule } from '@/backend/TeacherSchedule';
import type { TeacherStats } from '@/backend/types';

interface TeacherLessonStatsProps {
  teacherSchedule: TeacherSchedule;
}

export default function TeacherLessonStats({ teacherSchedule }: TeacherLessonStatsProps) {
  // Calculate teacher statistics using TeacherSchedule
  const teacherStats = React.useMemo((): TeacherStats => {
    return teacherSchedule.calculateTeacherStats();
  }, [teacherSchedule]);

  return (
    <div className="flex items-center gap-4 text-sm">
      {/* Events per Lesson */}
      <div className="text-center">
        <div className="font-semibold text-indigo-600 dark:text-indigo-400">
          {teacherStats.totalEvents}/{teacherStats.totalLessons}
        </div>
        <div className="text-xs text-muted-foreground">Events/Lesson</div>
      </div>

      {/* Hours */}
      <div className="text-center">
        <div className="font-semibold text-purple-600 dark:text-purple-400">
          {Math.round(teacherStats.totalHours * 10) / 10}h
        </div>
        <div className="text-xs text-muted-foreground">Hours</div>
      </div>
      
      {/* Teacher Earnings */}
      <div className="text-center">
        <div className="font-semibold text-green-600 dark:text-green-400">
          €{Math.round(teacherStats.totalEarnings)}
        </div>
        <div className="text-xs text-muted-foreground">Teacher</div>
      </div>
      
      {/* School Revenue */}
      <div className="text-center">
        <div className="font-semibold text-orange-600 dark:text-orange-400">
          €{Math.round(teacherStats.schoolRevenue)}
        </div>
        <div className="text-xs text-muted-foreground">School</div>
      </div>
    </div>
  );
}