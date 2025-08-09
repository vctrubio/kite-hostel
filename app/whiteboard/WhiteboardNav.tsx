import { SingleDatePicker } from '@/components/pickers/single-date-picker';
import { Share2, Stethoscope, FileText, Printer, LucideIcon } from 'lucide-react';

interface WhiteboardNavProps {
  activeSection: string;
  onSectionClick: (sectionId: string) => void;
  sections: readonly { id: string; name: string; description: string }[];
  selectedDate: string | null;
  onDateChange: (date: string) => void;
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
  onDateChange
}: WhiteboardNavProps) {
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
