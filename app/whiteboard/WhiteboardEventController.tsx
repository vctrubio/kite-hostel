'use client';

import { useState, useEffect } from 'react';
import { Clock, Timer, MapPin, ChevronUp, ChevronDown, Settings, Wind, CloudRain, AlertTriangle, RefreshCw } from 'lucide-react';
import { type EventController } from '@/backend/types';
import { LOCATION_ENUM_VALUES } from '@/lib/constants';
import { deleteEvent } from '@/actions/event-actions';
import { addMinutesToTime } from '@/components/formatters/TimeZone';
import { getWeatherForDate, type WeatherActionResult } from '@/actions/weather-actions';
import { formatWind, getWeatherEmoji, isKitingWeather, type WeatherData } from '@/backend/WeatherClass';

interface WhiteboardEventControllerProps {
  controller: EventController;
  onControllerChange: (controller: EventController) => void;
  events: any[];
  selectedDate?: string;
}

export default function WhiteboardEventController({ 
  controller, 
  onControllerChange, 
  events,
  selectedDate 
}: WhiteboardEventControllerProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const updateController = (updates: Partial<EventController>) => {
    onControllerChange({ ...controller, ...updates });
  };

  // Fetch weather data for the selected date
  useEffect(() => {
    if (!selectedDate) return;
    
    const fetchWeather = async () => {
      setWeatherLoading(true);
      setWeatherError(null);
      
      try {
        const result: WeatherActionResult = await getWeatherForDate(
          selectedDate,
          36.0128, // Tarifa latitude
          -5.6081, // Tarifa longitude
          'Tarifa, Spain'
        );
        
        if (result.success && result.data) {
          setWeather(result.data);
        } else {
          setWeatherError(result.error || 'Failed to load weather');
        }
      } catch (error) {
        setWeatherError('Weather service unavailable');
      } finally {
        setWeatherLoading(false);
      }
    };
    
    fetchWeather();
  }, [selectedDate]);

  // Analyze weather for kiting
  const kitingAnalysis = weather ? isKitingWeather(weather) : null;
  
  // Get weather-based recommendations
  const getWeatherRecommendations = () => {
    if (!weather || !kitingAnalysis) return [];
    
    const recommendations: string[] = [];
    
    if (kitingAnalysis.score >= 8) {
      recommendations.push('Perfect conditions for all skill levels');
    } else if (kitingAnalysis.score >= 6) {
      recommendations.push('Good conditions for lessons');
    } else if (kitingAnalysis.score < 4) {
      recommendations.push('Consider postponing lessons');
    }
    
    if (weather.windSpeed > 25) {
      recommendations.push('Strong winds - beginners only with supervision');
    } else if (weather.windSpeed < 12) {
      recommendations.push('Light winds - focus on theory or equipment');
    }
    
    if (weather.precipitationProbability > 60) {
      recommendations.push('High rain chance - have indoor backup plan');
    }
    
    if (weather.windGust && weather.windGust > 30) {
      recommendations.push('Gusty conditions - extra safety precautions needed');
    }
    
    return recommendations;
  };
  
  const recommendations = getWeatherRecommendations();

  // Helper function to format duration from minutes to hours format
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}:${mins.toString().padStart(2, '0')}hrs`;
  };

  const adjustTime = (hours: number, minutes: number) => {
    const totalMinutesToAdd = hours * 60 + minutes;
    const newTime = addMinutesToTime(controller.submitTime, totalMinutesToAdd);
    updateController({ submitTime: newTime });
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

  const handleNoWind = async () => {
    if (!hasEvents) return;
    
    if (confirm(`Are you sure you want to delete all ${events.length} events for today? This action cannot be undone.`)) {
      try {
        // Delete only events that are planned
        let deletedCount = 0;
        for (const event of events) {
          console.log(`🗑️ Deleting event ${event.id}`);
          const result = await deleteEvent(event.id);
          if (result.success) {
            deletedCount++;
          } else {
            console.error(`❌ Failed to delete event ${event.id}:`, result.error);
          }
        }
        console.log(`✅ ${deletedCount}/${events.length} events deleted due to NO WIND conditions`);
        
        if (deletedCount === events.length) {
          alert(`All ${deletedCount} events have been successfully deleted due to NO WIND conditions.`);
        } else {
          alert(`${deletedCount} out of ${events.length} events were deleted. Some deletions failed - please check the console for details.`);
        }
        
        // The revalidatePath in deleteEvent should refresh the page data
      } catch (error) {
        console.error('❌ Error deleting events:', error);
        alert('Failed to delete events. Please try again.');
      }
    }
  };

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
        {/* NO WIND Button - Emergency Cancel All Events */}
        {hasEvents && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-red-800 mb-1">Weather Emergency</h4>
                <p className="text-xs text-red-600">Cancel all events due to unsafe wind conditions</p>
              </div>
              <button
                onClick={handleNoWind}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium text-sm rounded transition-colors"
              >
                NO WIND
              </button>
            </div>
          </div>
        )}

        {/* Weather Information */}
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Wind className="w-4 h-4 text-blue-600" />
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">Weather at 3 PM</h4>
            </div>
            {weatherLoading && <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />}
          </div>
          
          {weatherError && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>Weather unavailable: {weatherError}</span>
            </div>
          )}
          
          {weather && !weatherLoading && (
            <div className="space-y-3">
              {/* Main weather info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getWeatherEmoji(weather.icon)}</span>
                  <div>
                    <div className="font-medium">{weather.temperature}°C</div>
                    <div className="text-xs text-blue-700 dark:text-blue-300">{weather.description}</div>
                  </div>
                </div>
                
                <div>
                  <div className="font-medium">{formatWind(weather.windSpeed, weather.windDirection)}</div>
                  <div className="text-xs text-blue-700 dark:text-blue-300">
                    {weather.windGust ? `Gusts ${weather.windGust} km/h` : 'No gusts'}
                  </div>
                </div>
                
                <div>
                  <div className="font-medium">{weather.humidity}% humidity</div>
                  <div className="text-xs text-blue-700 dark:text-blue-300">{weather.visibility} km visibility</div>
                </div>
                
                <div>
                  {weather.precipitationProbability > 0 && (
                    <div className="flex items-center gap-1">
                      <CloudRain className="w-3 h-3" />
                      <span className="text-xs">{weather.precipitationProbability}% rain</span>
                    </div>
                  )}
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    kitingAnalysis?.suitable 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                  }`}>
                    Score: {kitingAnalysis?.score}/10
                  </div>
                </div>
              </div>
              
              {/* Weather recommendations */}
              {recommendations.length > 0 && (
                <div className="bg-white/50 dark:bg-gray-800/50 rounded p-3 space-y-1">
                  <div className="text-xs font-medium text-blue-800 dark:text-blue-200 mb-1">Recommendations:</div>
                  {recommendations.map((rec, index) => (
                    <div key={index} className="text-xs text-blue-700 dark:text-blue-300">• {rec}</div>
                  ))}
                </div>
              )}
              
              {/* Weather-based time suggestions */}
              {weather && (
                <div className="bg-white/50 dark:bg-gray-800/50 rounded p-3">
                  <div className="text-xs font-medium text-blue-800 dark:text-blue-200 mb-1">Optimal Times:</div>
                  <div className="text-xs text-blue-700 dark:text-blue-300">
                    {weather.windSpeed >= 12 && weather.windSpeed <= 25 
                      ? `Current conditions ideal around ${controller.flag ? (controller.submitTime) : controller.submitTime}`
                      : weather.windSpeed < 12
                      ? 'Light winds - consider afternoon thermal winds (14:00-17:00)'
                      : 'Strong winds - morning sessions recommended (11:00-13:00)'
                    }
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

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
