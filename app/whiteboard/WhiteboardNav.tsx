import { SingleDatePicker } from '@/components/pickers/single-date-picker';
import { Share2, Stethoscope, FileText, Printer, ChevronUp, ChevronDown } from 'lucide-react';
import { FlagIcon } from '@/svgs';
import { type EventController } from '@/backend/types';
import { addMinutesToTime } from '@/components/formatters/TimeZone';
import { format } from 'date-fns';

interface WhiteboardNavProps {
  activeSection: string;
  onSectionClick: (sectionId: string) => void;
  sections: readonly { id: string; name: string; description: string }[];
  selectedDate: string | null;
  onDateChange: (date: string) => void;
  controller: EventController;
  onControllerChange: (controller: EventController) => void;
  events: any[];
}

const ACTION_BUTTONS = [
  {
    id: 'share',
    label: 'Share',
    icon: Share2,
    title: 'Share to WhatsApp',
    action: () => console.log('Share: Sharing to WhatsApp group'),
  },
  {
    id: 'medical',
    label: 'Medical',
    icon: Stethoscope,
    title: 'Generate Medical Email',
    action: () => console.log('Medical: Generating medical email'),
  },
  {
    id: 'csv',
    label: 'CSV',
    icon: FileText,
    title: 'Export CSV',
    action: () => console.log('CSV: Exporting all events for today into CSV format'),
  },
  {
    id: 'print',
    label: 'Print',
    icon: Printer,
    title: 'Print Lesson Plan',
    action: () => console.log('Print: Printing today\'s lesson plan in table format'),
  },
] as const;

export default function WhiteboardNav({ 
  activeSection, 
  onSectionClick, 
  sections,
  selectedDate,
  onDateChange,
  controller,
  onControllerChange,
  events
}: WhiteboardNavProps) {
  // Calculate earliest event start time
  const getEarliestEventTime = () => {
    if (!events.length) return null;
    
    const eventTimes = events
      .filter(event => event.date)
      .map(event => {
        const date = new Date(event.date);
        return format(date, 'HH:mm'); // This converts UTC to local time automatically
      })
      .sort();
    
    if (eventTimes.length === 0) return null;
    
    return eventTimes[0];
  };

  // Time adjustment function
  const adjustTime = (hours: number, minutes: number) => {
    const totalMinutesToAdd = hours * 60 + minutes;
    const newTime = addMinutesToTime(controller.submitTime, totalMinutesToAdd);
    onControllerChange({ ...controller, submitTime: newTime });
  };

  const earliestTime = getEarliestEventTime();
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
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => onSectionClick(section.id)}
            className={`w-full text-left p-3 rounded-lg transition-colors ${
              activeSection === section.id
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted text-foreground'
            }`}
          >
            <div className="font-medium">{section.name}</div>
            <div className="text-sm opacity-70">{section.description}</div>
          </button>
        ))}
      </div>

      {/* Event Controller Flag Indicator */}
      <div className="mb-6 pt-4 border-t border-border">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Event Controller</h3>
        {controller.flag ? (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20 h-12">
            <FlagIcon className="w-5 h-5" />
            <span className="text-sm font-medium text-primary font-mono">
              {earliestTime || controller.submitTime}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border h-12">
            <FlagIcon className="w-5 h-5 opacity-30" />
            <span className="text-sm font-mono">{controller.submitTime}</span>
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
        )}
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
