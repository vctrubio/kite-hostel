'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertTriangle, Calendar, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { type EventController } from '@/backend/types';
import { TeacherSchedule, type ConflictInfo, type AvailableSlot } from '@/backend/TeacherSchedule';
import { LOCATION_ENUM_VALUES, EVENT_STATUS_ENUM_VALUES, type Location, type EventStatus } from '@/lib/constants';
import { HelmetIcon, HeadsetIcon } from '@/svgs';
import { createEvent } from '@/actions/event-actions';
import { addMinutesToTime, timeToMinutes } from '@/components/formatters/TimeZone';

interface EventToTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  lesson: any;
  teacherSchedule: TeacherSchedule;
  controller: EventController;
  date: string;
  onConfirm: (eventData: any) => void;
  remainingMinutes?: number;
  allowDateEdit?: boolean;
}

interface EventFormData {
  startTime: string;
  duration: number;
  location: Location;
  status: EventStatus;
  date: string;
}

const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}:${mins.toString().padStart(2, '0')}hrs` : `${hours}:00hrs`;
};

// Sub-component: Header
function EventModalHeader({ teacherName, date, onDateChange, onClose, lesson, allowDateEdit = true }: { 
  teacherName: string; 
  date: string; 
  onDateChange: (date: string) => void; 
  onClose: () => void;
  lesson: any;
  allowDateEdit?: boolean;
}) {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Get date constraints from booking
  const bookingStartDate = lesson.booking?.date_start ? new Date(lesson.booking.date_start).toISOString().split('T')[0] : null;
  const bookingEndDate = lesson.booking?.date_end ? new Date(lesson.booking.date_end).toISOString().split('T')[0] : null;

  return (
    <div className="flex items-center justify-between p-6 border-b border-border">
      <div className="flex items-center gap-6">
        <HeadsetIcon className="w-5 h-5 text-green-600" />
        <h2 className="text-xl font-semibold">{teacherName}</h2>
        <div className="relative">
          {allowDateEdit ? (
            <>
              <button
                onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer border-b border-dashed border-muted-foreground/50 hover:border-foreground"
              >
                {new Date(date).toLocaleDateString('en-GB', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </button>
              {isDatePickerOpen && (
                <div className="absolute top-full left-0 mt-1 z-10">
                  <input
                    type="date"
                    value={date}
                    min={bookingStartDate}
                    max={bookingEndDate}
                    onChange={(e) => {
                      onDateChange(e.target.value);
                      setIsDatePickerOpen(false);
                    }}
                    className="px-3 py-2 border border-border rounded-lg bg-background text-sm"
                    autoFocus
                    onBlur={() => setIsDatePickerOpen(false)}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="text-sm text-muted-foreground">
              {new Date(date).toLocaleDateString('en-GB', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </div>
          )}
        </div>
      </div>
      <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}

// Sub-component: Summary (Airbnb-style card)
function EventModalSummary({ students, startTime, duration, location, date, remainingMinutes }: { students: any[]; startTime: string; duration: number; location: string; date: string; remainingMinutes?: number;}) {
  const remainingHours = remainingMinutes ? remainingMinutes / 60 : 0;
  const exceedsRemaining = remainingMinutes ? duration > remainingMinutes : false;
  
  return (
    <div className="p-6 bg-gradient-to-r from-background to-muted/20">
      {/* Students & Remaining Time Row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-wrap gap-3">
          {students.map((student: any) => (
            <div key={student.id} className="flex items-center gap-2 px-3 py-1 bg-background rounded-full border shadow-sm">
              <HelmetIcon className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-medium">{student.name}</span>
            </div>
          ))}
        </div>
        {remainingMinutes !== undefined && (
          <div className="text-right">
            <div className="text-sm text-muted-foreground">{remainingHours.toFixed(1)}h remaining</div>
            {exceedsRemaining && (
              <div className="text-xs text-orange-600 dark:text-orange-400 font-medium flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Exceeds remaining time
              </div>
            )}
          </div>
        )}
      </div>

      {/* Event Details Card */}
      <div className="bg-white dark:bg-card rounded-xl p-4 shadow-sm border">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold">{startTime}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Start Time</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{formatDuration(duration)}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Duration</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{location}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Location</div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="text-center text-sm text-muted-foreground">
            Ends at {addMinutesToTime(startTime, duration)}
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-component: Form
function EventModalForm({ formData, onFormDataChange, onAdjustTime, onAdjustDuration, remainingMinutes }: { formData: EventFormData; onFormDataChange: (updates: Partial<EventFormData>) => void; onAdjustTime: (minutes: number) => void; onAdjustDuration: (minutes: number) => void; remainingMinutes?: number; }) {
  const exceedsRemaining = remainingMinutes ? formData.duration > remainingMinutes : false;
  return (
    <div className="p-4 space-y-4">
      <FormField label="Start Time">
        <TimeAdjustmentField
          value={formData.startTime}
          onChange={(e) => onFormDataChange({ startTime: e.target.value })}
          onAdjust={onAdjustTime}
        />
      </FormField>
      <FormField label="Duration">
        <DurationAdjustmentField
          value={formData.duration}
          onChange={(e) => onFormDataChange({ duration: parseInt(e.target.value) })}
          onAdjust={onAdjustDuration}
          exceedsRemaining={exceedsRemaining}
        />
        {exceedsRemaining && <div className="text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 p-2 rounded border border-orange-200 dark:border-orange-800">⚠️ Duration exceeds remaining lesson time by {formatDuration(formData.duration - (remainingMinutes || 0))}</div>}
      </FormField>
      <FormField label="Location">
        <select value={formData.location} onChange={(e) => onFormDataChange({ location: e.target.value as Location })} className="w-full px-3 py-2 border border-border rounded-lg bg-background">
          {LOCATION_ENUM_VALUES.map(location => <option key={location} value={location}>{location}</option>)}
        </select>
      </FormField>
      <FormField label="Event Status">
        <select value={formData.status} onChange={(e) => onFormDataChange({ status: e.target.value as EventStatus })} className="w-full px-3 py-2 border border-border rounded-lg bg-background">
          {EVENT_STATUS_ENUM_VALUES.map(status => <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>)}
        </select>
      </FormField>
    </div>
  );
}

// Sub-component: Form Field
function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}

function TimeAdjustmentField({ value, onChange, onAdjust }: { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; onAdjust: (minutes: number) => void; }) {
  return (
    <div className="flex items-center gap-2">
      <button type="button" onClick={() => onAdjust(-30)} className="p-2 border border-border rounded-lg hover:bg-muted transition-colors" title="30 minutes earlier"><ChevronLeft className="w-4 h-4" /></button>
      <input type="time" min="09:00" max="21:00" value={value} onChange={onChange} className={`flex-1 px-3 py-2 border rounded-lg bg-background text-center transition-colors border-border' }`} />
      <button type="button" onClick={() => onAdjust(30)} className="p-2 border border-border rounded-lg hover:bg-muted transition-colors" title="30 minutes later"><ChevronRight className="w-4 h-4" /></button>
    </div>
  );
}

