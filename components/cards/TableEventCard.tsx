import { Duration } from '@/components/formatters/Duration';
import { DateTime } from '@/components/formatters/DateTime';
import { HeadsetIcon } from '@/svgs/HeadsetIcon';
import { Clock, MapPin } from 'lucide-react';

interface TableEventCardProps {
  students: string;
  location: string;
  duration: number;
  date: string;
  teacherName: string;
  compact?: boolean;
}

// Sub-components for consistent styling
const StudentsDisplay = ({ students, compact = false }: { students: string; compact?: boolean }) => {
  const studentList = students.split(', ').filter(name => name.trim() !== '' && name !== 'No students');
  const studentCount = studentList.length;

  return (
    <div className={`flex items-center gap-2 ${compact ? 'text-sm' : 'text-base'}`}>
      {studentCount > 0 ? (
        <span className="text-foreground font-medium">{students}</span>
      ) : (
        <span className="text-muted-foreground">No students</span>
      )}
    </div>
  );
};

const TimeDisplay = ({ date, duration, compact = false }: { date: string; duration: number; compact?: boolean }) => (
  <div className={`flex items-center gap-2 ${compact ? 'text-sm' : 'text-base'}`}>
    <Clock className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} text-muted-foreground`} />
    <div className="flex items-center gap-2">
      <span className="text-foreground font-medium">
        <DateTime dateString={date} formatType="time" />
      </span>
      <span className={`px-2 py-0.5 ${compact ? 'text-xs' : 'text-xs'} font-semibold bg-slate-100 text-slate-700 rounded-full border border-slate-200`}>
        <Duration minutes={duration} />
      </span>
    </div>
  </div>
);

const LocationDisplay = ({ location, compact = false }: { location: string; compact?: boolean }) => (
  <div className={`flex items-center gap-2 ${compact ? 'text-sm' : 'text-base'}`}>
    <MapPin className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} text-muted-foreground`} />
    <span className="text-foreground font-medium">{location}</span>
  </div>
);

const TeacherDisplay = ({ teacherName, compact = false }: { teacherName: string; compact?: boolean }) => (
  <div className={`flex items-center gap-2 ${compact ? 'text-sm' : 'text-base'}`}>
    <HeadsetIcon className={`${compact ? 'w-3 h-3' : 'w-4 h-4'}`} />
    <span className="text-foreground font-medium">{teacherName}</span>
  </div>
);

export default function TableEventCard({ 
  students, 
  location, 
  duration, 
  date, 
  teacherName,
  compact = false
}: TableEventCardProps) {
  return (
    <div className={`bg-card border border-border rounded-lg ${compact ? 'p-3' : 'p-4'}`}>
      {/* Students Display - Main focus */}
      <div className={compact ? 'mb-2' : 'mb-3'}>
        <StudentsDisplay students={students} compact={compact} />
      </div>
      
      {/* Event Details Grid */}
      <div className={`grid grid-cols-1 gap-2 ${compact ? 'gap-1' : 'gap-2'}`}>
        <TimeDisplay date={date} duration={duration} compact={compact} />
        <div className={`grid grid-cols-2 gap-2 ${compact ? 'gap-1' : 'gap-2'}`}>
          <LocationDisplay location={location} compact={compact} />
          <TeacherDisplay teacherName={teacherName} compact={compact} />
        </div>
      </div>
    </div>
  );
}

// Export a specialized print version
export function PrintEventCard({ 
  students, 
  location, 
  duration, 
  date, 
  teacherName 
}: TableEventCardProps) {
  return (
    <div className="bg-white border border-gray-300 rounded-lg p-4 mb-3 break-inside-avoid">
      {/* Students Display - Main focus */}
      <div className="mb-3 pb-2 border-b border-gray-200">
        <div className="flex items-center gap-2 text-base">
          <span className="font-semibold text-gray-900">{students}</span>
        </div>
      </div>
      
      {/* Event Details */}
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-gray-600">🕐</span>
          <span className="font-medium">{new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
            {Math.floor(duration / 60)}h {duration % 60}m
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <span className="text-gray-600">📍</span>
            <span className="font-medium">{location}</span>
          </div>
          <div className="flex items-center gap-2">
            <HeadsetIcon className="w-4 h-4" />
            <span className="font-medium">{teacherName}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
