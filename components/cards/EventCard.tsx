import { Duration } from '@/components/formatters/Duration';
import { DateTime } from '@/components/formatters/DateTime';
import { HelmetIcon } from '@/svgs/HelmetIcon';
import { Trash2, Clock, MapPin, ArrowRight, Zap, X, CheckCircle, Minus } from 'lucide-react';
import { ReorganizationOption } from '@/backend/TeacherSchedule';

interface EventCardProps {
  students: string;
  location: string;
  duration: number;
  date: string;
  status: string;
  viewAs?: 'admin' | 'teacher' | 'student';
  onDelete?: () => void;
  onStatusChange?: (newStatus: "planned" | "completed" | "tbc" | "cancelled") => void;
  reorganizationOptions?: ReorganizationOption[];
  onReorganize?: (option: ReorganizationOption) => void;
  onDismissReorganization?: () => void;
  onCancelReorganization?: () => void;
  onConfirmLesson?: () => void;
}

const STATUS_COLORS = {
  planned: 'bg-blue-500',
  tbc: 'bg-purple-500',
  completed: 'bg-green-500',
  cancelled: 'bg-orange-500',
} as const;

// Sub-components
const StudentsDisplay = ({ students }: { students: string }) => {
  const studentList = students.split(', ').filter(name => name.trim() !== '' && name !== 'No students');
  const studentCount = studentList.length;

  return (
    <div className="flex items-center gap-2 text-base">
      {studentCount > 0 ? (
        <>
          {Array.from({ length: studentCount }).map((_, index) => (
            <HelmetIcon key={index} className="w-4 h-4 text-yellow-500" />
          ))}
          <span className="text-foreground font-medium">{students}</span>
        </>
      ) : (
        <span className="text-muted-foreground">No students</span>
      )}
    </div>
  );
};

const TimeDisplay = ({ date, duration }: { date: string; duration: number }) => (
  <div className="flex items-center gap-2">
    <Clock className="w-4 h-4 text-muted-foreground" />
    <div className="flex items-center gap-1">
      <span className="text-foreground font-medium">
        <DateTime dateString={date} formatType="time" />
      </span>
      <span className="px-2 py-0.5 text-xs font-semibold bg-slate-100 text-slate-700 rounded-full border border-slate-200">
        +<Duration minutes={duration} />
      </span>
    </div>
  </div>
);

const LocationDisplay = ({ location }: { location: string }) => (
  <div className="flex items-center gap-2">
    <MapPin className="w-4 h-4 text-muted-foreground" />
    <span className="text-foreground font-medium">{location}</span>
  </div>
);

