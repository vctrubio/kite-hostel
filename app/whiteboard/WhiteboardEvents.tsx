import { useMemo, useState, useEffect, useCallback } from 'react';
import EventCard, { GapCard } from '@/components/cards/EventCard';
import TeacherLessonQueueCard from '@/components/cards/LessonQueueCard';
import TeacherEventQueue from '@/components/TeacherEventQueue';
import { HeadsetIcon, Clock, Zap, ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
import { FlagIcon } from '@/svgs/FlagIcon';
import { TeacherSchedule, ReorganizationOption } from '@/backend/TeacherSchedule';
import { reorganizeEventTimes } from '@/actions/kite-actions';
import { updateEvent, deleteEvent } from '@/actions/event-actions';
import { timeToMinutes, minutesToTime, createUTCDateTime, toUTCString } from '@/components/formatters/TimeZone';
import { 
  extractStudentNames,
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
  const [viewMode, setViewMode] = useState<'event' | 'queue'>('event');

  const scheduleNodes = useMemo(() => teacherSchedule.getNodes(), [teacherSchedule]);
  const eventNodes = useMemo(() => scheduleNodes.filter(node => node.type === 'event'), [scheduleNodes]);
  
  const [editableScheduleNodes, setEditableScheduleNodes] = useState(scheduleNodes);

  useEffect(() => {
      setEditableScheduleNodes(scheduleNodes);
  }, [scheduleNodes]);

  const handleAdjustDuration = (lessonId: string, increment: boolean) => {
      setEditableScheduleNodes(currentNodes => {
          const nodes = [...currentNodes];
          const targetIndex = nodes.findIndex(node => node.eventData?.lessonId === lessonId);

          if (targetIndex === -1) return nodes;

          const oldDuration = nodes[targetIndex].duration;
          const newDuration = Math.max(30, oldDuration + (increment ? 30 : -30));
          const actualDurationDelta = newDuration - oldDuration;

          if (actualDurationDelta === 0) return currentNodes;

          return nodes.map((node, index) => {
              if (index === targetIndex) {
                  return { ...node, duration: newDuration };
              }
              if (index > targetIndex && node.type === 'event') {
                  const newStartTime = minutesToTime(timeToMinutes(node.startTime) + actualDurationDelta);
                  return { ...node, startTime: newStartTime };
              }
              return node;
          });
      });
  };

  const handleAdjustTime = (lessonId: string, increment: boolean) => {
      setEditableScheduleNodes(currentNodes => {
          const nodes = [...currentNodes];
          const targetIndex = nodes.findIndex(node => node.eventData?.lessonId === lessonId);

          if (targetIndex === -1) return nodes;

          const delta = increment ? 30 : -30;

          return nodes.map((node, index) => {
              if (index >= targetIndex && node.type === 'event') {
                  const newStartTime = minutesToTime(timeToMinutes(node.startTime) + delta);
                  return { ...node, startTime: newStartTime };
              }
              return node;
          });
      });
  };

  const handleRemoveFromQueue = (lessonId: string) => {
      setEditableScheduleNodes(currentNodes => {
          return currentNodes.filter(node => node.eventData?.lessonId !== lessonId);
      });
  };

  const handleMoveInQueue = (lessonId: string, direction: 'up' | 'down') => {
      setEditableScheduleNodes(currentNodes => {
          const nodes = [...currentNodes];
          const index = nodes.findIndex(node => node.eventData?.lessonId === lessonId);

          if (index === -1) return nodes;

          const swapIndex = direction === 'up' ? index - 1 : index + 1;

          if (swapIndex >= 0 && swapIndex < nodes.length) {
              [nodes[index], nodes[swapIndex]] = [nodes[swapIndex], nodes[index]];
          }
          
          return nodes;
      });
  };

  const handleSubmitQueueChanges = async () => {
      console.log("Submitting changes...");

      const originalEventNodes = scheduleNodes.filter(n => n.type === 'event');
      const modifiedEventNodes = editableScheduleNodes.filter(n => n.type === 'event');

      const updatePromises: Promise<any>[] = [];

      // Find and process updates/position changes
      modifiedEventNodes.forEach(modifiedNode => {
          const originalNode = originalEventNodes.find(n => n.eventData.lessonId === modifiedNode.eventData.lessonId);
          if (!originalNode) return; // Should not happen in this UI

          const updates: { date?: string; duration?: number } = {};
          let hasChanges = false;

          if (originalNode.startTime !== modifiedNode.startTime) {
              updates.date = toUTCString(createUTCDateTime(selectedDate, modifiedNode.startTime));
              hasChanges = true;
          }

          if (originalNode.duration !== modifiedNode.duration) {
              updates.duration = modifiedNode.duration;
              hasChanges = true;
          }

          if (hasChanges) {
              const eventData = events.find(e => e.lesson?.id === modifiedNode.eventData.lessonId);
              if (eventData && eventData.id) {
                  console.log(`Updating event ${eventData.id} with`, updates);
                  updatePromises.push(updateEvent(eventData.id, updates));
              }
          }
      });

      // Find and process deletions
      originalEventNodes.forEach(originalNode => {
          if (!modifiedEventNodes.some(n => n.eventData.lessonId === originalNode.eventData.lessonId)) {
              const eventData = events.find(e => e.lesson?.id === originalNode.eventData.lessonId);
              if (eventData && eventData.id) {
                  console.log(`Deleting event ${eventData.id}`);
                  updatePromises.push(deleteEvent(eventData.id));
              }
          }
      });

      if (updatePromises.length > 0) {
          try {
              const results = await Promise.all(updatePromises);
              console.log("All updates complete:", results);
              const failures = results.filter(r => !r.success);
              if (failures.length > 0) {
                  console.error("Some updates failed:", failures);
                  // Here you could add UI feedback, e.g., a toast notification
              } else {
                  console.log("All events updated successfully.");
              }
          } catch (error) {
              console.error("An error occurred during batch update:", error);
          }
      } else {
          console.log("No changes to submit.");
      }
  };

  const handleResetQueue = () => {
    setEditableScheduleNodes(scheduleNodes);
  };

  const handleCancelQueue = () => {
      setViewMode('event');
      setEditableScheduleNodes(scheduleNodes);
  };

  const handleSubmitAndExit = async () => {
      await handleSubmitQueueChanges();
      setViewMode('event');
  };

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

  const handleStatusChange = async (eventId: string, newStatus: "planned" | "completed" | "tbc" | "cancelled") => {
    try {
      const result = await updateEvent(eventId, { status: newStatus });
      if (result.success) {
        console.log('Event status updated successfully:', eventId, 'to', newStatus);
      } else {
        console.error('Failed to update event status:', result.error);
      }
    } catch (error) {
      console.error('Error updating event status:', error);
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
          
          {viewMode === 'event' ? (
            <>
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
              <button
                onClick={() => setViewMode('queue')}
                className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 border border-blue-300"
                title="Edit schedule in queue view"
              >
                Edit Schedule
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleSubmitAndExit}
                className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 border border-green-300"
                title="Submit queue changes"
              >
                Submit
              </button>
              <button
                onClick={handleResetQueue}
                className="ml-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 border border-yellow-300"
                title="Reset all changes made to the queue"
              >
                Reset
              </button>
              <button
                onClick={handleCancelQueue}
                className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded hover:bg-gray-200 border border-gray-300"
                title="Cancel editing and discard all changes"
              >
                Cancel
              </button>
            </>
          )}
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground dark:text-gray-400">
          {viewMode === 'event' && (timeAdjustmentMode ? (
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
          ))}
        </div>
      </div>

      {/* Events Grid */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {viewMode === 'event' && scheduleNodes.map((node, nodeIndex) => {
            if (node.type === 'gap') {
              return (
                <div key={`gap-${node.id}`}>
                  <GapCard 
                    duration={node.duration}
                    startTime={node.startTime}
                  />
                </div>
              );
            }
            
            const eventData = events.find(e => e.lesson?.id === node.eventData?.lessonId);
            if (!eventData) return null;
            
            const studentNames = eventData.booking ? extractStudentNames(eventData.booking) : 'No students';
            
            return (
              <div key={`event-${node.id}-${eventData.id}`}>
                <EventCard
                  students={studentNames}
                  location={eventData?.location || 'No location'}
                  duration={node.duration}
                  date={toUTCString(createUTCDateTime(selectedDate, node.startTime))}
                  status={eventData?.status || 'No status'}
                  viewAs={viewAs}
                  reorganizationOptions={pendingReorganizations.get(eventData.id)}
                  onDelete={() => handleDeleteEvent(eventData, node.id)}
                  onReorganize={(option) => handleReorganize(eventData.id, option)}
                  onDismissReorganization={() => handleDismissReorganization(eventData.id)}
                  onCancelReorganization={() => handleCancelReorganization(eventData.id)}
                  onStatusChange={(newStatus) => handleStatusChange(eventData.id, newStatus)}
                />
              </div>
            );
          })}

          {viewMode === 'queue' && (
            <TeacherEventQueue
              scheduleNodes={editableScheduleNodes}
              originalScheduleNodes={scheduleNodes}
              events={events}
              teacherSchedule={teacherSchedule}
              selectedDate={selectedDate}
              onRemove={handleRemoveFromQueue}
              onAdjustDuration={handleAdjustDuration}
              onAdjustTime={handleAdjustTime}
              onMove={handleMoveInQueue}
            />
          )}
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
