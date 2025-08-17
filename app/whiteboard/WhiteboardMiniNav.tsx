
'use client';

import { SingleDatePicker } from '@/components/pickers/single-date-picker';
import {
  BookIcon,
  LessonIcon,
  EventIcon,
} from '@/svgs';
import { Share2, Stethoscope, FileText, Printer, ChevronUp, ChevronDown, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { ShareUtils } from '@/backend/ShareUtils';
import { TeacherSchedule } from '@/backend/TeacherSchedule';
import { FlagIcon } from '@/svgs';
import { type EventController } from '@/backend/types';
import { type Location, LOCATION_ENUM_VALUES } from '@/lib/constants';
import { addMinutesToTime } from '@/components/formatters/TimeZone';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BOOKING_STATUS_FILTERS,
  LESSON_STATUS_FILTERS,
  EVENT_STATUS_FILTERS,
  type BookingStatusFilter,
  type LessonStatusFilter,
  type EventStatusFilter
} from '@/lib/constants';

interface WhiteboardMiniNavProps {
  activeSection: string;
  onSectionClick: (sectionId: string) => void;
  selectedDate: string | null;
  onDateChange: (date: string) => void;
  bookingsCount: number;
  lessonsCount: number;
  eventsCount: number;
  filters: {
    bookings: BookingStatusFilter;
    lessons: LessonStatusFilter;
    events: EventStatusFilter;
  };
  onFilterChange: (section: 'bookings' | 'lessons' | 'events', filter: string) => void;
  controller?: EventController;
  onControllerChange?: (controller: EventController) => void;
}

const NAV_ITEMS = [
  { id: 'bookings', name: 'Bookings', icon: BookIcon },
  { id: 'lessons', name: 'Lessons', icon: LessonIcon },
  { id: 'events', name: 'Events', icon: EventIcon },
];

