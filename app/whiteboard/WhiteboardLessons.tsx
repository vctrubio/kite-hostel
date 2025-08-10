'use client';

import { useState } from 'react';
import { WhiteboardClass, type BookingData, type LessonData } from '@/backend/WhiteboardClass';
import { HelmetIcon, HeadsetIcon } from '@/svgs';
import { LessonStatusLabel } from '@/components/label/LessonStatusLabel';
import { Duration } from '@/components/formatters/Duration';
import { LESSON_STATUS_FILTERS, type LessonStatusFilter } from '@/lib/constants';
import { type TeacherLessons } from '@/backend/types';

interface WhiteboardLessonsProps {
  lessons: any[];
}

// Sub-component: Filter Buttons
function LessonStatusFilters({ 
  activeFilter, 
  onFilterChange, 
  statusCounts 
}: {
  activeFilter: LessonStatusFilter;
  onFilterChange: (filter: LessonStatusFilter) => void;
  statusCounts: Record<LessonStatusFilter, number>;
}) {
  return (
    <div className="flex gap-2 flex-wrap">
      {LESSON_STATUS_FILTERS.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onFilterChange(filter.value)}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            activeFilter === filter.value 
              ? filter.color.replace('hover:', '').replace('100', '200').replace('900/30', '900/50')
              : filter.color
          }`}
        >
          {filter.label} ({statusCounts[filter.value]})
        </button>
      ))}
    </div>
  );
}

// Sub-component: Individual Lesson Card
function LessonCard({ 
  lesson, 
  bookingClass 
}: {
  lesson: LessonData;
  bookingClass: WhiteboardClass;
}) {
  const students = bookingClass.getStudents();
  const totalMinutes = bookingClass.getTotalMinutes();
  const usedMinutes = bookingClass.getUsedMinutes();

  // Check if lesson has events for the selected date (from whiteboard date picker)
  const selectedDate = (lesson as any).selectedDate;
  const selectedDateObj = new Date(selectedDate);
  selectedDateObj.setHours(0, 0, 0, 0);
  
  const originalEvents = (lesson as any).originalEvents || [];
  const hasEventForSelectedDate = originalEvents.some((event: any) => {
    // If event has no date, include it (it's part of the lesson/booking period)
    if (!event.date) {
      return true;
    }
    
    // Check if event date matches the selected date
    const eventDate = new Date(event.date);
    eventDate.setHours(0, 0, 0, 0);
    return eventDate.getTime() === selectedDateObj.getTime();
  });
  
  // Calculate minutes for selected date's events (events are already filtered by selected date in WhiteboardClient)
  const selectedDateEventMinutes = lesson.events?.reduce((total: number, event: any) => {
    return total + (event.duration || 0);
  }, 0) || 0;

  // Calculate remaining minutes accounting for selected date's scheduled events
  const remainingMinutes = totalMinutes - usedMinutes - selectedDateEventMinutes;

  return (
    <div 
      className={`flex items-center justify-between p-3 bg-muted dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-muted/80 dark:hover:bg-gray-600 transition-colors ${
        hasEventForSelectedDate ? 'border-2 border-green-500 dark:border-green-400' : ''
      }`}
      onClick={() => console.log('Adding event to lesson', lesson.id)}
    >
      {/* Left side: Students */}
      <div className="flex items-center gap-3">
        {/* Helmet icons for students */}
        <div className="flex gap-1">
          {students.map((_, index) => (
            <HelmetIcon 
              key={index} 
              className="w-5 h-5 text-yellow-500"
            />
          ))}
        </div>
        
        {/* Student names */}
        <div className="flex flex-wrap gap-1">
          {students.map((student, index) => (
            <span key={student.id} className="text-sm text-foreground dark:text-white">
              {student.name}
              {index < students.length - 1 && ','}
            </span>
          ))}
        </div>
      </div>

      {/* Right side: Status and Duration */}
      <div className="flex items-center gap-2">
        <LessonStatusLabel 
          lessonId={lesson.id} 
          currentStatus={lesson.status}
          lessonEvents={lesson.events || []}
        />
        <div className="text-sm text-muted-foreground dark:text-gray-400">
          <Duration minutes={remainingMinutes} /> remaining
          {selectedDateEventMinutes > 0 && (
            <span className="ml-1 text-xs text-blue-500 dark:text-blue-400">
              (-<Duration minutes={selectedDateEventMinutes} /> scheduled)
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// Sub-component: Teacher Group
function TeacherGroup({ teacherGroup }: { teacherGroup: TeacherLessons }) {
  const { availableLessons, lessonsWithEvents } = WhiteboardClass.calculateLessonStats(teacherGroup);
  
  return (
    <div className="bg-card dark:bg-gray-800 border border-border dark:border-gray-700 rounded-lg">
      {/* Teacher Header */}
      <div className="flex justify-between items-center p-4 border-b border-border dark:border-gray-700">
        <div className="flex items-center gap-2">
          <HeadsetIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
          <h4 className="text-lg font-medium text-foreground dark:text-white">
            {teacherGroup.teacherName}
          </h4>
        </div>
        <span className="text-sm text-muted-foreground dark:text-gray-400">
          {lessonsWithEvents}/{availableLessons} available lesson{availableLessons !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Lessons List */}
      <div className="p-4 space-y-3">
        {teacherGroup.lessons.map(({ lesson, bookingClass }) => (
          <LessonCard 
            key={lesson.id}
            lesson={lesson}
            bookingClass={bookingClass}
          />
        ))}
      </div>
    </div>
  );
}

// Sub-component: Empty State
function EmptyState({ activeFilter }: { activeFilter: LessonStatusFilter }) {
  return (
    <div className="p-8 bg-muted dark:bg-gray-800 rounded-lg text-center">
      <p className="text-muted-foreground dark:text-gray-400">
        {activeFilter === 'all' 
          ? 'No lessons found for this date' 
          : `No ${activeFilter} lessons found for this date`}
      </p>
    </div>
  );
}

// Main component
export default function WhiteboardLessons({ lessons }: WhiteboardLessonsProps) {
  const [activeFilter, setActiveFilter] = useState<LessonStatusFilter>('all');

  // Filter lessons based on selected status
  const filteredLessons = activeFilter === 'all' 
    ? lessons 
    : lessons.filter(lesson => lesson.status === activeFilter);

  // Count lessons by status for button labels
  const statusCounts = {
    all: lessons.length,
    planned: lessons.filter(l => l.status === 'planned').length,
    rest: lessons.filter(l => l.status === 'rest').length,
    delegated: lessons.filter(l => l.status === 'delegated').length,
    completed: lessons.filter(l => l.status === 'completed').length,
    cancelled: lessons.filter(l => l.status === 'cancelled').length,
  };

  // Group filtered lessons by teacher
  const groupedLessons = WhiteboardClass.groupLessonsByTeacher(filteredLessons);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium dark:text-white">
          Lessons by Teacher ({filteredLessons.length} total)
        </h3>
        
        <LessonStatusFilters 
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          statusCounts={statusCounts}
        />
      </div>

      {groupedLessons.length === 0 ? (
        <EmptyState activeFilter={activeFilter} />
      ) : (
        <div className="space-y-4">
          {groupedLessons.map((teacherGroup) => (
            <TeacherGroup 
              key={teacherGroup.teacherId}
              teacherGroup={teacherGroup}
            />
          ))}
        </div>
      )}
    </div>
  );
}
