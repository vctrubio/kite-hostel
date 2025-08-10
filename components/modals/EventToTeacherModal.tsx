'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { X, Clock, Users, AlertTriangle, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { type EventController } from '@/backend/types';
import { TeacherSchedule, type ConflictInfo, type AvailableSlot } from '@/backend/TeacherSchedule';
import { LOCATION_ENUM_VALUES } from '@/lib/constants';
import { HeadsetIcon, HelmetIcon } from '@/svgs';
import { createEvent } from '@/actions/event-actions';

interface EventToTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  lesson: any;
  teacherSchedule: TeacherSchedule;
  controller: EventController;
  selectedDate: string;
  onConfirm: (eventData: any) => void;
}

interface EventFormData {
  startTime: string;
  duration: number;
  location: string;
}

// Utility functions
const addMinutes = (time: string, minutes: number): string => {
  const [h, m] = time.split(':').map(Number);
  const totalMinutes = h * 60 + m + minutes;
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMins = totalMinutes % 60;
  return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
};

const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}:${mins.toString().padStart(2, '0')}hrs` : `${hours}:00hrs`;
};

export default function EventToTeacherModal({
  isOpen,
  onClose,
  lesson,
  teacherSchedule,
  controller,
  selectedDate,
  onConfirm
}: EventToTeacherModalProps) {
  const [formData, setFormData] = useState<EventFormData>({
    startTime: controller.submitTime,
    duration: controller.durationCapOne,
    location: controller.location
  });

  const [conflictInfo, setConflictInfo] = useState<ConflictInfo | null>(null);
  const [selectedAlternative, setSelectedAlternative] = useState<AvailableSlot | null>(null);
  const [showAlternatives, setShowAlternatives] = useState(false);

  // Calculate available data with useMemo to prevent infinite loops
  const availableSlots = useMemo(() => teacherSchedule.getAvailableSlots(), [teacherSchedule]);
  const totalAvailableHours = availableSlots.reduce((total, slot) => total + slot.duration, 0) / 60;

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      const studentCount = lesson.students?.length || lesson.studentCount || 1;
      let defaultDuration = controller.durationCapOne;
      
      if (studentCount >= 4) {
        defaultDuration = controller.durationCapThree;
      } else if (studentCount >= 2) {
        defaultDuration = controller.durationCapTwo;
      }

      // Find earliest slot that can fit the default duration, or default to 09:00
      const earliestSlot = availableSlots.find(slot => slot.duration >= defaultDuration);
      let defaultStartTime = earliestSlot ? earliestSlot.startTime : controller.submitTime;
      
      // Ensure start time is within 9am-9pm range
      const startTimeMinutes = timeToMinutes(defaultStartTime);
      if (startTimeMinutes < 9 * 60) {
        defaultStartTime = '09:00';
      } else if (startTimeMinutes > 21 * 60) {
        defaultStartTime = '21:00';
      }

      setFormData({
        startTime: defaultStartTime,
        duration: defaultDuration,
        location: controller.location
      });
      setSelectedAlternative(null);
      setShowAlternatives(false);
    }
  }, [isOpen, controller.submitTime, controller.durationCapOne, controller.durationCapTwo, controller.durationCapThree, controller.location, lesson.students?.length, lesson.studentCount, availableSlots]);

  // Check for conflicts when form data changes
  useEffect(() => {
    if (isOpen) {
      const conflict = teacherSchedule.checkConflict(formData.startTime, formData.duration);
      setConflictInfo(conflict);
      
      if (conflict.hasConflict) {
        setShowAlternatives(true);
      }
    }
  }, [formData, isOpen, teacherSchedule]);

  // Time adjustment functions
  const adjustTime = (minutes: number) => {
    setFormData(prev => {
      const currentTime = prev.startTime;
      const newTime = addMinutes(currentTime, minutes);
      
      // Restrict between 09:00 and 21:00
      const newTimeMinutes = timeToMinutes(newTime);
      const minTime = 9 * 60; // 09:00
      const maxTime = 21 * 60; // 21:00
      
      if (newTimeMinutes < minTime) {
        return { ...prev, startTime: '09:00' };
      }
      if (newTimeMinutes > maxTime) {
        return { ...prev, startTime: '21:00' };
      }
      
      return { ...prev, startTime: newTime };
    });
  };

  // Duration adjustment functions
  const adjustDuration = (minutes: number) => {
    setFormData(prev => ({
      ...prev,
      duration: Math.max(30, prev.duration + minutes) // Minimum 30 minutes
    }));
  };

  const handleSubmit = useCallback(async () => {
    if (conflictInfo?.hasConflict && !selectedAlternative) {
      return; // Don't submit if there's a conflict and no alternative selected
    }

    let finalStartTime = formData.startTime;
    const finalDuration = formData.duration;

    // Use alternative if selected
    if (selectedAlternative) {
      finalStartTime = selectedAlternative.startTime;
    }

    const eventData = {
      lessonId: lesson.id,
      startTime: finalStartTime,
      duration: finalDuration,
      location: formData.location,
      date: selectedDate,
      studentCount: lesson.students?.length || lesson.studentCount || 1,
    };

    console.log('🕐 Timezone Debug Info:');
    console.log('- selectedDate:', selectedDate);
    console.log('- finalStartTime:', finalStartTime);
    console.log('- User timezone:', Intl.DateTimeFormat().resolvedOptions().timeZone);
    console.log('- Combined datetime string:', `${selectedDate}T${finalStartTime}:00`);
    console.log('- Date object:', new Date(`${selectedDate}T${finalStartTime}:00`));
    console.log('- Date ISO string:', new Date(`${selectedDate}T${finalStartTime}:00`).toISOString());

    try {
      // Call the server action to create the event
      const result = await createEvent(eventData);
      
      if (result.success) {
        console.log('Event created successfully:', result.event);
        onConfirm(eventData); // Keep the callback for parent component updates
        onClose();
      } else {
        console.error('Failed to create event:', result.error);
        // You could show an error message to the user here
      }
    } catch (error) {
      console.error('Error creating event:', error);
      // You could show an error message to the user here
    }
  }, [conflictInfo, selectedAlternative, formData, lesson.id, selectedDate, lesson.students?.length, lesson.studentCount, onConfirm, onClose]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      } else if (event.key === 'Enter' && event.shiftKey) {
        event.preventDefault();
        handleSubmit();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, handleSubmit]);

  if (!isOpen) return null;

  const students = lesson.students || [];
  const studentCount = students.length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <div>
              <h2 className="text-lg font-semibold">Add Event</h2>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <HeadsetIcon className="w-3 h-3" />
                <span>{lesson.teacher?.name}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Summary */}
        <div className="p-4 bg-muted/30 border-b border-border">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <HelmetIcon className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium">{studentCount} student{studentCount !== 1 ? 's' : ''}</span>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              {totalAvailableHours.toFixed(1)}h available
            </div>
          </div>

          {/* Student names with helmet icons */}
          <div className="flex flex-wrap gap-2 mb-3">
            {students.map((student: any) => (
              <div key={student.id} className="flex items-center gap-1">
                <HelmetIcon className="w-3 h-3 text-yellow-500" />
                <span className="text-xs text-muted-foreground">{student.name}</span>
              </div>
            ))}
          </div>
          
          <div className="text-lg font-semibold">
            {formData.startTime} - {addMinutes(formData.startTime, formData.duration)}
          </div>
          <div className="text-sm text-muted-foreground">
            {formatDuration(formData.duration)} • {formData.location}
          </div>
        </div>

        {/* Options */}
        <div className="p-4 space-y-4">
          {/* Start Time with arrows */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Start Time</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => adjustTime(-30)}
                className="p-2 border border-border rounded-lg hover:bg-muted transition-colors"
                title="30 minutes earlier"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <input
                type="time"
                min="09:00"
                max="21:00"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-center"
              />
              <button
                type="button"
                onClick={() => adjustTime(30)}
                className="p-2 border border-border rounded-lg hover:bg-muted transition-colors"
                title="30 minutes later"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Duration with arrows */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Duration</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => adjustDuration(-30)}
                className="p-2 border border-border rounded-lg hover:bg-muted transition-colors"
                title="30 minutes less"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <select
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-center"
              >
                <option value={30}>0:30hrs</option>
                <option value={60}>1:00hrs</option>
                <option value={90}>1:30hrs</option>
                <option value={120}>2:00hrs</option>
                <option value={150}>2:30hrs</option>
                <option value={180}>3:00hrs</option>
                <option value={210}>3:30hrs</option>
                <option value={240}>4:00hrs</option>
                <option value={270}>4:30hrs</option>
                <option value={300}>5:00hrs</option>
                {/* Show current value if it's not in the list */}
                {![30, 60, 90, 120, 150, 180, 210, 240, 270, 300].includes(formData.duration) && (
                  <option value={formData.duration}>{formatDuration(formData.duration)}</option>
                )}
              </select>
              <button
                type="button"
                onClick={() => adjustDuration(30)}
                className="p-2 border border-border rounded-lg hover:bg-muted transition-colors"
                title="30 minutes more"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Location</label>
            <select
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background"
            >
              {LOCATION_ENUM_VALUES.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Conflict Warning */}
        {conflictInfo?.hasConflict && (
          <div className="p-4 bg-destructive/10 border-t border-destructive/20">
            <div className="flex items-center gap-2 text-destructive mb-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-medium text-sm">Schedule Conflict</span>
            </div>
            
            <div className="text-xs mb-3 text-destructive/80">
              Conflicts with {conflictInfo.conflictingNodes.length} existing item{conflictInfo.conflictingNodes.length !== 1 ? 's' : ''}
            </div>

            {/* Alternative Times */}
            {conflictInfo.suggestedAlternatives.length > 0 && showAlternatives && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Available Times:</h4>
                {conflictInfo.suggestedAlternatives.slice(0, 2).map((slot, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedAlternative(slot)}
                    className={`w-full text-left p-2 rounded border transition-colors text-sm ${
                      selectedAlternative === slot
                        ? 'bg-primary/10 border-primary'
                        : 'bg-background border-border hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{slot.startTime} - {slot.endTime}</span>
                      <span className="text-xs text-muted-foreground">{formatDuration(slot.duration)}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t border-border">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
            title="Press Esc to cancel"
          >
            Cancel
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={conflictInfo?.hasConflict && !selectedAlternative}
            className="flex-1 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Press Shift+Enter to submit"
          >
            {conflictInfo?.hasConflict && !selectedAlternative 
              ? 'Resolve First' 
              : 'Add Event'
            }
          </button>
        </div>
      </div>
    </div>
  );
}
