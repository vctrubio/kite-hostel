import { SingleDatePicker } from '@/components/pickers/single-date-picker';
import { Share2, Stethoscope, FileText, Printer, ChevronUp, ChevronDown, MapPin, AlertTriangle } from 'lucide-react';
import { FlagIcon } from '@/svgs';
import { type EventController } from '@/backend/types';
import { type Location, LOCATION_ENUM_VALUES } from '@/lib/constants';
import { addMinutesToTime } from '@/components/formatters/TimeZone';
import { format } from 'date-fns';
import { useEffect, useMemo } from 'react';
import { WhiteboardClass, createBookingClasses } from '@/backend/WhiteboardClass';
import { TeacherSchedule } from '@/backend/TeacherSchedule';
import { ShareUtils } from '@/backend/ShareUtils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface WhiteboardNavProps {
  activeSection: string;
  onSectionClick: (sectionId: string) => void;
  sections: readonly { id: string; name: string; description: string }[];
  selectedDate: string | null;
  onDateChange: (date: string) => void;
  controller: EventController;
  onControllerChange: (controller: EventController) => void;
  events: any[];
  bookings?: any[]; // Add bookings for enhanced analysis
  teacherSchedules: Map<string, TeacherSchedule>; // Add teacher schedules for actions
}

export default function WhiteboardNav({ 
  activeSection, 
  onSectionClick, 
  sections,
  selectedDate,
  onDateChange,
  controller,
  onControllerChange,
  events,
  bookings = [],
  teacherSchedules
}: WhiteboardNavProps) {
  
  // Action handlers using ShareUtils
  const handleShare = () => {
    if (!selectedDate) {
      console.log('No date selected');
      return;
    }
    
    try {
      const shareData = ShareUtils.extractShareData(selectedDate, teacherSchedules, events);
      const message = ShareUtils.generateWhatsAppMessage(shareData);
      ShareUtils.shareToWhatsApp(message);
      console.log('Share: Message sent to WhatsApp');
    } catch (error) {
      console.error('Error sharing to WhatsApp:', error);
    }
  };

  const handleMedical = () => {
    if (!selectedDate) {
      console.log('No date selected');
      return;
    }
    
    try {
      const { subject, body } = ShareUtils.generateMedicalEmail(selectedDate, events);
      ShareUtils.sendMedicalEmail(subject, body);
      console.log('Medical: Email generated and opened');
    } catch (error) {
      console.error('Error generating medical email:', error);
    }
  };

  const handleCSV = () => {
    if (!selectedDate) {
      console.log('No date selected');
      return;
    }
    
    try {
      const shareData = ShareUtils.extractShareData(selectedDate, teacherSchedules, events);
      const csvData = ShareUtils.generateCSVData(shareData);
      const filename = `kite-schedule-${format(new Date(selectedDate), 'yyyy-MM-dd')}.csv`;
      ShareUtils.downloadCSV(csvData, filename);
      console.log('CSV: File downloaded successfully');
    } catch (error) {
      console.error('Error generating CSV:', error);
    }
  };

  const handlePrint = async () => {
    if (!selectedDate) {
      console.log('No date selected');
      return;
    }
    
    try {
      const shareData = ShareUtils.extractShareData(selectedDate, teacherSchedules, events);
      await ShareUtils.downloadPrintTable(shareData);
      console.log('Print: Document generated successfully');
    } catch (error) {
      console.error('Error generating print document:', error);
    }
  };

  const ACTION_BUTTONS = [
    {
      id: 'share',
      label: 'Share',
      icon: Share2,
      title: 'Share to WhatsApp',
      action: handleShare,
    },
    {
      id: 'medical',
      label: 'Medical',
      icon: Stethoscope,
      title: 'Generate Medical Email',
      action: handleMedical,
    },
    {
      id: 'csv',
      label: 'CSV',
      icon: FileText,
      title: 'Export CSV',
      action: handleCSV,
    },
    {
      id: 'print',
      label: 'Print',
      icon: Printer,
      title: 'Print Lesson Plan',
      action: handlePrint,
    },
  ] as const;
  
  // Enhanced analytics using business logic
  const analyticsData = useMemo(() => {
    if (bookings.length === 0) return null;
    
    const bookingClasses = createBookingClasses(bookings);
    const readyForCompletion = bookingClasses.filter(bc => bc.isReadyForCompletion()).length;
    const needingAttention = bookingClasses.filter(bc => bc.needsAttention().hasIssues).length;
    
    // Event analytics
    const eventsWithIssues = events.filter(event => {
      if (event.booking) {
        const bookingClass = new WhiteboardClass(event.booking);
        return bookingClass.needsAttention().hasIssues;
      }
      return false;
    }).length;
    
    return {
      readyForCompletion,
      needingAttention,
      eventsWithIssues,
      totalEvents: events.length
    };
  }, [bookings, events]);
  
  // Calculate earliest event start time
  const getEarliestEventTime = () => {
    if (!events.length) return null;
    
    const eventTimes = events
      .filter(event => event.date)
      .map(event => {
        const date = new Date(event.date);
        return format(date, 'HH:mm');
      })
      .sort();
    
    if (eventTimes.length === 0) return null;
    return eventTimes[0];
  };

  // Calculate most popular location from events
  const getMostPopularLocation = () => {
    if (!events.length) return controller.location;
    
    const locationCounts = events
      .filter(event => event.location)
      .reduce((counts: Record<string, number>, event) => {
        const location = event.location;
        counts[location] = (counts[location] || 0) + 1;
        return counts;
      }, {});
    
    const sortedLocations = Object.entries(locationCounts)
      .sort(([, countA], [, countB]) => (countB as number) - (countA as number));
    
    if (sortedLocations.length === 0) return controller.location;
    return sortedLocations[0][0];
  };

  // Time adjustment function
  const adjustTime = (hours: number, minutes: number) => {
    const totalMinutesToAdd = hours * 60 + minutes;
    const newTime = addMinutesToTime(controller.submitTime, totalMinutesToAdd);
    onControllerChange({ ...controller, submitTime: newTime });
  };

  const earliestTime = getEarliestEventTime();
  const mostPopularLocation = getMostPopularLocation();

  // Auto-update controller location when events change
  useEffect(() => {
    if (events.length > 0 && mostPopularLocation && mostPopularLocation !== controller.location) {
      onControllerChange({ ...controller, location: mostPopularLocation as Location });
    }
  }, [events, mostPopularLocation, controller, onControllerChange]);

  // Time Controller Component
  const TimeController = () => (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border h-12">
      <FlagIcon className="w-5 h-5 opacity-30" />
      <span className="text-sm font-mono">
        {controller.flag ? (earliestTime || controller.submitTime) : controller.submitTime}
      </span>
      {!controller.flag && (
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
      )}
    </div>
  );

  // Location Controller Component
  const LocationController = () => (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border h-12">
      <MapPin className="w-5 h-5 opacity-30" />
      <Select
        value={controller.location}
        onValueChange={(value) => onControllerChange({ ...controller, location: value as Location })}
      >
        <SelectTrigger className="w-36 h-8 text-sm bg-muted border-border hover:bg-background">
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

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      {/* Single Date Picker */}
      <div className="mb-6">
        <SingleDatePicker 
          selectedDate={selectedDate || undefined}
          onDateChange={onDateChange}
        />
      </div>
      
      {/* Navigation Sections */}
      <div className="space-y-2 mb-6">
        {sections.map((section) => {
          // Calculate totals for specific sections
          let total = null;
          if (section.id === 'bookings') {
            total = bookings.length;
          } else if (section.id === 'lessons') {
            // Count unique lessons from events
            const uniqueLessons = new Set(events.map(event => event.lesson?.id).filter(Boolean));
            total = uniqueLessons.size;
          } else if (section.id === 'events') {
            total = events.length;
          }
          
          return (
            <button
              key={section.id}
              onClick={() => onSectionClick(section.id)}
              className={`w-full text-left p-3 rounded-lg transition-colors relative ${
                activeSection === section.id
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted text-foreground'
              }`}
            >
              <div className="font-medium flex items-center justify-between">
                <span>{section.name}</span>
                {total !== null && (
                  <span className="text-xs opacity-70 font-mono">{total}</span>
                )}
              </div>
              <div className="text-sm opacity-70">{section.description}</div>
              
              {/* Enhanced indicators for later maybe */}
              {/* {analyticsData && (
                <>
                  {section.id === 'bookings' && analyticsData.readyForCompletion > 0 && (
                    <div className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full"></div>
                  )}
                  {section.id === 'events' && analyticsData.eventsWithIssues > 0 && (
                    <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></div>
                  )}
                  {section.id === 'status' && analyticsData.needingAttention > 0 && (
                    <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></div>
                  )}
                </>
              )} */}
            </button>
          );
        })}
      </div>

      {/* Enhanced Status Alerts */}
      {analyticsData && (analyticsData.readyForCompletion > 0 || analyticsData.needingAttention > 0) && (
        <div className="mb-6 p-3 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-medium text-orange-800 dark:text-orange-200">Action Required</span>
          </div>
          <div className="space-y-1 text-xs text-orange-700 dark:text-orange-300">
            {analyticsData.readyForCompletion > 0 && (
              <div>{analyticsData.readyForCompletion} booking{analyticsData.readyForCompletion > 1 ? 's' : ''} ready for completion</div>
            )}
            {analyticsData.needingAttention > 0 && (
              <div>{analyticsData.needingAttention} booking{analyticsData.needingAttention > 1 ? 's' : ''} need attention</div>
            )}
            {analyticsData.eventsWithIssues > 0 && (
              <div>{analyticsData.eventsWithIssues} event{analyticsData.eventsWithIssues > 1 ? 's' : ''} have issues</div>
            )}
          </div>
        </div>
      )}

      {/* Event Controller */}
      <div className="mb-6 pt-4 border-t border-border">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Event Controller</h3>
        <div className="space-y-2">
          <TimeController />
          <LocationController />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 border-t border-border">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Actions</h3>
        <div className="grid grid-cols-2 gap-2">
          {ACTION_BUTTONS.map((button) => {
            const IconComponent = button.icon;
            return (
              <button
                key={button.id}
                onClick={button.action}
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