function DurationAdjustmentField({ value, onChange, onAdjust, exceedsRemaining }: { value: number; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; onAdjust: (minutes: number) => void; exceedsRemaining: boolean; }) {
  return (
    <div className="flex items-center gap-2">
      <button type="button" onClick={() => onAdjust(-30)} className="p-2 border border-border rounded-lg hover:bg-muted transition-colors" title="30 minutes less"><ChevronLeft className="w-4 h-4" /></button>
      <select value={value} onChange={onChange} className={`flex-1 px-3 py-2 border rounded-lg bg-background text-center transition-colors ${exceedsRemaining ? 'border-orange-500 focus:border-orange-500 focus:ring-orange-500' : 'border-border' }`}>
        {[30, 60, 90, 120, 150, 180, 210, 240, 270, 300].map(d => <option key={d} value={d}>{formatDuration(d)}</option>)}
        {![30, 60, 90, 120, 150, 180, 210, 240, 270, 300].includes(value) && <option value={value}>{formatDuration(value)}</option>}
      </select>
      <button type="button" onClick={() => onAdjust(30)} className="p-2 border border-border rounded-lg hover:bg-muted transition-colors" title="30 minutes more"><ChevronRight className="w-4 h-4" /></button>
    </div>
  );
}

// Sub-component: Conflict Warning
function EventModalConflict({ conflictInfo, selectedAlternative, onSelectAlternative }: { conflictInfo: ConflictInfo; selectedAlternative: AvailableSlot | null; onSelectAlternative: (slot: AvailableSlot) => void; }) {
  if (!conflictInfo.hasConflict) return null;
  const calculateEndTime = (startTime: string, duration: number): string => {
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = startMinutes + duration;
    const hours = Math.floor(endMinutes / 60);
    const mins = endMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };
  return (
    <div className="p-4 bg-destructive/10 border-t border-destructive/20">
      <div className="flex items-center gap-2 text-destructive mb-2"><AlertTriangle className="w-4 h-4" /><span className="font-medium text-sm">Schedule Conflict</span></div>
      <div className="text-xs mb-3 text-destructive/80">Conflicts with {conflictInfo.conflictingNodes.length} existing item{conflictInfo.conflictingNodes.length !== 1 ? 's' : ''}</div>
      {conflictInfo.conflictingNodes.length > 0 && (
        <div className="mb-3 text-xs">
          <div className="font-medium text-destructive mb-1">Conflicting Events:</div>
          {conflictInfo.conflictingNodes.map((node, index) => {
            const endTime = calculateEndTime(node.startTime, node.duration);
            const studentNames = node.eventData?.studentNames?.join(', ') || 'Unknown students';
            return <div key={index} className="text-destructive/70">• <span className="font-medium">{studentNames}</span> at {node.startTime} - {endTime} ({formatDuration(node.duration)})</div>;
          })}
        </div>
      )}
      {conflictInfo.suggestedAlternatives.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Next Available Time:</h4>
          {conflictInfo.suggestedAlternatives.slice(0, 1).map((slot, index) => (
            <button key={index} onClick={() => onSelectAlternative(slot)} className={`w-full text-left p-2 rounded border transition-colors text-sm ${selectedAlternative === slot ? 'bg-primary/10 border-primary' : 'bg-background border-border hover:bg-muted' }`}>
              <div className="flex items-center justify-between"><span className="font-medium">{slot.startTime} - {slot.endTime}</span><span className="text-xs text-muted-foreground">{formatDuration(slot.duration)}</span></div>
            </button>
          ))}
        </div>
      )}
      {conflictInfo.suggestedAlternatives.length === 0 && <div className="text-xs text-destructive/80">No alternative times available after existing events</div>}
    </div>
  );
}

