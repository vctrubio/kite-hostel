
'use client';

import { SingleDatePicker } from '@/components/pickers/single-date-picker';
import {
  BookIcon,
  LessonIcon,
  EventIcon,
} from '@/svgs';
import { Share2, Stethoscope, FileText, Printer } from 'lucide-react';
import { format } from 'date-fns';
import { ShareUtils } from '@/backend/ShareUtils';
import { TeacherSchedule } from '@/backend/TeacherSchedule';

interface WhiteboardMiniNavProps {
  activeSection: string;
  onSectionClick: (sectionId: string) => void;
  selectedDate: string | null;
  onDateChange: (date: string) => void;
  bookingsCount: number;
  lessonsCount: number;
  eventsCount: number;
  events: any[];
  teacherSchedules: Map<string, TeacherSchedule>;
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
  events,
  teacherSchedules,
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
