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
  onTeacherDrop: (teacherId: string, bookingId: string) => void;
}

interface TeacherRowProps {
  teacher: any;
  isEditMode: boolean;
  onDrop: (e: React.DragEvent) => void;
  teacherQueue: TeacherQueue;
  onQueueUpdate: (teacherId: string, queue: TeacherQueue) => void;
}

function TeacherRow({ teacher, isEditMode, onDrop, teacherQueue, onQueueUpdate }: TeacherRowProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    onDrop(e);
  };

  // Calculate teacher earnings and school revenue from queue
  const financials = useMemo(() => {
    let teacherEarnings = 0;
    let schoolRevenue = 0;
    
    const lessons = teacherQueue.getLessons();
    lessons.forEach(lesson => {
      // Use the TeacherQueue's built-in methods for accurate calculations
      teacherEarnings += teacherQueue.getTeacherEarnings(lesson);
      schoolRevenue += teacherQueue.getSchoolRevenue(lesson);
    });
    
    return { teacherEarnings, schoolRevenue };
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
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Lessons:</span>
              <span className="font-medium">{teacherQueue.getLessons().length}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Teacher Earnings:</span>
              <span className="font-medium text-green-600">
                €{financials.teacherEarnings.toFixed(2)}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">School Revenue:</span>
              <span className="font-medium text-blue-600">
                €{financials.schoolRevenue.toFixed(2)}
              </span>
            </div>
            
            <div className="pt-2 border-t border-border">
              <div className="flex justify-between">
                <span className="text-muted-foreground font-medium">Total Revenue:</span>
                <span className="font-bold">
                  €{(financials.teacherEarnings + financials.schoolRevenue).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Column - Events/Queue */}
        <div className="flex-1 p-4">
          {teacherQueue.getLessons().length === 0 ? (
            <div className="text-center text-muted-foreground text-sm py-8">
              {isEditMode ? "Drop booking here to assign" : "No lessons scheduled"}
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {isEditMode ? (
                // Render queue lessons with full functionality in edit mode
                teacherQueue.getLessons().map((lesson, index) => (
                  <div key={lesson.lessonId} className="flex-shrink-0">
                    <LessonQueueCard
                      queuedLesson={{
                        ...lesson,
                        students: teacherQueue.getStudents(lesson),
                        remainingMinutes: teacherQueue.getRemainingMinutes(lesson),
                        scheduledStartTime: lesson.scheduledStartTime || "11:11",
                        scheduledDateTime: lesson.scheduledDateTime || new Date().toISOString()
                      } as any}
                      location={teacherQueue.getLocation(lesson)}
                      isFirst={teacherQueue.isFirst(lesson.lessonId)}
                      isLast={teacherQueue.isLast(lesson.lessonId)}
                      canMoveEarlier={teacherQueue.canMoveUp(lesson.lessonId)}
                      canMoveLater={teacherQueue.canMoveDown(lesson.lessonId)}
                      onRemove={handleRemoveLesson}
                      onAdjustDuration={handleAdjustDuration}
                      onAdjustTime={handleAdjustTime}
                      onMoveUp={handleMoveUp}
                      onMoveDown={handleMoveDown}
                    />
                  </div>
                ))
              ) : (
                // Render queue lessons as flag cards for view mode
                teacherQueue.getLessons().map((lesson, index) => (
                  <div key={lesson.lessonId} className="flex-shrink-0">
                    <FlagCard
                      startTime={lesson.scheduledDateTime || new Date().toISOString()}
                      duration={lesson.duration || 0}
                      students={teacherQueue.getStudents(lesson)}
                      status={lesson.status}
                      teacherEarnings={teacherQueue.getTeacherEarnings(lesson)}
                      schoolEarnings={teacherQueue.getSchoolRevenue(lesson)}
                      onStatusChange={(newStatus) => {
                        console.log(`Change lesson ${lesson.lessonId} status to ${newStatus}`);
                        // TODO: Implement status change
                      }}
                    />
                  </div>
                ))
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
  onTeacherDrop,
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
      if (time !== "11:11") { // Only if not debug indicator
        allTimes.push(time);
      }
    });
    
    if (allTimes.length === 0) return "09:00"; // Default if no lessons
    return allTimes.sort()[0];
  }, [teacherQueues]);

  const handleSubmitChanges = async () => {
    console.log("Submitting queue changes...");
    
    // Collect all changes from queues
    const changes: Array<{
      teacherId: string;
      lessons: any[];
    }> = [];
    
    teacherQueues.forEach((queue, teacherId) => {
      const lessons = queue.getLessons();
      if (lessons.length > 0) {
        changes.push({
          teacherId,
          lessons: lessons.map(lesson => ({
            bookingId: lesson.bookingId,
            lessonId: lesson.lessonId,
            duration: lesson.duration,
            scheduledDateTime: lesson.scheduledDateTime,
            timeAdjustment: lesson.timeAdjustment || 0,
            students: queue.getStudents(lesson)
          }))
        });
      }
    });
    
    console.log("Queue changes to submit:", changes);
    
    // TODO: Implement actual submission logic
    // This would typically call an API to update the schedule
    
    // Exit edit mode after successful submission
    setIsEditMode(false);
  };

  const handleTeacherDrop = (teacherId: string) => (e: React.DragEvent) => {
    try {
      const data = JSON.parse(e.dataTransfer.getData("text/plain"));
      const bookingId = data.bookingId;
      
      if (!bookingId) {
        console.error("No booking ID in drag data");
        return;
      }

      // Enter edit mode when something is dropped
      setIsEditMode(true);
      onTeacherDrop(teacherId, bookingId);
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
            />
          );
        })}
      </div>
    </div>
  );
}