// Sub-component: Status Warning
function StatusWarning({ lesson }: { lesson: any }) {
  const bookingStatus = lesson.booking?.status;
  const lessonStatus = lesson.status;
  const isBookingInvalid = bookingStatus !== 'active';
  const isLessonInvalid = lessonStatus !== 'planned';
  if (!isBookingInvalid && !isLessonInvalid) return null;

  return (
    <div className="p-4 border-b border-border">
      <div className="p-3 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-start gap-3">
        <Info className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">Action Not Advised</h4>
          <ul className="list-disc pl-5 mt-1 text-xs text-yellow-700 dark:text-yellow-300">
            {isBookingInvalid && <li>The parent booking is currently <span className="font-semibold">{bookingStatus}</span>.</li>}
            {isLessonInvalid && <li>This lesson is <span className="font-semibold">{lessonStatus}</span> and cannot be scheduled.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}

// Sub-component: Footer
function EventModalFooter({ conflictInfo, selectedAlternative, onClose, onSubmit, isDisabled }: { conflictInfo: ConflictInfo | null; selectedAlternative: AvailableSlot | null; onClose: () => void; onSubmit: () => void; isDisabled: boolean; }) {
  const hasConflict = conflictInfo?.hasConflict && !selectedAlternative;
  const isButtonDisabled = hasConflict || isDisabled;
  return (
    <div className="flex gap-3 p-4 border-t border-border">
      <button onClick={onClose} className="flex-1 px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors" title="Press Esc to cancel">Cancel</button>
      <button onClick={onSubmit} disabled={isButtonDisabled} className="flex-1 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" title="Press Shift+Enter to submit">
        {isButtonDisabled ? (hasConflict ? 'Resolve Conflict' : 'Action Not Allowed') : 'Add Event'}
      </button>
    </div>
  );
}

export default function EventToTeacherModal({
  isOpen,
  onClose,
  lesson,
  teacherSchedule,
  controller,
  date,
  onConfirm,
  remainingMinutes,
  allowDateEdit = true,
}: EventToTeacherModalProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [formData, setFormData] = useState<EventFormData>({
    startTime: controller.submitTime,
    duration: controller.durationCapOne,
    location: controller.location as Location,
    status: 'planned' as EventStatus,
    date: date
  });
  const [conflictInfo, setConflictInfo] = useState<ConflictInfo | null>(null);
  const [selectedAlternative, setSelectedAlternative] = useState<AvailableSlot | null>(null);

  useEffect(() => { setIsMounted(true); return () => setIsMounted(false); }, []);

  useEffect(() => {
    if (isOpen) {
      const studentCount = lesson.students?.length || lesson.studentCount || 1;
      let defaultDuration = controller.durationCapOne;
      if (studentCount >= 4) defaultDuration = controller.durationCapThree;
      else if (studentCount >= 2) defaultDuration = controller.durationCapTwo;

      let defaultStartTime = controller.submitTime;
      const controllerConflict = teacherSchedule.checkConflict(defaultStartTime, defaultDuration);
      if (controllerConflict.hasConflict && controllerConflict.suggestedAlternatives.length > 0) {
        defaultStartTime = controllerConflict.suggestedAlternatives[0].startTime;
      }
      
      const startTimeMinutes = timeToMinutes(defaultStartTime);
      if (startTimeMinutes < 9 * 60) defaultStartTime = '09:00';
      else if (startTimeMinutes > 21 * 60) defaultStartTime = '21:00';

      setFormData({ startTime: defaultStartTime, duration: defaultDuration, location: controller.location as Location, status: 'planned' as EventStatus, date: selectedDate });
      setSelectedAlternative(null);
    }
  }, [isOpen, controller, lesson, teacherSchedule]);

  useEffect(() => {
    if (isOpen) {
      const conflict = teacherSchedule.checkConflict(formData.startTime, formData.duration);
      setConflictInfo(conflict);
    }
  }, [formData, isOpen, teacherSchedule]);

  const handleFormDataChange = (updates: Partial<EventFormData>) => setFormData(prev => ({ ...prev, ...updates }));

  const adjustTime = (minutes: number) => {
    setFormData(prev => {
      const newTime = addMinutesToTime(prev.startTime, minutes);
      const newTimeMinutes = timeToMinutes(newTime);
      if (newTimeMinutes < 9 * 60) return { ...prev, startTime: '09:00' };
      if (newTimeMinutes > 21 * 60) return { ...prev, startTime: '21:00' };
      return { ...prev, startTime: newTime };
    });
  };

  const adjustDuration = (minutes: number) => setFormData(prev => ({ ...prev, duration: Math.max(30, prev.duration + minutes) }));

  const handleSubmit = useCallback(async () => {
    if (conflictInfo?.hasConflict && !selectedAlternative) return;
    const finalStartTime = selectedAlternative ? selectedAlternative.startTime : formData.startTime;
    const eventData = { lessonId: lesson.id, date: formData.date, startTime: finalStartTime, durationMinutes: formData.duration, location: formData.location, status: formData.status };
    try {
      const result = await createEvent(eventData);
      if (result.success) {
        console.log('✅ Event created successfully');
        onConfirm(eventData);
        onClose();
      } else { 
        console.error('❌ Failed to create event:', result.error);
        alert(`Failed to create event: ${result.error}`);
      }
    } catch (error) { 
      console.error('🔥 Error creating event:', error);
      alert('An unexpected error occurred while creating the event');
    }
  }, [conflictInfo, selectedAlternative, formData, lesson.id, onConfirm, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      else if (event.key === 'Enter' && event.shiftKey) handleSubmit();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handleSubmit]);

  const isActionAllowed = lesson.booking?.status === 'active' && lesson.status === 'planned';

  const modalContent = (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <EventModalHeader 
          teacherName={lesson.teacher?.name || 'Teacher'} 
          date={formData.date} 
          onDateChange={(date) => handleFormDataChange({ date })}
          onClose={onClose}
          lesson={lesson}
          allowDateEdit={allowDateEdit}
        />
        <StatusWarning lesson={lesson} />
        <EventModalSummary students={lesson.students || []} startTime={formData.startTime} duration={formData.duration} location={formData.location} date={formData.date} remainingMinutes={remainingMinutes} />
        {isActionAllowed && (
          <>
            <EventModalForm formData={formData} onFormDataChange={handleFormDataChange} onAdjustTime={adjustTime} onAdjustDuration={adjustDuration} remainingMinutes={remainingMinutes} />
            {conflictInfo && <EventModalConflict conflictInfo={conflictInfo} selectedAlternative={selectedAlternative} onSelectAlternative={setSelectedAlternative} />}
          </>
        )}
        <EventModalFooter conflictInfo={conflictInfo} selectedAlternative={selectedAlternative} onClose={onClose} onSubmit={handleSubmit} isDisabled={!isActionAllowed} />
      </div>
    </div>
  );

  if (!isOpen || !isMounted) return null;

  return createPortal(modalContent, document.body);
}
