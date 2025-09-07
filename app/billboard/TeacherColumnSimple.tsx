"use client";

import { useMemo, useState } from "react";
import { HeadsetIcon } from "@/svgs";
import FlagCard from "@/components/cards/FlagCard";
import LessonQueueCard from "@/components/cards/LessonQueueCard";
import { TeacherQueue } from "@/backend/TeacherQueue";

interface TeacherColumnSimpleProps {
  teachers: any[];
  teacherQueues: Map<string, TeacherQueue>;
  dayOfWeek: string; // e.g., "Monday", "Tuesday", etc.
  onTeacherDrop?: (teacherId: string, bookingId: string) => void; // Optional for now
  flagTime: string; // Submit time from controller as fallback
}

interface TeacherRowProps {
  teacher: any;
  isEditMode: boolean;
  onDrop: (e: React.DragEvent) => void;
  teacherQueue: TeacherQueue;
  onQueueUpdate: (teacherId: string, queue: TeacherQueue) => void;
  onSubmit?: (teacherId: string) => Promise<void>;
}

function TeacherRow({ teacher, isEditMode, onDrop, teacherQueue, onQueueUpdate, onSubmit }: TeacherRowProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    onDrop(e);
  };

  // Get event nodes and stats from queue
  const eventNodes = useMemo(() => {
    return teacherQueue.getEventNodes();
  }, [teacherQueue]);
  
  const teacherStats = useMemo(() => {
    return teacherQueue.getTeacherStats();
  }, [teacherQueue]);

  // Queue management handlers
  const handleRemoveLesson = (lessonId: string) => {
    teacherQueue.removeLesson(lessonId);
    onQueueUpdate(teacher.id, teacherQueue);
  };

  const handleAdjustDuration = (lessonId: string, increment: boolean) => {
    teacherQueue.adjustDuration(lessonId, increment);
    onQueueUpdate(teacher.id, teacherQueue);
  };

  const handleAdjustTime = (lessonId: string, increment: boolean) => {
    teacherQueue.adjustTime(lessonId, increment);
    onQueueUpdate(teacher.id, teacherQueue);
  };

  const handleMoveUp = (lessonId: string) => {
    teacherQueue.moveUp(lessonId);
    onQueueUpdate(teacher.id, teacherQueue);
  };

  const handleMoveDown = (lessonId: string) => {
    teacherQueue.moveDown(lessonId);
    onQueueUpdate(teacher.id, teacherQueue);
  };

  return (
    <div
      className="border border-border rounded-lg bg-card"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="flex min-h-[200px]">
        {/* Left Column - Teacher Info */}
        <div className="w-64 p-4 border-r border-border flex-shrink-0">
          <div className="flex items-center gap-2 mb-3">
            <HeadsetIcon className="w-5 h-5 text-green-600" />
            <h3 className="font-medium text-foreground">{teacher.name}</h3>
          </div>
          
          {/* Teacher Stats */}
          <div className="space-y-3 text-sm">
            {/* Row 1: Events and Duration */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1">Events</div>
                <div className="font-medium">{teacherStats.eventCount}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1">Duration</div>
                <div className="font-medium">{teacherStats.totalHours}h</div>
              </div>
            </div>
            
            {/* Row 2: Teacher and School Earnings */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1">Teacher</div>
                <div className="font-medium">€{teacherStats.earnings.teacher.toFixed(2)}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1">School</div>
                <div className="font-medium">€{teacherStats.earnings.school.toFixed(2)}</div>
              </div>
            </div>
            
            {/* Total Revenue */}
            <div className="pt-2 border-t border-border text-center">
              <div className="text-xs text-muted-foreground mb-1">Total Revenue</div>
              <div className="font-bold">€{teacherStats.earnings.total.toFixed(2)}</div>
            </div>
          </div>
        </div>
        
        {/* Right Column - Events/Queue */}
        <div className="flex-1 p-4">
          {eventNodes.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm py-8">
              {isEditMode ? "Drop booking here to assign" : "No events scheduled"}
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {isEditMode ? (
                // Render event nodes with full functionality in edit mode
                eventNodes.map((eventNode, index) => {
                  const earnings = teacherQueue.getEventEarnings(eventNode);
                  return (
                    <div key={eventNode.id || `pending-${index}`} className="flex-shrink-0">
                      <LessonQueueCard
                        eventNode={eventNode}
                        location={eventNode.eventData.location}
                        isFirst={teacherQueue.isFirst(eventNode.lessonId)}
                        isLast={teacherQueue.isLast(eventNode.lessonId)}
                        canMoveEarlier={teacherQueue.canMoveUp(eventNode.lessonId)}
                        canMoveLater={teacherQueue.canMoveDown(eventNode.lessonId)}
                        onRemove={handleRemoveLesson}
                        onAdjustDuration={handleAdjustDuration}
                        onAdjustTime={handleAdjustTime}
                        onMoveUp={handleMoveUp}
                        onMoveDown={handleMoveDown}
                        onSubmit={async () => onSubmit?.(teacher.id)}
                      />
                    </div>
                  );
                })
              ) : (
                // Render event nodes as flag cards for view mode
                eventNodes.map((eventNode, index) => {
                  const earnings = teacherQueue.getEventEarnings(eventNode);
                  return (
                    <div key={eventNode.id || `view-${index}`} className="flex-shrink-0">
                      <FlagCard
                        startTime={eventNode.eventData.date}
                        duration={eventNode.eventData.duration}
                        students={eventNode.billboardClass.getStudentNames()}
                        status={eventNode.eventData.status}
                        teacherEarnings={earnings.teacher}
                        schoolEarnings={earnings.school}
                        onStatusChange={(newStatus) => {
                          console.log(`Change event ${eventNode.lessonId} status to ${newStatus}`);
                          // TODO: Implement status change
                        }}
                      />
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TeacherColumnSimple({
  teachers,
  teacherQueues,
  dayOfWeek,
  onTeacherDrop = () => {},
  flagTime,
}: TeacherColumnSimpleProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  
  const handleQueueUpdate = (teacherId: string, updatedQueue: TeacherQueue) => {
    // Note: Since teacherQueues comes from props, we need to notify parent
    // For now, we'll handle this locally but ideally should lift state up
    console.log("Queue update for teacher:", teacherId, updatedQueue);
  };

  const earliestTime = useMemo(() => {
    // Get earliest time from all teacher queues
    const allTimes: string[] = [];
    teacherQueues.forEach(queue => {
      const time = queue.getFlagTime();
      if (time !== null) { // Only if there are events
        allTimes.push(time);
      }
    });
    
    // If no events exist, use the controller submit time as fallback
    if (allTimes.length === 0) return flagTime;
    return allTimes.sort()[0];
  }, [teacherQueues, flagTime]);

  const handleSubmitChanges = async () => {
    console.log("Submitting queue changes...");
    
    try {
      // Import the event actions
      const { createEvent, updateEvent } = await import('@/actions/event-actions');
      
      const results = [];
      
      // Process each teacher's queue
      for (const [teacherId, queue] of teacherQueues.entries()) {
        const eventNodes = queue.getEventNodes();
        
        for (const eventNode of eventNodes) {
          if (!eventNode.eventData.id) {
            // New event - create it
            const result = await createEvent({
              lessonId: eventNode.lessonId,
              date: new Date(eventNode.eventData.date).toISOString().split('T')[0],
              startTime: queue.getStartTime(eventNode),
              durationMinutes: eventNode.eventData.duration,
              location: eventNode.eventData.location as any,
              status: eventNode.eventData.status
            });
            results.push(result);
          } else {
            // Existing event - update it
            const result = await updateEvent(eventNode.eventData.id, {
              date: eventNode.eventData.date,
              duration: eventNode.eventData.duration,
              status: eventNode.eventData.status,
              location: eventNode.eventData.location as any
            });
            results.push(result);
          }
        }
      }
      
      const failures = results.filter(r => !r.success);
      if (failures.length > 0) {
        console.error('Some submissions failed:', failures);
        alert(`${failures.length} submissions failed. Check console for details.`);
      } else {
        console.log('All submissions successful');
        // Exit edit mode after successful submission
        setIsEditMode(false);
        // Refresh the page to get updated data
        window.location.reload();
      }
      
    } catch (error) {
      console.error('Error submitting changes:', error);
      alert('Error submitting changes. Please try again.');
    }
  };

  const handleTeacherDrop = (teacherId: string) => (e: React.DragEvent) => {
    try {
      const data = JSON.parse(e.dataTransfer.getData("text/plain"));
      const bookingId = data.bookingId;
      
      if (!bookingId) {
        console.error("No booking ID in drag data");
        return;
      }

      // Enter edit mode when something is dropped (if drag is implemented)
      setIsEditMode(true);
      onTeacherDrop?.(teacherId, bookingId);
    } catch (error) {
      console.error("Failed to handle teacher drop:", error);
    }
  };

  return (
    <div className="col-span-3">
      <div className="border border-border rounded-lg p-4 mb-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">{dayOfWeek}</h2>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Earliest: {earliestTime}
            </div>
            {isEditMode ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSubmitChanges}
                  className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 border border-green-300"
                  title="Submit all changes"
                >
                  Submit
                </button>
                <button
                  onClick={() => setIsEditMode(false)}
                  className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded hover:bg-gray-200 border border-gray-300"
                  title="Cancel and exit edit mode"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditMode(true)}
                className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 border border-blue-300"
                title="Enter edit mode"
              >
                Edit
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        {teachers.map((teacher) => {
          const queue = teacherQueues.get(teacher.id);
          
          // Skip teachers without queues (they should all have queues from parent)
          if (!queue) {
            console.warn(`No queue found for teacher ${teacher.id}`);
            return null;
          }

          return (
            <TeacherRow
              key={teacher.id}
              teacher={teacher}
              isEditMode={isEditMode}
              onDrop={handleTeacherDrop(teacher.id)}
              teacherQueue={queue}
              onQueueUpdate={handleQueueUpdate}
              onSubmit={async (teacherId) => {
                // Individual lesson submit - could be implemented here
                console.log(`Submit changes for teacher ${teacherId}`);
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
