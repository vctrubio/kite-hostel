import EventCard from '@/components/cards/EventCard';
import { HeadsetIcon, FlagIcon } from '@/svgs';
import { groupEventsByTeacher, calculateEventStats } from '@/backend/teacher-grouping';
import { type TeacherEvents } from '@/backend/types';

interface WhiteboardEventsProps {
  events: any[];
}

// Sub-component: Teacher Events Group
function TeacherEventsGroup({ teacherGroup }: { teacherGroup: TeacherEvents }) {
  // Find the earliest event time
  const getEarliestEventTime = () => {
    const eventTimes = teacherGroup.events
      .map(({ event }) => event.date)
      .filter(Boolean)
      .sort();
    
    if (eventTimes.length === 0) return 'No time';
    
    // Extract time from datetime string (assuming format like "2025-08-10T14:30:00")
    const earliestDate = eventTimes[0];
    try {
      const date = new Date(earliestDate);
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    } catch {
      return earliestDate;
    }
  };
  
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
        <div className="flex items-center gap-2 text-sm text-muted-foreground dark:text-gray-400">
          <FlagIcon className="w-4 h-4" />
          <span>{getEarliestEventTime()}</span>
        </div>
      </div>

      {/* Events Grid */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {teacherGroup.events.map(({ event, lesson, booking }, index) => {
            const teacher = lesson?.teacher?.name || 'Unknown Teacher';
            const students = booking?.students?.map((bs: any) => bs.student?.name).join(', ') || 'No students';
            const location = event.location || 'No location';
            const date = event.date || 'No date';
            const duration = event.duration || 0;
            const status = event.status || 'No status';

            return (
              <EventCard
                key={`${teacherGroup.teacherId}-${index}`}
                teacher={teacher}
                students={students}
                location={location}
                duration={duration}
                date={date}
                status={status}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function WhiteboardEvents({ events }: WhiteboardEventsProps) {
  // Group events by teacher
  const groupedEvents = groupEventsByTeacher(events);

  return (
    <div className="space-y-6">
      {groupedEvents.length === 0 ? (
        <div className="p-8 bg-muted dark:bg-gray-800 rounded-lg text-center">
          <p className="text-muted-foreground dark:text-gray-400">No events found for this date</p>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedEvents.map((teacherGroup) => (
            <TeacherEventsGroup 
              key={teacherGroup.teacherId}
              teacherGroup={teacherGroup}
            />
          ))}
        </div>
      )}
    </div>
  );
}
