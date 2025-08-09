'use client';

import { useState } from 'react';

const LESSON_STATUS_FILTERS = [
  { value: 'all', label: 'All', color: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700' },
  { value: 'planned', label: 'Planned', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50' },
  { value: 'rest', label: 'Rest', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-900/50' },
  { value: 'delegated', label: 'Delegated', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900/50' },
  { value: 'completed', label: 'Completed', color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50' },
] as const;

type LessonStatusFilter = typeof LESSON_STATUS_FILTERS[number]['value'];

interface WhiteboardLessonsProps {
  lessons: any[];
}

export default function WhiteboardLessons({ lessons }: WhiteboardLessonsProps) {
  return (
    <div>
      <h3 className="text-lg font-medium mb-3">Lessons ({lessons.length})</h3>
      {lessons.length === 0 ? (
        <div className="p-8 bg-muted rounded-lg text-center">
          <p className="text-muted-foreground">No lessons found for this date</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {lessons.map((lesson) => {
            const eventsCount = lesson.events?.length || 0;
            const eventsWithDates = lesson.events?.filter((e: any) => e.date)?.length || 0;
            const eventsWithoutDates = eventsCount - eventsWithDates;
            
            return (
              <div key={lesson.id} className="p-4 bg-card border border-border rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <span className="font-medium text-foreground">
                    {lesson.teacher?.name || 'Unknown Teacher'}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    lesson.status === 'planned' 
                      ? 'bg-blue-100 text-blue-800' 
                      : lesson.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : lesson.status === 'rest'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {lesson.status}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Booking:</span>
                    <span className="text-foreground">
                      #{lesson.booking?.id?.slice(-6) || 'N/A'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Students:</span>
                    <span className="text-foreground">
                      {lesson.booking?.students?.length || 0}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Events:</span>
                    <span className="text-foreground">
                      {eventsCount}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">w/ Dates:</span>
                    <span className="text-foreground text-xs">
                      {eventsWithDates} | w/o: {eventsWithoutDates}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Package:</span>
                    <span className="text-foreground text-xs">
                      {lesson.booking?.package?.description || 'No package'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