export default function WhiteboardMiniNav({
  activeSection,
  onSectionClick,
  selectedDate,
  onDateChange,
  bookingsCount,
  lessonsCount,
  eventsCount,
  filters,
  onFilterChange,
  controller,
  onControllerChange,
}: WhiteboardMiniNavProps) {
  const getCount = (id: string) => {
    switch (id) {
      case 'bookings':
        return bookingsCount;
      case 'lessons':
        return lessonsCount;
      case 'events':
        return eventsCount;
      default:
        return 0;
    }
  };

  // Time adjustment function
  const adjustTime = (hours: number, minutes: number) => {
    if (!controller || !onControllerChange) return;
    const totalMinutesToAdd = hours * 60 + minutes;
    const newTime = addMinutesToTime(controller.submitTime, totalMinutesToAdd);
    onControllerChange({ ...controller, submitTime: newTime });
  };

  // Time Controller Component
  const TimeController = () => {
    if (!controller || !onControllerChange) return null;
    
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border h-12">
        <FlagIcon className="w-5 h-5 opacity-30" />
        <span className="text-sm font-mono">
          {controller.submitTime}
        </span>
        <div className="flex flex-col ml-auto">
          <button
            onClick={() => adjustTime(0, 30)}
            className="px-2 py-1 text-xs hover:bg-background rounded transition-colors"
          >
            <ChevronUp className="w-3 h-3" />
          </button>
          <button
            onClick={() => adjustTime(0, -30)}
            className="px-2 py-1 text-xs hover:bg-background rounded transition-colors"
          >
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  };

  // Location Controller Component
  const LocationController = () => {
    if (!controller || !onControllerChange) return null;
    
    return (
      <div className="flex items-center gap-3">
        <Select
          value={controller.location}
          onValueChange={(value) => onControllerChange({ ...controller, location: value as Location })}
        >
          <SelectTrigger className="w-36 h-8 text-sm bg-muted border-border hover:bg-background">
            <MapPin className="w-5 h-5 opacity-30" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LOCATION_ENUM_VALUES.map((location) => (
              <SelectItem key={location} value={location} className="text-sm">
                {location}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  };


  const ACTION_BUTTONS = [
    {
      id: 'share',
      label: 'Share',
      icon: Share2,
      title: 'Share to WhatsApp',
    },
    {
      id: 'medical',
      label: 'Medical', 
      icon: Stethoscope,
      title: 'Generate Medical Email',
    },
    {
      id: 'csv',
      label: 'CSV',
      icon: FileText,
      title: 'Export CSV',
    },
    {
      id: 'print',
      label: 'Print',
      icon: Printer,
      title: 'Print Lesson Plan',
    },
  ] as const;

  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <div className="mb-4">
        <SingleDatePicker
          selectedDate={selectedDate || undefined}
          onDateChange={onDateChange}
        />
      </div>
      <div className="flex justify-around items-center mb-4">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const count = getCount(item.id);
          return (
            <button
              key={item.id}
              onClick={() => onSectionClick(item.id)}
              className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-colors w-24 ${
                activeSection === item.id
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted text-foreground'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-sm font-medium">{item.name}</span>
              <span className="text-xs opacity-70 font-mono">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Filter Sections - Always show all 3 */}
      <div className="mb-4 pt-4 border-t border-border">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Filters</h3>
        
        {/* Bookings Filter */}
        <div className="mb-3">
          <h4 className="text-xs font-medium text-muted-foreground mb-1">Bookings</h4>
          <div className="flex flex-wrap gap-1">
            {BOOKING_STATUS_FILTERS.map((filter) => (
              <button
                key={filter.value}
                onClick={() => onFilterChange('bookings', filter.value)}
                className={`px-2 py-1 text-xs font-medium transition-colors w-14 ${
                  filters.bookings === filter.value
                    ? `${filter.color.replace('hover:', '').replace('100', '200').replace('900/30', '900/50')} border-b-2 border-current`
                    : `${filter.color} border-b-2 border-transparent`
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Lessons Filter */}
        <div className="mb-3">
          <h4 className="text-xs font-medium text-muted-foreground mb-1">Lessons</h4>
          <div className="flex flex-wrap gap-1">
            {LESSON_STATUS_FILTERS.map((filter) => (
              <button
                key={filter.value}
                onClick={() => onFilterChange('lessons', filter.value)}
                className={`px-2 py-1 text-xs font-medium transition-colors w-16 ${
                  filters.lessons === filter.value
                    ? `${filter.color.replace('hover:', '').replace('100', '200').replace('900/30', '900/50')} border-b-2 border-current`
                    : `${filter.color} border-b-2 border-transparent`
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Events Filter */}
        <div className="mb-3">
          <h4 className="text-xs font-medium text-muted-foreground mb-1">Events</h4>
          <div className="flex flex-wrap gap-1">
            {EVENT_STATUS_FILTERS.map((filter) => (
              <button
                key={filter.value}
                onClick={() => onFilterChange('events', filter.value)}
                className={`px-2 py-1 text-xs font-medium transition-colors w-16 ${
                  filters.events === filter.value
                    ? `${filter.color.replace('hover:', '').replace('100', '200').replace('900/30', '900/50')} border-b-2 border-current`
                    : `${filter.color} border-b-2 border-transparent`
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Event Controller */}
      {controller && onControllerChange && (
        <div className="mb-4 pt-4 border-t border-border">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Event Controller</h3>
          <div className="space-y-2">
            <TimeController />
            <LocationController />
          </div>
        </div>
      )}

      <div className="pt-4 border-t border-border">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Actions</h3>
        <div className="grid grid-cols-2 gap-2">
          {ACTION_BUTTONS.map((button) => {
            const IconComponent = button.icon;
            return (
              <button
                key={button.id}
                className="flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-muted transition-colors text-sm"
                title={button.title}
              >
                <IconComponent size={16} />
                <span>{button.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
