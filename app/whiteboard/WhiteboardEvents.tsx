'use client';

import { useMemo, useState, useEffect } from 'react';
import EventCard, { GapCard } from '@/components/cards/EventCard';
import TeacherEventQueue from '@/components/TeacherEventQueue';
import { HeadsetIcon, Zap, ChevronLeft, ChevronRight } from 'lucide-react';
import { FlagIcon } from '@/svgs/FlagIcon';
import { TeacherSchedule, ScheduleNode } from '@/backend/TeacherSchedule';
import { type ReorganizationOption } from '@/backend/types';
import { reorganizeEventTimes } from '@/actions/kite-actions';
import { updateEvent, deleteEvent } from '@/actions/event-actions';
import { timeToMinutes, minutesToTime, createUTCDateTime, toUTCString } from '@/components/formatters/TimeZone';
import { 
  extractStudentNames,
} from '@/backend/WhiteboardClass';

// Sub-component: Time Adjustment Flag
interface TimeAdjustmentFlagProps {
  firstEventTime: string | null;
  proposedTimeOffset: number;
  timeAdjustmentMode: boolean;
  editableScheduleNodes: ScheduleNode[];
  parentTimeAdjustmentMode?: boolean;
  onTimeAdjustment: (minutesOffset: number) => void;
  onAcceptTimeAdjustment: () => void;
  onCancelTimeAdjustment: () => void;
  onSetTimeAdjustmentMode: (mode: boolean) => void;
  onSetViewMode: (mode: 'event' | 'queue') => void;
}

