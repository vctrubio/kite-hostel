"use client";

import { useState } from "react";
import { HeadsetIcon } from "@/svgs";
import FlagCard from "@/components/cards/FlagCard";
import { TeacherQueue } from "@/backend/TeacherQueue";
import { BillboardClass } from "@/backend/BillboardClass";
import { type EventController } from "@/backend/types";

// Simple pending animation component
function PendingEventCard() {
  return (
    <div className="w-48 h-32 bg-blue-500/20 border-2 border-blue-400 border-dashed rounded-lg flex items-center justify-center backdrop-blur-[1px]">
      <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium animate-pulse shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
          Creating Event...
        </div>
      </div>
    </div>
  );
}

interface TeacherColumnSimpleProps {
  teachers: any[];
  teacherQueues: Map<string, TeacherQueue>;
  dayOfWeek: string;
  flagTime: string;
  controller: EventController;
  onAddToQueue?: (teacherId: string, billboardClass: BillboardClass) => Promise<void>;
}

interface TeacherRowProps {
  teacher: any;
  teacherQueue: TeacherQueue;
  onAddToQueue?: (teacherId: string, billboardClass: BillboardClass) => Promise<void>;
  flagTime: string;
  controller: EventController;
}

function TeacherRow({ teacher, teacherQueue, onAddToQueue, flagTime, controller }: TeacherRowProps) {
  const [isCreating, setIsCreating] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();

    try {
      const dragData = e.dataTransfer.getData("application/json");
      if (dragData && onAddToQueue) {
        const parsedData = JSON.parse(dragData);
        const billboardClass = new BillboardClass(parsedData.booking);

        // Show creating animation
        setIsCreating(true);

        try {
          // Call the client's server action
          await onAddToQueue(teacher.id, billboardClass);
        } catch (error) {
          console.error("Error creating event:", error);
        } finally {
          // Hide creating animation
          setIsCreating(false);
        }
      }
    } catch (error) {
      console.error("Error handling drop:", error);
    }
  };

  // Get stats from queue
  const teacherStats = teacherQueue.getTeacherStats();
  const totalEventsCount = teacherStats.eventCount + (isCreating ? 1 : 0);

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

          {/* Teacher Stats - Detailed */}
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1">Events</div>
                <div className="font-medium">{totalEventsCount}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1">Duration</div>
                <div className="font-medium">{teacherStats.totalHours}h</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Teacher:</span>
                <span className="text-xs font-medium">${teacherStats.earnings.teacher.toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">School:</span>
                <span className="text-xs font-medium">${teacherStats.earnings.school.toFixed(0)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-xs font-medium">Total:</span>
                <span className="text-xs font-bold">${teacherStats.earnings.total.toFixed(0)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Events/Queue */}
        <div className="flex-1 p-4">
          {totalEventsCount === 0 && !isCreating ? (
            <div className="text-center text-muted-foreground text-sm py-8">
              Drop booking here to assign
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {/* Show actual events as FlagCards */}
              {teacherQueue.getAllEvents().map((eventNode, index) => (
                <div key={eventNode.id || `event-${index}`} className="flex-shrink-0">
                  <FlagCard
                    startTime={eventNode.eventData.date}
                    duration={eventNode.eventData.duration}
                    students={eventNode.billboardClass.getStudentNames()}
                    status={eventNode.eventData.status}
                    onStatusChange={() => { }}
                  />
                </div>
              ))}

              {/* Show creating animation */}
              {isCreating && (
                <div className="flex-shrink-0">
                  <PendingEventCard />
                </div>
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
  flagTime,
  controller,
  onAddToQueue,
}: TeacherColumnSimpleProps) {

  return (
    <div className="col-span-3">
      <div className="border border-border rounded-lg p-4 mb-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">{dayOfWeek}</h2>
          <div className="text-sm text-muted-foreground">
            Flag: {flagTime}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {teachers.map((teacher) => {
          const queue = teacherQueues.get(teacher.id);

          // Skip teachers without queues
          if (!queue) {
            console.warn(`No queue found for teacher ${teacher.id}`);
            return null;
          }

          return (
            <TeacherRow
              key={teacher.id}
              teacher={teacher}
              teacherQueue={queue}
              onAddToQueue={onAddToQueue}
              flagTime={flagTime}
              controller={controller}
            />
          );
        })}
      </div>
    </div>
  );
}