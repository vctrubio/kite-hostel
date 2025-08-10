'use client';

import { Clock, Timer, MapPin, ChevronUp, ChevronDown, Settings } from 'lucide-react';
import { type EventController } from '@/backend/types';
import { LOCATION_ENUM_VALUES } from '@/lib/constants';

interface WhiteboardEventControllerProps {
  controller: EventController;
  onControllerChange: (controller: EventController) => void;
  events: any[];
}

export default function WhiteboardEventController({ 
  controller, 
  onControllerChange, 
  events 
}: WhiteboardEventControllerProps) {
  const updateController = (updates: Partial<EventController>) => {
    onControllerChange({ ...controller, ...updates });
  };

  // Helper function to format duration from minutes to hours format
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}:${mins.toString().padStart(2, '0')}hrs`;
  };

  const adjustTime = (hours: number, minutes: number) => {
    const [h, m] = controller.submitTime.split(':').map(Number);
    const totalMinutes = h * 60 + m + hours * 60 + minutes;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMins = totalMinutes % 60;
    const timeString = `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
    updateController({ submitTime: timeString });
  };

  const timePresets = ['11:00', '13:00', '16:00'];
  const locations = LOCATION_ENUM_VALUES;
  
  const durationOptions = [
    { value: 60, label: '1:00hrs' },
    { value: 90, label: '1:30hrs' },
    { value: 120, label: '2:00hrs' },
    { value: 150, label: '2:30hrs' },
    { value: 180, label: '3:00hrs' },
    { value: 210, label: '3:30hrs' },
    { value: 240, label: '4:00hrs' },
  ];

  const hasEvents = events.length > 0;

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-medium">Event Controller ({events.length})</h3>
        {!hasEvents && (
          <span className="text-sm text-muted-foreground">- No events for this date</span>
        )}
      </div>

      <div className="bg-card border border-border rounded-lg p-6 space-y-6">
        {/* Current Events Summary - Only show if there are events */}
        {hasEvents && (
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Today&apos;s Events</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Total Events:</span> {events.length}
              </div>
              <div>
                <span className="font-medium">Current Location:</span> {controller.location}
              </div>
              <div>
                <span className="font-medium">Start Time:</span> {controller.submitTime}
              </div>
            </div>
          </div>
        )}

          {/* Time Control */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Time Settings</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Time Adjuster */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Start Time</label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-muted rounded border">
                    <div className="flex flex-col">
                      <button
                        onClick={() => adjustTime(1, 0)}
                        className="px-3 py-2 text-xs hover:bg-background rounded transition-colors"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => adjustTime(-1, 0)}
                        className="px-3 py-2 text-xs hover:bg-background rounded transition-colors"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="px-4 py-2 text-base font-mono">{controller.submitTime}</div>
                    <div className="flex flex-col">
                      <button
                        onClick={() => adjustTime(0, 30)}
                        className="px-3 py-2 text-xs hover:bg-background rounded transition-colors"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => adjustTime(0, -30)}
                        className="px-3 py-2 text-xs hover:bg-background rounded transition-colors"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Time Presets */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Quick Times</label>
                <div className="flex gap-2">
                  {timePresets.map((time) => (
                    <button
                      key={time}
                      onClick={() => updateController({ submitTime: time })}
                      className={`px-4 py-2 text-sm rounded border transition-colors ${
                        controller.submitTime === time
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Location Control */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Location Settings</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {locations.map((location) => (
                <button
                  key={location}
                  onClick={() => updateController({ location })}
                  className={`px-4 py-3 text-sm rounded border text-left transition-colors ${
                    controller.location === location
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  <MapPin className="w-4 h-4 inline mr-2" />
                  {location}
                </button>
              ))}
            </div>
          </div>

          {/* Duration Controls */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Duration Settings</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Timer className="w-4 h-4 text-muted-foreground" />
                  <label className="text-sm font-medium">Single Student</label>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
                  {durationOptions.map((option) => (
                    <button
                      key={`cap1-${option.value}`}
                      onClick={() => updateController({ durationCapOne: option.value })}
                      className={`px-3 py-2 text-sm rounded border transition-colors ${
                        controller.durationCapOne === option.value
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Timer className="w-4 h-4 text-muted-foreground" />
                  <label className="text-sm font-medium">2-3 Students</label>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
                  {durationOptions.map((option) => (
                    <button
                      key={`cap2-${option.value}`}
                      onClick={() => updateController({ durationCapTwo: option.value })}
                      className={`px-3 py-2 text-sm rounded border transition-colors ${
                        controller.durationCapTwo === option.value
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Timer className="w-4 h-4 text-muted-foreground" />
                  <label className="text-sm font-medium">4+ Students</label>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
                  {durationOptions.map((option) => (
                    <button
                      key={`cap3-${option.value}`}
                      onClick={() => updateController({ durationCapThree: option.value })}
                      className={`px-3 py-2 text-sm rounded border transition-colors ${
                        controller.durationCapThree === option.value
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Events List Preview - Only show if there are events */}
          {hasEvents && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">Upcoming Events</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {events.slice(0, 5).map((event: any, index: number) => (
                  <div key={event.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded border text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="font-mono">{event.date ? new Date(event.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'TBD'}</span>
                    <span>•</span>
                    <span>{event.duration ? formatDuration(event.duration) : '0:00hrs'}</span>
                    <span>•</span>
                    <span className="text-muted-foreground">{event.location}</span>
                    <span>•</span>
                    <span>{event.lesson?.teacher?.name || 'Unassigned'}</span>
                  </div>
                ))}
                {events.length > 5 && (
                  <div className="text-center text-sm text-muted-foreground py-2">
                    +{events.length - 5} more events...
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
