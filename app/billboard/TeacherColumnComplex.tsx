"use client";

import { useState, useMemo } from "react";
import { HeadsetIcon, FlagIcon } from "@/svgs";
import FlagCard from "@/components/cards/FlagCard";
import { TeacherQueue } from "@/backend/TeacherQueue";
import { BillboardClass } from "@/backend/BillboardClass";
import { type EventController } from "@/backend/types";
import { toast } from "sonner";

interface TeacherColumnComplexProps {
  teachers: any[];
  teacherQueues: Map<string, TeacherQueue>;
  controller: EventController;
  selectedDate: string;
}

interface TeacherRowProps {
  teacher: any;
  teacherQueue?: TeacherQueue;
  controller: EventController;
  selectedDate: string;
}

function TeacherRow({
  teacher,
  teacherQueue,
  controller,
  selectedDate,
}: TeacherRowProps) {
  const [isDropping, setIsDropping] = useState(false);

  if (!teacherQueue) {
    return null;
  }

  const teacherStats = teacherQueue.getTeacherStats();
  const events = teacherQueue.getAllEvents();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDropping(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // Only set to false if we're leaving the drop zone completely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDropping(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDropping(false);

    try {
      const dragData = e.dataTransfer.getData("application/json");
      if (!dragData) return;

      const parsedData = JSON.parse(dragData);
      const billboardClass = new BillboardClass(parsedData.booking);

      // Check if this teacher is assigned to any lesson in this booking
      const hasValidLesson = billboardClass.hasTeacher(teacher.id);

      if (!hasValidLesson) {
        toast.error("Assign Teacher To Lesson First");
        return;
      }

      // Use TeacherQueue's addEventAction method
      const result = await teacherQueue.addEventAction(
        billboardClass,
        controller,
      );

      if (!result.success) {
        console.error("Failed to create event:", result.error);
        toast.error(`Failed to create event: ${result.error}`);
      } else {
        toast.success("Event created successfully!");
      }
    } catch (error) {
      console.error("Error handling drop:", error);
      toast.error("Error handling drop");
    }
  };

  return (
    <div
      className={`border border-border rounded-lg bg-card transition-colors ${isDropping ? "border-blue-400 bg-blue-50/50 dark:bg-blue-950/50" : ""
        }`}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex min-h-[200px]">
        {/* Left Column - Teacher Info & Stats */}
        <div className="w-72 p-4 border-r border-border flex-shrink-0">
          <div className="flex items-center gap-2 mb-4">
            <HeadsetIcon className="w-5 h-5 text-green-600" />
            <h3 className="font-medium text-foreground">{teacher.name}</h3>
          </div>

          {/* Teacher Stats */}
          <div className="border space-y-2 py-4">
            {/* First row: Events/Lessons and Hours */}
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="text-center">
                <div className="font-semibold text-indigo-600 dark:text-indigo-400">
                  {teacherStats.eventCount}
                </div>
                <div className="text-xs text-muted-foreground">Events</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-purple-600 dark:text-purple-400">
                  {teacherStats.totalHours}h
                </div>
                <div className="text-xs text-muted-foreground">Duration</div>
              </div>
            </div>

            {/* Second row: Teacher and School Revenue */}
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="text-center">
                <div className="font-semibold text-green-600 dark:text-green-400">
                  ${Math.round(teacherStats.earnings.teacher)}
                </div>
                <div className="text-xs text-muted-foreground">Teacher</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-orange-600 dark:text-orange-400">
                  ${Math.round(teacherStats.earnings.school)}
                </div>
                <div className="text-xs text-muted-foreground">School</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Events Schedule */}
        <div className="flex-1 p-4">
          {events.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm py-12"></div>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-3">
                {events.map((eventNode, index) => (
                  <div
                    key={eventNode.id || `event-${index}`}
                    className="flex-shrink-0"
                  >
                    <FlagCard
                      startTime={eventNode.eventData.date}
                      duration={eventNode.eventData.duration}
                      students={eventNode.billboardClass.getStudentNames()}
                      status={eventNode.eventData.status}
                      eventId={eventNode.eventData.id}
                      onStatusChange={() => { }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TeacherColumnComplex({
  teachers,
  teacherQueues,
  controller,
  selectedDate,
}: TeacherColumnComplexProps) {
  // Calculate earliest time from all teacher queues
  const earliestTime = useMemo(() => {
    const times: string[] = [];

    teacherQueues.forEach((queue) => {
      const flagTime = queue.getFlagTime();
      if (flagTime) {
        times.push(flagTime);
      }
    });

    if (times.length === 0) {
      return "No lessons today";
    }

    // Sort times and get the earliest
    const earliest = times.sort((a, b) => a.localeCompare(b))[0];
    return earliest;
  }, [teacherQueues]);

  return (
    <div className="col-span-3">
      {/* Earliest Time Header */}
      <div className="p-3">
        <div className="flex items-center gap-2">
          <FlagIcon className="w-6 h-6" />
          <span className="text-sm font-medium">{earliestTime}</span>
        </div>
      </div>

      <div className="space-y-3">
        {teachers.map((teacher) => {
          const queue = teacherQueues.get(teacher.id);
          return (
            <TeacherRow
              key={teacher.id}
              teacher={teacher}
              teacherQueue={queue}
              controller={controller}
              selectedDate={selectedDate}
            />
          );
        })}
      </div>
    </div>
  );
}
