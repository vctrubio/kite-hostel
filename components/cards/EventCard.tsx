import { Duration } from '@/components/formatters/Duration';
import { DateTime } from '@/components/formatters/DateTime';
import { HelmetIcon } from '@/svgs/HelmetIcon';

interface EventCardProps {
  teacher: string;
  students: string;
  location: string;
  duration: number;
  date: string;
  status: string;
}

const STATUS_COLORS = {
  planned: 'bg-blue-500',
  tbc: 'bg-purple-500',
  completed: 'bg-green-500',
  cancelled: 'bg-orange-500',
} as const;

const STATUS_BADGES = {
  planned: 'bg-blue-100 text-blue-800',
  tbc: 'bg-purple-100 text-purple-800', 
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-orange-100 text-orange-800',
} as const;

export default function EventCard({ 
  teacher, 
  students, 
  location, 
  duration, 
  date, 
  status 
}: EventCardProps) {
  const sidebarColor = STATUS_COLORS[status as keyof typeof STATUS_COLORS] || 'bg-gray-500';
  const badgeColor = STATUS_BADGES[status as keyof typeof STATUS_BADGES] || 'bg-gray-100 text-gray-800';
  
  const studentList = students.split(', ').filter(name => name.trim() !== '' && name !== 'No students');
  const studentCount = studentList.length;

  return (
    <div className="flex bg-card border border-border rounded-lg overflow-hidden">
      {/* Status Sidebar */}
      <div className={`w-1 ${sidebarColor}`} />
      
      {/* Card Content */}
      <div className="flex-1 p-4">
        <div className="flex justify-between items-start mb-3">
          <span className="font-medium text-foreground">{teacher}</span>
          <span className={`text-xs px-2 py-1 rounded-full ${badgeColor}`}>
            {status}
          </span>
        </div>
        
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-muted-foreground block">Students:</span>
            <div className="text-foreground text-xs flex items-center gap-1 flex-wrap">
              {studentCount > 0 ? (
                <>
                  {Array.from({ length: studentCount }).map((_, index) => (
                    <HelmetIcon key={index} className="w-3 h-3" />
                  ))}
                  <span>{students}</span>
                </>
              ) : (
                <span>No students</span>
              )}
            </div>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Location:</span>
            <span className="text-foreground">{location}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Duration:</span>
            <span className="text-foreground">
              <Duration minutes={duration} />
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Time:</span>
            <span className="text-foreground text-xs">
              <DateTime dateString={date} formatType="time" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}