function TimeAdjustmentFlag({ ...props }) {
  const { 
    firstEventTime, 
    proposedTimeOffset, 
    timeAdjustmentMode, 
    editableScheduleNodes, 
    parentTimeAdjustmentMode = false, 
    onTimeAdjustment, 
    onAcceptTimeAdjustment, 
    onCancelTimeAdjustment, 
    onSetTimeAdjustmentMode, 
    onSetViewMode 
  } = props;
  // Always show the actual first lesson time from the editable schedule
  const firstEventNode = editableScheduleNodes.find(node => node.type === 'event');
  const displayTime = firstEventNode ? firstEventNode.startTime : (firstEventTime || 'No events');

  if (timeAdjustmentMode) {
    return (
      <div className="flex items-center gap-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onTimeAdjustment(-30)}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Move back 30 minutes"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="min-w-[60px] text-center font-mono">
            {displayTime}
            {proposedTimeOffset !== 0 && !parentTimeAdjustmentMode && (
              <span className="text-orange-600 dark:text-orange-400 ml-1">
                ({proposedTimeOffset > 0 ? '+' : ''}{proposedTimeOffset}m)
              </span>
            )}
          </span>
          <button
            onClick={() => onTimeAdjustment(30)}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Move forward 30 minutes"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={() => {
        onSetTimeAdjustmentMode(true); // Enter time adjustment mode
        onSetViewMode('queue'); // Switch to queue view to see real-time updates
      }}
      className="flex items-center gap-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-2 py-1 cursor-pointer transition-colors"
      title="Click to adjust start time and switch to queue view"
    >
      <FlagIcon className="w-4 h-4" />
      <span>{displayTime}</span>
    </div>
  );
}

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
  viewAs = 'admin',
  parentTimeAdjustmentMode = false,
  parentGlobalTimeOffset = 0
}: { 
  teacherSchedule: TeacherSchedule;
  events: any[];
  selectedDate: string;
  viewAs?: 'admin' | 'teacher' | 'student';
  parentTimeAdjustmentMode?: boolean;
  parentGlobalTimeOffset?: number;
}) {
  const [pendingReorganizations, setPendingReorganizations] = useState<Map<string, ReorganizationOption[]>>(new Map());
  const [timeAdjustmentMode, setTimeAdjustmentMode] = useState(false);
  const [globalTimeOffset, setGlobalTimeOffset] = useState(0); // Global offset from original schedule
  const [viewMode, setViewMode] = useState<'event' | 'queue'>('event');

  const scheduleNodes = useMemo(() => teacherSchedule.getNodes(), [teacherSchedule]);
  const eventNodes = useMemo(() => scheduleNodes.filter(node => node.type === 'event'), [scheduleNodes]);
  
  const [editableScheduleNodes, setEditableScheduleNodes] = useState(scheduleNodes);

  // Check if this teacher schedule has been modified independently
  const hasIndependentModifications = useMemo(() => {
    if (parentTimeAdjustmentMode && parentGlobalTimeOffset !== 0) {
      // If parent is adjusting, check if this teacher's first event time differs from what it would be with parent offset
      const firstEvent = eventNodes[0];
      if (firstEvent) {
        const expectedTimeWithParentOffset = timeToMinutes(firstEvent.startTime) + parentGlobalTimeOffset;
        const actualTime = timeToMinutes(editableScheduleNodes.find(n => n.type === 'event')?.startTime || firstEvent.startTime);
        
        // If the actual time doesn't match what it should be with parent offset, it has independent modifications
        return Math.abs(actualTime - expectedTimeWithParentOffset) > 1; // Allow 1 minute tolerance
      }
    }
    return false;
  }, [parentTimeAdjustmentMode, parentGlobalTimeOffset, eventNodes, editableScheduleNodes]);

  // Auto-switch to edit mode when parent is active or teacher has independent modifications
  useEffect(() => {
    if (parentTimeAdjustmentMode && viewMode === 'event') {
      setViewMode('queue');
      setTimeAdjustmentMode(true);
    }
  }, [parentTimeAdjustmentMode, viewMode]);

  // Apply parent offset to teachers or reset when parent is cancelled
  useEffect(() => {
    if (parentTimeAdjustmentMode) {
      if (parentGlobalTimeOffset !== 0) {
        // Simply apply the parent offset to all events in this teacher's schedule
        const updatedNodes = scheduleNodes.map(node => {
          if (node.type === 'event') {
            const originalTime = timeToMinutes(node.startTime);
            const newTime = originalTime + parentGlobalTimeOffset;
            return {
              ...node,
              startTime: minutesToTime(Math.max(0, newTime)) // Ensure time is not negative
            };
          }
          return node;
        });
        
        setEditableScheduleNodes(updatedNodes);
        setGlobalTimeOffset(parentGlobalTimeOffset);
      } else {
        // Parent is active but no offset - show original schedule in edit mode
        setEditableScheduleNodes(scheduleNodes);
        setGlobalTimeOffset(0);
      }
    } else {
      // Parent is not active - reset to original state
      setEditableScheduleNodes(scheduleNodes);
      setGlobalTimeOffset(0);
      setTimeAdjustmentMode(false);
      setViewMode('event');
    }
  }, [parentTimeAdjustmentMode, parentGlobalTimeOffset, scheduleNodes]);

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

          // If this is the first event and we're changing duration, we need to update subsequent events
          // but this doesn't affect the global offset since we're not changing the start time
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

          // If this is the first event, update the global offset
          if (targetIndex === 0) {
              setGlobalTimeOffset(prev => prev + delta);
          }

          const updatedNodes = nodes.map((node, index) => {
              if (index >= targetIndex && node.type === 'event') {
                  const newStartTime = minutesToTime(timeToMinutes(node.startTime) + delta);
                  return { ...node, startTime: newStartTime };
              }
              return node;
          });

          // Auto-close gaps when moving later (+30 minutes)
          if (increment && targetIndex < nodes.length - 1) {
              const eventNodes = updatedNodes.filter(n => n.type === 'event');
              const currentEventIndex = eventNodes.findIndex(n => n.eventData?.lessonId === lessonId);
              
              if (currentEventIndex >= 0 && currentEventIndex < eventNodes.length - 1) {
                  const currentEvent = eventNodes[currentEventIndex];
                  const nextEvent = eventNodes[currentEventIndex + 1];
                  
                  const currentEndTime = timeToMinutes(currentEvent.startTime) + currentEvent.duration;
                  const nextStartTime = timeToMinutes(nextEvent.startTime);
                  const gap = nextStartTime - currentEndTime;
                  
                  // If gap is exactly 30 minutes (the adjustment we just made), close it
                  if (gap === 30) {
                      // Move all subsequent events 30 minutes earlier
                      return updatedNodes.map((node, index) => {
                          const nodeEventIndex = eventNodes.findIndex(en => en.id === node.id);
                          if (nodeEventIndex > currentEventIndex && node.type === 'event') {
                              const newStartTime = minutesToTime(timeToMinutes(node.startTime) - 30);
                              return { ...node, startTime: newStartTime };
                          }
                          return node;
                      });
                  }
              }
          }

          return updatedNodes;
      });
  };

  const handleRemoveFromQueue = (lessonId: string) => {
      setEditableScheduleNodes(currentNodes => {
          const filteredNodes = currentNodes.filter(node => node.eventData?.lessonId !== lessonId);
          
          // If we removed the first event, we need to recalculate the global offset
          // based on the new first event's time compared to the original first event
          if (currentNodes[0]?.eventData?.lessonId === lessonId && filteredNodes.length > 0) {
              const newFirstEvent = filteredNodes.find(node => node.type === 'event');
              const originalFirstEvent = scheduleNodes.find(node => node.type === 'event');
              
              if (newFirstEvent && originalFirstEvent) {
                  const newTime = timeToMinutes(newFirstEvent.startTime);
                  const originalTime = timeToMinutes(originalFirstEvent.startTime);
                  const newOffset = newTime - originalTime;
                  setGlobalTimeOffset(newOffset);
              }
          }
          
          return filteredNodes;
      });
  };

  // Remove gap for lesson - use existing TeacherSchedule method
  const handleRemoveGap = (lessonId: string) => {
    if (!teacherSchedule) return;
    
    // Use the existing TeacherSchedule gap removal method
    teacherSchedule.removeGapForLesson(lessonId);
    
    // Update the editable schedule nodes to reflect the changes
    const updatedNodes = teacherSchedule.getNodes();
    setEditableScheduleNodes(updatedNodes);
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
          if (!originalNode) return;

          const updates: { date?: string; duration?: number } = {};
          let hasChanges = false;

          if (originalNode.startTime !== modifiedNode.startTime) {
              // Create a local date object and convert to ISO string for the database (which will be UTC)
              updates.date = new Date(`${selectedDate}T${modifiedNode.startTime}`).toISOString();
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
    const newOffset = globalTimeOffset + minutesOffset;
    setGlobalTimeOffset(newOffset);
    
    if (newOffset === 0) {
      // Reset to original state
      setEditableScheduleNodes(scheduleNodes);
      return;
    }
    
    // Apply global time offset to all events
    const updatedNodes = scheduleNodes.map(node => {
      if (node.type === 'event') {
        const originalTime = timeToMinutes(node.startTime);
        const newTime = originalTime + newOffset;
        return {
          ...node,
          startTime: minutesToTime(Math.max(0, newTime)) // Ensure time is not negative
        };
      }
      return node;
    });
    
    setEditableScheduleNodes(updatedNodes);
  };

  const handleAcceptTimeAdjustment = async () => {
    try {
      if (globalTimeOffset === 0) {
        setTimeAdjustmentMode(false);
        setEditableScheduleNodes(scheduleNodes); // Reset to original
        return;
      }

      // Create event ID mapping for database updates
      const eventIdMap = createEventIdMap();
      
      // Apply the global time shift to the teacher schedule
      const success = teacherSchedule.shiftFirstEventAndReorganize(globalTimeOffset);
      if (!success) {
        console.error('Failed to shift schedule');
        return;
      }
      
      // Get database updates for the shifted schedule using the proper method
      const databaseUpdates = teacherSchedule.getDatabaseUpdatesForShiftedSchedule(selectedDate, eventIdMap);
      
      // Update database with the new times
      if (databaseUpdates.length > 0) {
        const dbResult = await reorganizeEventTimes(databaseUpdates);
        if (dbResult.success) {
          console.log(`Schedule shifted by ${globalTimeOffset} minutes. Updated ${dbResult.updatedCount} events in database.`);
          
          // Update the editable schedule nodes to reflect the actual changes
          const updatedNodes = teacherSchedule.getNodes();
          setEditableScheduleNodes(updatedNodes);
        } else {
          console.error('Failed to update database:', dbResult.error);
          // Reset to original on failure
          setEditableScheduleNodes(scheduleNodes);
        }
      }
      
      // Reset adjustment state
      setTimeAdjustmentMode(false);
      setGlobalTimeOffset(0);
      // Switch back to event view only if parent is not active
      if (!parentTimeAdjustmentMode) {
        setViewMode('event');
      }
      
    } catch (error) {
      console.error('Error adjusting schedule time:', error);
      // Reset to original on error
      setEditableScheduleNodes(scheduleNodes);
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
    setGlobalTimeOffset(0);
    // Reset the editable schedule nodes to the original state
    setEditableScheduleNodes(scheduleNodes);
    // Switch back to event view only if parent is not active
    if (!parentTimeAdjustmentMode) {
      setViewMode('event');
    }
  };

  return (
    <div className="bg-card dark:bg-gray-800 border border-border dark:border-gray-700 rounded-lg">
      {/* Enhanced Teacher Header using TeacherSchedule data */}
      <div className={`flex justify-between items-center p-4 border-b border-border dark:border-gray-700 ${
        hasIndependentModifications ? 'bg-orange-50 dark:bg-orange-900/20' : ''
      }`}>
        <div className="flex items-center gap-2">
          <HeadsetIcon className={`w-5 h-5 ${
            hasIndependentModifications ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'
          }`} />
          <h4 className="text-lg font-medium text-foreground dark:text-white">
            {schedule.teacherName}
          </h4>
          <TimeAdjustmentFlag
            firstEventTime={firstEventTime}
            proposedTimeOffset={globalTimeOffset}
            timeAdjustmentMode={timeAdjustmentMode}
            editableScheduleNodes={editableScheduleNodes}
            parentTimeAdjustmentMode={parentTimeAdjustmentMode}
            onTimeAdjustment={handleTimeAdjustment}
            onAcceptTimeAdjustment={handleAcceptTimeAdjustment}
            onCancelTimeAdjustment={handleCancelTimeAdjustment}
            onSetTimeAdjustmentMode={setTimeAdjustmentMode}
            onSetViewMode={setViewMode}
          />
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground dark:text-gray-400">
          {viewMode === 'event' ? (
            <>
              {canReorganize && viewAs === 'admin' && (
                <button
                  onClick={handleFullScheduleReorganization}
                  className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 border border-yellow-300"
                  title="Optimize schedule by removing gaps"
                >
                  <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    <span>Reorganize</span>
                  </div>
                </button>
              )}
              <button
                onClick={() => {
                  setViewMode('queue');
                  setTimeAdjustmentMode(true); // Also put flag in edit mode
                }}
                className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 border border-blue-300"
                title="Edit schedule in queue view"
              >
                Edit Schedule
              </button>
            </>
          ) : (
            <>
              <button
                onClick={timeAdjustmentMode ? handleAcceptTimeAdjustment : handleSubmitAndExit}
                className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 border border-green-300"
                title={timeAdjustmentMode ? "Accept time changes" : "Submit queue changes"}
              >
                Submit
              </button>
              <button
                onClick={timeAdjustmentMode ? handleCancelTimeAdjustment : handleResetQueue}
                className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 border border-yellow-300"
                title={timeAdjustmentMode ? "Cancel time changes" : "Reset all changes made to the queue"}
              >
                Reset
              </button>
              <button
                onClick={timeAdjustmentMode ? handleCancelTimeAdjustment : handleCancelQueue}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded hover:bg-gray-200 border border-gray-300"
                title={timeAdjustmentMode ? "Cancel time changes" : "Cancel editing and discard all changes"}
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {/* Events Grid */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {viewMode === 'event' && scheduleNodes.map((node) => {
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
                  date={new Date(`${selectedDate}T${node.startTime}`).toISOString()}
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
              onRemoveGap={handleRemoveGap}
            />
          )}
        </div>
      </div>
    </div>
  );
}


export default function WhiteboardEvents({ events, selectedDate, teacherSchedules, viewAs = 'admin' }: WhiteboardEventsProps) {
  // Parent time adjustment state
  const [parentTimeAdjustmentMode, setParentTimeAdjustmentMode] = useState(false);
  const [parentGlobalTimeOffset, setParentGlobalTimeOffset] = useState(0);
  
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

  // Find the earliest time across all teachers (original schedule, not modified)
  const earliestTime = useMemo(() => {
    if (teacherEventGroups.length === 0) return null;
    
    const allFirstTimes = teacherEventGroups
      .map(group => {
        const firstEvent = group.teacherSchedule?.getNodes().find(node => node.type === 'event');
        return firstEvent ? timeToMinutes(firstEvent.startTime) : Infinity;
      })
      .filter(time => time !== Infinity);
    
    return allFirstTimes.length > 0 ? minutesToTime(Math.min(...allFirstTimes)) : null;
  }, [teacherEventGroups]);

  // Parent time adjustment handlers
  const handleParentTimeAdjustment = (minutesOffset: number) => {
    const newOffset = parentGlobalTimeOffset + minutesOffset;
    setParentGlobalTimeOffset(newOffset);
  };

  const handleParentAcceptTimeAdjustment = async () => {
    try {
      if (parentGlobalTimeOffset === 0) {
        setParentTimeAdjustmentMode(false);
        return;
      }

      // Apply the global time shift to all teacher schedules
      const updatePromises: Promise<any>[] = [];
      
      teacherEventGroups.forEach(group => {
        const teacherSchedule = group.teacherSchedule;
        if (teacherSchedule) {
          const success = teacherSchedule.shiftFirstEventAndReorganize(parentGlobalTimeOffset);
          if (success) {
            // Get database updates for this teacher
            const eventIdMap = new Map<string, string>();
            group.events.forEach(eventData => {
              if (eventData.lesson?.id && eventData.id) {
                eventIdMap.set(eventData.lesson.id, eventData.id);
              }
            });
            
            const databaseUpdates = teacherSchedule.getDatabaseUpdatesForShiftedSchedule(selectedDate, eventIdMap);
            if (databaseUpdates.length > 0) {
              updatePromises.push(reorganizeEventTimes(databaseUpdates));
            }
          }
        }
      });

      if (updatePromises.length > 0) {
        const results = await Promise.all(updatePromises);
        const failures = results.filter(r => !r.success);
        if (failures.length === 0) {
          console.log(`Parent time adjustment applied successfully. Updated ${results.length} teachers.`);
        } else {
          console.error("Some parent time updates failed:", failures);
        }
      }
      
      // Reset parent adjustment state
      setParentTimeAdjustmentMode(false);
      setParentGlobalTimeOffset(0);
      
    } catch (error) {
      console.error('Error applying parent time adjustment:', error);
    }
  };

  const handleParentCancelTimeAdjustment = () => {
    setParentTimeAdjustmentMode(false);
    setParentGlobalTimeOffset(0);
    // All teachers will automatically reset via useEffect when parentTimeAdjustmentMode becomes false
  };

  // Function to put all teachers in edit mode when parent flag is clicked
  const handleParentFlagClick = () => {
    setParentTimeAdjustmentMode(true);
    // All teachers will automatically go into edit mode via useEffect
  };

  return (
    <div className="space-y-6">
      {/* Parent Time Adjustment Flag */}
      {teacherEventGroups.length > 0 && (
        <div className="bg-card dark:bg-gray-800 border border-border dark:border-gray-700 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <HeadsetIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-medium text-foreground dark:text-white">
                Global Schedule Control
              </h3>
              {parentTimeAdjustmentMode ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleParentTimeAdjustment(-30)}
                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                    title="Move all schedules back 30 minutes"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="min-w-[60px] text-center font-mono">
                    {earliestTime ? minutesToTime(timeToMinutes(earliestTime) + parentGlobalTimeOffset) : 'No events'}
                    {parentGlobalTimeOffset !== 0 && (
                      <span className="text-orange-600 dark:text-orange-400 ml-1">
                        ({parentGlobalTimeOffset > 0 ? '+' : ''}{parentGlobalTimeOffset}m)
                      </span>
                    )}
                  </span>
                  <button
                    onClick={() => handleParentTimeAdjustment(30)}
                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                    title="Move all schedules forward 30 minutes"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div 
                  onClick={handleParentFlagClick}
                  className="flex items-center gap-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-2 py-1 cursor-pointer transition-colors"
                  title="Click to adjust all schedules globally"
                >
                  <FlagIcon className="w-4 h-4" />
                  <span>{earliestTime || 'No events'}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {parentTimeAdjustmentMode ? (
                <>
                  <button
                    onClick={handleParentAcceptTimeAdjustment}
                    className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 border border-green-300"
                    title="Apply global time adjustment to all teachers"
                  >
                    Submit All
                  </button>
                  <button
                    onClick={handleParentCancelTimeAdjustment}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded hover:bg-gray-200 border border-gray-300"
                    title="Cancel global time adjustment"
                  >
                    Cancel
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {teacherEventGroups.length === 0 ? (
        <div className="p-8 bg-muted dark:bg-gray-800 rounded-lg text-center">
          <p className="text-muted-foreground dark:text-gray-400">No events found for this date</p>
        </div>
      ) : (
        <div className="space-y-4">
          {teacherEventGroups.map((group) => (
            <TeacherEventsGroup 
              key={group.teacherId}
              teacherSchedule={group.teacherSchedule!}
              events={group.events}
              selectedDate={selectedDate}
              viewAs={viewAs}
              parentTimeAdjustmentMode={parentTimeAdjustmentMode}
              parentGlobalTimeOffset={parentGlobalTimeOffset}
            />
          ))}
        </div>
      )}
    </div>
  );
}