// Dropdown Card Component - Renders outside main card
const DropdownCard = ({ 
  viewAs,
  reorganizationOptions,
  onReorganize,
  onDismissReorganization,
  onConfirmLesson
}: {
  viewAs: 'admin' | 'teacher' | 'student';
  reorganizationOptions?: ReorganizationOption[];
  onReorganize?: (option: ReorganizationOption) => void;
  onDismissReorganization?: () => void;
  onConfirmLesson?: () => void;
}) => {
  const hasReorganizationOptions = reorganizationOptions && reorganizationOptions.length > 0;
  const showDropdown = hasReorganizationOptions || viewAs === 'teacher';

  if (!showDropdown) return null;

  return (
    <div className="mt-1 border-t border-muted-foreground/20">
      {/* Admin Reorganization Options */}
      {viewAs === 'admin' && hasReorganizationOptions && (
        <div className="pt-3">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Reorganization Available</span>
          </div>
          <div className="space-y-2">
            <button
              onClick={() => onReorganize?.(reorganizationOptions[0])}
              className="w-full flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 text-left transition-colors duration-150"
            >
              <div className="flex items-center gap-2">
                <ArrowRight className="w-3 h-3 text-blue-600" />
                <span className="text-xs text-blue-800">Shift lessons</span>
              </div>
            </button>
            <button
              onClick={onDismissReorganization}
              className="w-full p-2 bg-muted/50 border border-muted rounded hover:bg-muted text-left transition-colors duration-150"
            >
              <div className="flex items-center gap-2">
                <Trash2 className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Just delete event</span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Teacher Confirmation */}
      {viewAs === 'teacher' && (
        <div className="pt-3">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">Lesson Confirmation</span>
          </div>
          <button
            onClick={onConfirmLesson}
            className="w-full flex items-center justify-center gap-2 p-2 bg-green-50 border border-green-200 rounded hover:bg-green-100 text-left transition-colors duration-150"
          >
            <CheckCircle className="w-3 h-3 text-green-600" />
            <span className="text-xs text-green-800">Confirm lesson completion</span>
          </button>
        </div>
      )}
    </div>
  );
};

const AdminControls = ({ 
  status, 
  onStatusChange, 
  onDelete,
  reorganizationOptions,
  onCancelReorganization
}: { 
  status: string; 
  onStatusChange?: (status: "planned" | "completed" | "tbc" | "cancelled") => void; 
  onDelete?: () => void; 
  reorganizationOptions?: ReorganizationOption[];
  onCancelReorganization?: () => void;
}) => {
  const isCompleted = status === 'completed';
  const hasReorganizationOptions = reorganizationOptions && reorganizationOptions.length > 0;
  
  return (
    <div className="mt-3 pt-3 border-t border-border">
      {/* Status Controls */}
      <div className="flex justify-between items-center">
        <div className="flex gap-1">
          <button
            onClick={() => onStatusChange?.('planned')}
            className={`px-2 py-1 text-xs rounded hover:opacity-80 transition-opacity ${
              status === 'planned' 
                ? 'bg-blue-500 text-white' 
                : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
            }`}
            title="Set to Planned"
          >
            Planned
          </button>
          <button
            onClick={() => onStatusChange?.('tbc')}
            className={`px-2 py-1 text-xs rounded hover:opacity-80 transition-opacity ${
              status === 'tbc' 
                ? 'bg-purple-500 text-white' 
                : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
            }`}
            title="Set to To Be Confirmed"
          >
            TBC
          </button>
          <button
            onClick={() => onStatusChange?.('completed')}
            className={`px-2 py-1 text-xs rounded hover:opacity-80 transition-opacity ${
              status === 'completed' 
                ? 'bg-green-500 text-white' 
                : 'bg-green-100 text-green-800 hover:bg-green-200'
            }`}
            title="Set to Completed"
          >
            Done
          </button>
          <button
            onClick={() => onStatusChange?.('cancelled')}
            className={`px-2 py-1 text-xs rounded hover:opacity-80 transition-opacity ${
              status === 'cancelled' 
                ? 'bg-orange-500 text-white' 
                : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
            }`}
            title="Cancel Event"
          >
            Cancel
          </button>
        </div>
        <button
          onClick={hasReorganizationOptions ? onCancelReorganization : onDelete}
          disabled={isCompleted && !hasReorganizationOptions}
          className={`p-1 rounded transition-colors duration-200 ${
            isCompleted && !hasReorganizationOptions
              ? 'text-gray-400 cursor-not-allowed' 
              : hasReorganizationOptions
              ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              : 'text-red-500 hover:text-red-700 hover:bg-red-50'
          }`}
          title={
            hasReorganizationOptions 
              ? "Cancel reorganization" 
              : isCompleted 
              ? "Cannot delete completed event" 
              : "Delete Event"
          }
        >
          {hasReorganizationOptions ? (
            <X className="w-4 h-4" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
};

// Gap Card Component - Shows schedule gaps
export function GapCard({ 
  duration, 
  startTime 
}: { 
  duration: number; 
  startTime: string; 
}) {
  return (
    <div className="flex bg-orange-50 border border-orange-200 rounded-lg overflow-hidden">
      {/* Orange sidebar */}
      <div className="w-2 bg-orange-400" />
      
      {/* Gap Content */}
      <div className="flex-1 p-4">
        <div className="flex items-center gap-2 text-orange-700 mb-2">
          <Minus className="w-4 h-4" />
          <span className="text-sm font-medium">Schedule Gap</span>
        </div>
        
        <div className="flex items-center gap-2 text-orange-600">
          <Clock className="w-3 h-3" />
          <span className="text-xs">
            {startTime} • <Duration minutes={duration} /> free
          </span>
        </div>
      </div>
    </div>
  );
}

export default function EventCard({ 
  students, 
  location, 
  duration, 
  date, 
  status,
  viewAs = 'admin',
  onDelete,
  onStatusChange,
  reorganizationOptions,
  onReorganize,
  onDismissReorganization,
  onCancelReorganization,
  onConfirmLesson
}: EventCardProps) {
  const sidebarColor = STATUS_COLORS[status as keyof typeof STATUS_COLORS] || 'bg-gray-500';

  return (
    <div className="space-y-0">
      {/* Main Event Card */}
      <div className="flex bg-card border border-border rounded-lg overflow-hidden">
        {/* Status Sidebar */}
        <div className={`w-2 ${sidebarColor}`} />
        
        {/* Card Content */}
        <div className="flex-1 p-4">
          {/* Students Display */}
          <div className="mb-3">
            <StudentsDisplay students={students} />
          </div>
          
          {/* Event Details */}
          <div className="space-y-2">
            <TimeDisplay date={date} duration={duration} />
            <LocationDisplay location={location} />
          </div>

          {/* Admin Controls */}
          {viewAs === 'admin' && (
            <AdminControls 
              status={status}
              onStatusChange={onStatusChange}
              onDelete={onDelete}
              reorganizationOptions={reorganizationOptions}
              onCancelReorganization={onCancelReorganization}
            />
          )}
        </div>
      </div>

      {/* Dropdown Card - Outside main card border */}
      <DropdownCard
        viewAs={viewAs}
        reorganizationOptions={reorganizationOptions}
        onReorganize={onReorganize}
        onDismissReorganization={onDismissReorganization}
        onConfirmLesson={onConfirmLesson}
      />
    </div>
  );
}