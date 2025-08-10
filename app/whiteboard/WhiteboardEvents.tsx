import { useMemo, useState } from 'react';
import EventCard, { GapCard } from '@/components/cards/EventCard';
import { HeadsetIcon, Clock, Zap, ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
import { FlagIcon } from '@/svgs/FlagIcon';
import { TeacherSchedule, ReorganizationOption } from '@/backend/TeacherSchedule';
import { deleteEvent, reorganizeEventTimes } from '@/actions/kite-actions';
import { timeToMinutes, minutesToTime, createUTCDateTime, toUTCString } from '@/components/formatters/TimeZone';
import { 
  extractStudentNames,
  extractTeacherInfo,
  WhiteboardClass
} from '@/backend/WhiteboardClass';

interface WhiteboardEventsProps {
  events: any[];
  selectedDate: string;
  teacherSchedules: Map<string, TeacherSchedule>;
  viewAs?: 'admin' | 'teacher' | 'student';
}

// Sub-component: Teacher Events Group using TeacherSchedule
function TeacherEventsGroup({ 
  teacherSchedule, 
  events,
  selectedDate,
  viewAs = 'admin'
}: { 
  teacherSchedule: TeacherSchedule;
  events: any[];
  selectedDate: string;
  viewAs?: 'admin' | 'teacher' | 'student';
}) {
  const [pendingReorganizations, setPendingReorganizations] = useState<Map<string, ReorganizationOption[]>>(new Map());
  const [timeAdjustmentMode, setTimeAdjustmentMode] = useState(false);
  const [proposedTimeOffset, setProposedTimeOffset] = useState(0);

  const scheduleNodes = teacherSchedule.getNodes(); // This now includes auto-detected gaps
  const eventNodes = scheduleNodes.filter(node => node.type === 'event');
  
  // Calculate metrics using TeacherSchedule
  const totalDuration = eventNodes.reduce((sum, node) => sum + node.duration, 0);
  const eventCount = eventNodes.length;
  
  // Get earliest event time from schedule - use first node for controller logic
  const firstEventTime = eventNodes.length > 0 ? eventNodes[0].startTime : null;
  const earliestEventTime = firstEventTime || 'No events';
  
  const schedule = teacherSchedule.getSchedule();

  // Check if reorganization is possible
  const canReorganize = teacherSchedule.canReorganizeSchedule();

  // Create mapping from lesson ID to event ID for database updates
  const createEventIdMap = (): Map<string, string> => {
    const map = new Map<string, string>();
    events.forEach(eventData => {
      if (eventData.lesson?.id && eventData.id) {
        map.set(eventData.lesson.id, eventData.id);
      }
    });
    return map;
  };

  const handleFullScheduleReorganization = async () => {
    try {
      // Create event ID mapping for database updates
      const eventIdMap = createEventIdMap();
      
      // Get all event nodes to reorganize
      const allEventNodes = eventNodes.filter(node => node.type === 'event');
      if (allEventNodes.length <= 1) {
        console.log('No reorganization needed - only one or no events');
        return;
      }
      
      // Create a reorganization option that moves all events after the first one
      const firstEventTime = allEventNodes[0].startTime;
      const nodesToMove = allEventNodes.slice(1); // All events except the first
      
      const reorganizationOption: ReorganizationOption = {
        type: 'compact_schedule',
        description: `Compact entire schedule by moving ${nodesToMove.length} events`,
        nodesToMove: nodesToMove,
        timeSaved: 0, // Will be calculated to eliminate gaps
        feasible: true,
        deletedEventTime: firstEventTime // Use first event time as anchor
      };
      
      // Calculate database updates for the reorganization
      const databaseUpdates: Array<{ eventId: string; newDateTime: string }> = [];
      
      // Start timing from right after the first event ends
      let nextStartTime = timeToMinutes(firstEventTime) + allEventNodes[0].duration;
      
      // Generate updates for each node that needs to move
      nodesToMove.forEach(node => {
        const lessonId = node.eventData?.lessonId;
        const eventId = lessonId ? eventIdMap.get(lessonId) : undefined;
        
        if (eventId && lessonId) {
          const newStartTime = minutesToTime(nextStartTime);
          const newDateTime = toUTCString(createUTCDateTime(selectedDate, newStartTime));
          
          databaseUpdates.push({
            eventId,
            newDateTime
          });
        }
        
        // Next event starts after this one ends (account for duration)
        nextStartTime += node.duration;
      });
      
      // Apply reorganization to the schedule
      const success = teacherSchedule.reorganizeTeacherEvents(reorganizationOption);
      if (!success) {
        console.error('Failed to reorganize schedule');
        return;
      }
      
      // Update database if we have changes to make
      if (databaseUpdates.length > 0) {
        const dbResult = await reorganizeEventTimes(databaseUpdates);
        if (dbResult.success) {
          console.log(`Full schedule reorganized successfully. Updated ${dbResult.updatedCount} events in database.`);
        } else {
          console.error('Failed to update database:', dbResult.error);
          return;
        }
      } else {
        console.log('Schedule already optimized');
      }
    } catch (error) {
      console.error('Error reorganizing full schedule:', error);
    }
  };

  const handleDeleteEvent = async (eventData: any, eventNodeId?: string) => {
    try {
      // First get reorganization options if we have a node ID
      let reorganizationOptions: ReorganizationOption[] = [];
      if (eventNodeId) {
        reorganizationOptions = teacherSchedule.getReorganizationOptions(eventNodeId);
      }

      // Show reorganization options BEFORE deleting if available
      if (reorganizationOptions.length > 0) {
        setPendingReorganizations(prev => {
          const newMap = new Map(prev);
          newMap.set(eventData.id, reorganizationOptions);
          return newMap;
        });
        
        // Don't delete yet - wait for user to choose reorganization option
        console.log('Reorganization options available. Please choose an option or dismiss.');
        return;
      }

      // Only delete immediately if no reorganization options
      await performDelete(eventData.id, eventNodeId);
    } catch (error) {
      console.error('Error preparing event deletion:', error);
    }
  };

  const performDelete = async (eventId: string, eventNodeId?: string) => {
    try {
      // Delete the event from database
      const result = await deleteEvent(eventId);
      if (result.success) {
        console.log('Event deleted successfully:', eventId);
        
        // Remove from teacher schedule
        if (eventNodeId) {
          teacherSchedule.removeNode(eventNodeId); // No manual gap needed, auto-detected
        }
      } else {
        console.error('Failed to delete event:', result.error);
      }
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const handleReorganize = async (eventId: string, option: ReorganizationOption) => {
    try {
      // Find the event node before deleting
      const eventNodeId = eventNodes.find(node => 
        node.eventData?.lessonId === events.find(e => e.id === eventId)?.lesson?.id
      )?.id;
      
      if (!eventNodeId) {
        console.error('Could not find event node to reorganize');
        return;
      }
      
      // IMPORTANT: Store the deleted event's time slot before removing it
      const nodeToDelete = eventNodes.find(node => node.id === eventNodeId);
      const deletedEventStartTime = nodeToDelete?.startTime;
      
      if (!deletedEventStartTime) {
        console.error('Could not find deleted event start time');
        return;
      }
      
      // Get the database updates that simulate reorganization after removal
      const eventIdMap = createEventIdMap();
      
      // Create a modified option that includes the deleted event's time slot
      const modifiedOption: ReorganizationOption = {
        ...option,
        deletedEventTime: deletedEventStartTime // Add the deleted event's time as reference
      };
      
      const databaseUpdates = teacherSchedule.getDatabaseUpdatesAfterNodeRemoval(
        eventNodeId,
        modifiedOption, 
        selectedDate, 
        eventIdMap
      );
      
      // Delete the event from database first
      const deleteResult = await deleteEvent(eventId);
      if (!deleteResult.success) {
        console.error('Failed to delete event:', deleteResult.error);
        return;
      }
      
      // Remove from teacher schedule
      teacherSchedule.removeNode(eventNodeId);
      
      // Apply reorganization to the schedule using the modified option
      const success = teacherSchedule.reorganizeTeacherEvents(modifiedOption);
      if (!success) {
        console.error('Failed to reorganize schedule');
        return;
      }
      
      // Update database with the reorganized times
      if (databaseUpdates.length > 0) {
        const dbResult = await reorganizeEventTimes(databaseUpdates);
        if (dbResult.success) {
          console.log(`Event deleted and schedule reorganized: ${option.description}. Updated ${dbResult.updatedCount} events in database.`);
        } else {
          console.error('Failed to update database:', dbResult.error);
          return;
        }
      } else {
        console.log('Event deleted successfully. No reorganization needed.');
      }
      
      // Clear pending reorganizations for this event
      setPendingReorganizations(prev => {
        const newMap = new Map(prev);
        newMap.delete(eventId);
        return newMap;
      });
      
    } catch (error) {
      console.error('Error reorganizing schedule:', error);
    }
  };

  const handleCancelReorganization = (eventId: string) => {
    // Simply clear the reorganization options without deleting
    setPendingReorganizations(prev => {
      const newMap = new Map(prev);
      newMap.delete(eventId);
      return newMap;
    });
  };

  const handleDismissReorganization = async (eventId: string) => {
    // Clear reorganization options and proceed with deletion
    setPendingReorganizations(prev => {
      const newMap = new Map(prev);
      newMap.delete(eventId);
      return newMap;
    });
    
    // Find the event data and node ID
    const eventData = events.find(e => e.id === eventId);
    const eventNodeId = eventNodes.find(node => 
      node.eventData?.lessonId === eventData?.lesson?.id
    )?.id;
    
    await performDelete(eventId, eventNodeId);
  };

  const handleTimeAdjustment = (minutesOffset: number) => {
    setProposedTimeOffset(prev => prev + minutesOffset);
  };

  const handleAcceptTimeAdjustment = async () => {
    try {
      if (proposedTimeOffset === 0) {
        setTimeAdjustmentMode(false);
        return;
      }

      // Create event ID mapping for database updates
      const eventIdMap = createEventIdMap();
      
      // Apply the time shift to the teacher schedule
      const success = teacherSchedule.shiftFirstEventAndReorganize(proposedTimeOffset);
      if (!success) {
        console.error('Failed to shift schedule');
        return;
      }
      
      // Get database updates for the shifted schedule
      const databaseUpdates = teacherSchedule.getDatabaseUpdatesForShiftedSchedule(selectedDate, eventIdMap);
      
      // Update database with the new times
      if (databaseUpdates.length > 0) {
        const dbResult = await reorganizeEventTimes(databaseUpdates);
        if (dbResult.success) {
          console.log(`Schedule shifted by ${proposedTimeOffset} minutes. Updated ${dbResult.updatedCount} events in database.`);
        } else {
          console.error('Failed to update database:', dbResult.error);
          return;
        }
      }
      
      // Reset adjustment state
      setTimeAdjustmentMode(false);
      setProposedTimeOffset(0);
      
    } catch (error) {
      console.error('Error adjusting schedule time:', error);
    }
  };

  const handleCancelTimeAdjustment = () => {
    setTimeAdjustmentMode(false);
    setProposedTimeOffset(0);
  };

  return (
    <div className="bg-card dark:bg-gray-800 border border-border dark:border-gray-700 rounded-lg">
      {/* Enhanced Teacher Header using TeacherSchedule data */}
      <div className="flex justify-between items-center p-4 border-b border-border dark:border-gray-700">
        <div className="flex items-center gap-2">
          <HeadsetIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
          <h4 className="text-lg font-medium text-foreground dark:text-white">
            {schedule.teacherName}
          </h4>
          {canReorganize && viewAs === 'admin' && (
            <button
              onClick={handleFullScheduleReorganization}
              className="ml-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 border border-yellow-300"
              title="Optimize schedule by removing gaps"
            >
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                <span>Reorganize</span>
              </div>
            </button>
          )}
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground dark:text-gray-400">
          {timeAdjustmentMode ? (
            <div className="flex items-center gap-1">
              <FlagIcon className="w-4 h-4" />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleTimeAdjustment(-30)}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="Move back 30 minutes"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="min-w-[60px] text-center font-mono">
                  {firstEventTime ? minutesToTime(timeToMinutes(firstEventTime) + proposedTimeOffset) : 'No events'}
                  {proposedTimeOffset !== 0 && (
                    <span className="text-orange-600 dark:text-orange-400 ml-1">
                      ({proposedTimeOffset > 0 ? '+' : ''}{proposedTimeOffset}m)
                    </span>
                  )}
                </span>
                <button
                  onClick={() => handleTimeAdjustment(30)}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="Move forward 30 minutes"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={handleAcceptTimeAdjustment}
                  className="p-1 rounded bg-green-100 hover:bg-green-200 text-green-700 dark:bg-green-900 dark:hover:bg-green-800 dark:text-green-300"
                  title="Accept changes"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCancelTimeAdjustment}
                  className="p-1 rounded bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900 dark:hover:bg-red-800 dark:text-red-300"
                  title="Cancel changes"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div 
              onClick={() => setTimeAdjustmentMode(true)}
              className="flex items-center gap-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-2 py-1 cursor-pointer transition-colors"
              title="Click to adjust start time"
            >
              <FlagIcon className="w-4 h-4" />
              <span>{earliestEventTime}</span>
            </div>
          )}
        </div>
      </div>

      {/* Events Grid */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {scheduleNodes
            .map((node, nodeIndex) => {
              if (node.type === 'gap') {
                // Render gap card
                return (
                  <div key={`gap-${node.id}`}>
                    <GapCard 
                      duration={node.duration}
                      startTime={node.startTime}
                    />
                  </div>
                );
              }
              
              // Find corresponding event data for this schedule node
              const eventData = events.find(e => 
                e.lesson?.id === node.eventData?.lessonId
              );
              
              if (!eventData) return null;
              
              // Enhanced student names using business logic
              const studentNames = eventData.booking ? extractStudentNames(eventData.booking) : 'No students';
              
              return (
                <div key={`event-${node.id}-${eventData.id}`}>
                  <EventCard
                    students={studentNames}
                    location={eventData?.location || 'No location'}
                    duration={eventData?.duration || 0}
                    date={eventData?.date || 'No date'}
                    status={eventData?.status || 'No status'}
                    viewAs={viewAs}
                    reorganizationOptions={pendingReorganizations.get(eventData.id)}
                    onDelete={() => handleDeleteEvent(eventData, node.id)}
                    onReorganize={(option) => handleReorganize(eventData.id, option)}
                    onDismissReorganization={() => handleDismissReorganization(eventData.id)}
                    onCancelReorganization={() => handleCancelReorganization(eventData.id)}
                    onStatusChange={(newStatus) => {
                      // TODO: Implement status change functionality
                      console.log('Change status:', eventData.id, 'to', newStatus);
                    }}
                  />
                </div>
              );
            })
            .filter(Boolean)} {/* Remove null entries */}
        </div>
      </div>
    </div>
  );
}

export default function WhiteboardEvents({ events, selectedDate, teacherSchedules, viewAs = 'admin' }: WhiteboardEventsProps) {
  // Group events by teacher for rendering
  const teacherEventGroups = useMemo(() => {
    const groups = new Map<string, any[]>();
    
    events
      .filter(eventData => eventData?.id != null) // Filter out null/undefined events
      .forEach((eventData) => {
        const teacherId = eventData.lesson?.teacher?.id || 'unassigned';
        
        if (!groups.has(teacherId)) {
          groups.set(teacherId, []);
        }
        groups.get(teacherId)!.push(eventData);
      });
    
    const result = Array.from(groups.entries()).map(([teacherId, eventDataList]) => ({
      teacherId,
      teacherSchedule: teacherSchedules.get(teacherId),
      events: eventDataList
    })).filter(group => group.teacherSchedule); // Only include teachers with schedules
    
    return result;
  }, [events, teacherSchedules]);

  return (
    <div className="space-y-6">
      {teacherEventGroups.length === 0 ? (
        <div className="p-8 bg-muted dark:bg-gray-800 rounded-lg text-center">
          <p className="text-muted-foreground dark:text-gray-400">No events found for this date</p>
        </div>
      ) : (
        <div className="space-y-4">
          {teacherEventGroups.map((group) => (
            <TeacherEventsGroup 
              key={group.teacherId}
              teacherSchedule={group.teacherSchedule}
              events={group.events}
              selectedDate={selectedDate}
              viewAs={viewAs}
            />
          ))}
        </div>
      )}
    </div>
  );
}
