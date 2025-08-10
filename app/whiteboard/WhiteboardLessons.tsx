'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { TeacherSchedule } from '@/backend/TeacherSchedule';
import { HeadsetIcon } from '@/svgs';
import { LESSON_STATUS_FILTERS, type LessonStatusFilter } from '@/lib/constants';
import EventToTeacherModal from '@/components/modals/EventToTeacherModal';
import LessonCard from '@/components/cards/LessonCard';
import { 
  groupLessonsByTeacher, 
  calculateLessonStats,
  extractStudents,
  extractStudentNames,
  WhiteboardClass
} from '@/backend/WhiteboardClass';

interface WhiteboardLessonsProps {
  lessons: any[];
  controller: any;
  selectedDate: string;
  teacherSchedules: Map<string, TeacherSchedule>;
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

// Sub-component: Teacher Group
function TeacherGroup({ 
  teacherGroup, 
  onLessonClick,
  teacherSchedule,
  selectedDate
}: { 
  teacherGroup: any;
  onLessonClick: (lesson: any) => void;
  teacherSchedule?: TeacherSchedule;
  selectedDate: string;
}) {
  const { availableLessons, lessonsWithEvents } = calculateLessonStats(teacherGroup.lessons);
  
  // Calculate teacher utilization using TeacherSchedule methods
  const scheduleNodes = teacherSchedule ? teacherSchedule.getNodes() : [];
  const eventNodes = scheduleNodes.filter(node => node.type === 'event');
  const gapNodes = scheduleNodes.filter(node => node.type === 'gap');
  
  // Get detailed schedule metrics using TeacherSchedule
  const totalScheduledMinutes = eventNodes.reduce((sum, node) => sum + node.duration, 0);
  const totalGapMinutes = gapNodes.reduce((sum, node) => sum + node.duration, 0);
  const canReorganize = teacherSchedule ? teacherSchedule.canReorganizeSchedule() : false;
  
  return (
    <div className="bg-card dark:bg-gray-800 border border-border dark:border-gray-700 rounded-lg">
      {/* Enhanced Teacher Header */}
      <div className="flex justify-between items-center p-4 border-b border-border dark:border-gray-700">
        <div className="flex items-center gap-2">
          <HeadsetIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
          <h4 className="text-lg font-medium text-foreground dark:text-white">
            {teacherGroup.teacherName}
          </h4>
          {canReorganize && (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded border">
              Can optimize
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>
            {lessonsWithEvents}/{availableLessons} available lesson{availableLessons !== 1 ? 's' : ''}
          </span>
          {teacherSchedule && eventNodes.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-blue-600 dark:text-blue-400">
                {eventNodes.length} event{eventNodes.length > 1 ? 's' : ''} • {Math.round(totalScheduledMinutes / 60 * 10) / 10}h scheduled
              </span>
              {totalGapMinutes > 0 && (
                <span className="text-orange-600 dark:text-orange-400">
                  • {Math.round(totalGapMinutes / 60 * 10) / 10}h gaps
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Lessons List */}
      <div className="p-4 space-y-3">
        {teacherGroup.lessons.map((lesson: any) => (
          <LessonCard 
            key={lesson.id}
            lesson={lesson}
            onLessonClick={onLessonClick}
            selectedDate={selectedDate}
            teacherSchedule={teacherSchedule} // Pass schedule for availability info
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
export default function WhiteboardLessons({ lessons, controller, selectedDate, teacherSchedules }: WhiteboardLessonsProps) {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<LessonStatusFilter>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);

  // Handle lesson click for event creation
  const handleLessonClick = (lesson: any) => {
    // Create WhiteboardClass instance for booking calculations
    const bookingClass = new WhiteboardClass(lesson.booking);
    const students = extractStudents(lesson.booking);
    const remainingMinutes = bookingClass.getRemainingMinutes();
    
    // Add students to lesson object for modal
    const lessonWithStudents = {
      ...lesson,
      students: students,
      studentCount: students.length,
      remainingMinutes: remainingMinutes
    };
    
    setSelectedLesson(lessonWithStudents);
    setIsModalOpen(true);
  };

  // Handle confirming event creation
  const handleConfirmEvent = (eventData: any) => {
    console.log('Creating event:', eventData);
    // Here you would typically make an API call to create the event
    
    // Add to teacher schedule
    if (selectedLesson?.teacher?.id) {
      let teacherSchedule = teacherSchedules.get(selectedLesson.teacher.id);
      
      if (!teacherSchedule) {
        teacherSchedule = new TeacherSchedule(
          selectedLesson.teacher.id,
          selectedLesson.teacher.name,
          selectedDate
        );
        teacherSchedules.set(selectedLesson.teacher.id, teacherSchedule);
      }
      
      // Check for conflicts using TeacherSchedule method
      const conflict = teacherSchedule.checkConflict(eventData.startTime, eventData.duration);
      if (conflict.hasConflict) {
        console.log('Failed to add event: conflict detected', conflict);
        
        // Show available alternatives if any
        if (conflict.suggestedAlternatives.length > 0) {
          const alternative = conflict.suggestedAlternatives[0];
          console.log(`Suggested alternative: ${alternative.startTime} for ${alternative.duration} minutes`);
        }
        return;
      }
      
      // Add the event using TeacherSchedule method
      const addedNode = teacherSchedule.addEvent(
        eventData.startTime,
        eventData.duration,
        eventData.lessonId,
        eventData.location,
        eventData.studentCount,
        selectedLesson.students?.map((s: any) => s.name) // Pass student names
      );
      
      console.log('Event added to teacher schedule successfully:', addedNode);
      
      // Get available slots for next event
      const availableSlots = teacherSchedule.getAvailableSlots(60); // 1 hour minimum
      if (availableSlots.length > 0) {
        console.log('Available slots for next events:', availableSlots);
      }
    }
  };

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
  const groupedLessons = groupLessonsByTeacher(filteredLessons);

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
              onLessonClick={handleLessonClick}
              selectedDate={selectedDate}
              teacherSchedule={teacherSchedules.get(teacherGroup.teacherId)} // Pass teacher schedule
            />
          ))}
        </div>
      )}

      {/* Event To Teacher Modal */}
      {selectedLesson && (
        <EventToTeacherModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedLesson(null);
          }}
          lesson={selectedLesson}
          teacherSchedule={teacherSchedules.get(selectedLesson.teacher?.id || '') || 
            new TeacherSchedule(
              selectedLesson.teacher?.id || '',
              selectedLesson.teacher?.name || '',
              selectedDate
            )
          }
          controller={controller}
          selectedDate={selectedDate}
          onConfirm={handleConfirmEvent}
          remainingMinutes={selectedLesson.remainingMinutes}
          allLessons={lessons}
        />
      )}
    </div>
  );
}
