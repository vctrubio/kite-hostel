"use client";

import { useState, useEffect, useMemo } from "react";
import { SingleDatePicker } from "@/components/pickers/single-date-picker";
import { WhiteboardData } from "@/actions/whiteboard-actions";
import {
  getStoredDate,
  setStoredDate,
  getTodayDateString,
} from "@/components/formatters/DateTime";
import StudentsBookingCard from "@/components/cards/StudentsBookingCard";
import TeacherLessonQueueCard from "@/components/cards/LessonQueueCard";
import BillboardHeader from "./BillboardHeader";
import { TeacherSchedule } from "@/backend/TeacherSchedule";
import { WhiteboardClass, extractStudents } from "@/backend/WhiteboardClass";
import { type EventController } from "@/backend/types";
import { LOCATION_ENUM_VALUES } from "@/lib/constants";
import { HeadsetIcon, HelmetIcon } from "@/svgs";
import { FormatedDateExp } from "@/components/label/FormatedDateExp";

const STORAGE_KEY = "billboard-selected-date";

interface BillboardClientProps {
  data: WhiteboardData;
}

export default function BillboardClient({ data }: BillboardClientProps) {
  const [selectedDate, setSelectedDate] = useState(() => getTodayDateString());
  const [teacherSchedules, setTeacherSchedules] = useState<
    Map<string, TeacherSchedule>
  >(new Map());
  const [draggedBooking, setDraggedBooking] = useState<any>(null);

  // Controller settings (copied from WhiteboardLessons pattern)
  const [controller, setController] = useState<EventController>(() => ({
    flag: false,
    location: LOCATION_ENUM_VALUES[0],
    submitTime: "11:00",
    durationCapOne: 120,
    durationCapTwo: 180,
    durationCapThree: 240,
  }));

  const handleDateChange = (date: string) => {
    if (!date || isNaN(Date.parse(date))) {
      console.error("Invalid date provided to handleDateChange:", date);
      return;
    }
    setSelectedDate(date);
    setStoredDate(STORAGE_KEY, date);
  };

  useEffect(() => {
    const storedDate = getStoredDate(STORAGE_KEY);
    const isValidDate = storedDate && !isNaN(Date.parse(storedDate));

    if (isValidDate) {
      setSelectedDate(storedDate);
    } else {
      const today = getTodayDateString();
      setSelectedDate(today);
      setStoredDate(STORAGE_KEY, today);
    }
  }, []);

  // Initialize teacher schedules
  useEffect(() => {
    const schedules = new Map<string, TeacherSchedule>();

    data.teachers?.forEach((teacher) => {
      const teacherSchedule = new TeacherSchedule(
        teacher.id,
        teacher.name,
        selectedDate,
      );
      teacherSchedule.setQueueStartTime(controller.submitTime);
      schedules.set(teacher.id, teacherSchedule);
    });

    setTeacherSchedules(schedules);
  }, [data.teachers, selectedDate, controller.submitTime]);

  const handleDrop = (teacherId: string, e: React.DragEvent) => {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData("text/plain"));
      const booking = data.booking;

      const teacherSchedule = teacherSchedules.get(teacherId);
      if (!teacherSchedule) return;

      // Create a fake lesson from booking to add to queue
      const students = extractStudents(booking);
      const bookingClass = new WhiteboardClass(booking);

      // Create a pseudo lesson ID from booking ID
      const lessonId = `lesson_${booking.id}`;

      // Add to teacher's lesson queue
      teacherSchedule.addLessonToQueue(
        lessonId,
        controller.durationCapOne, // Default duration
        students.map((s) => s.name),
        bookingClass.getTotalMinutes(),
        "planned",
      );

      // Trigger re-render
      setTeacherSchedules(new Map(teacherSchedules));
      setDraggedBooking(null);
    } catch (error) {
      console.error("Failed to handle drop:", error);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleRemoveFromQueue = (teacherId: string, lessonId: string) => {
    const teacherSchedule = teacherSchedules.get(teacherId);
    if (!teacherSchedule) return;

    teacherSchedule.removeLessonFromQueue(lessonId);
    setTeacherSchedules(new Map(teacherSchedules));
  };

  const handleAdjustDuration = (
    teacherId: string,
    lessonId: string,
    increment: boolean,
  ) => {
    const teacherSchedule = teacherSchedules.get(teacherId);
    if (!teacherSchedule) return;

    const lesson = teacherSchedule
      .getLessonQueue()
      .find((q) => q.lessonId === lessonId);
    if (!lesson) return;

    const adjustment = increment ? 30 : -30;
    const newDuration = Math.max(
      30,
      Math.min(lesson.remainingMinutes, lesson.duration + adjustment),
    );

    teacherSchedule.updateQueueLessonDuration(lessonId, newDuration);
    setTeacherSchedules(new Map(teacherSchedules));
  };

  const handleAdjustTime = (
    teacherId: string,
    lessonId: string,
    increment: boolean,
  ) => {
    const teacherSchedule = teacherSchedules.get(teacherId);
    if (!teacherSchedule) return;

    const adjustment = increment ? 30 : -30;
    teacherSchedule.updateQueueLessonStartTime(lessonId, adjustment);
    setTeacherSchedules(new Map(teacherSchedules));
  };

  const handleMoveUp = (teacherId: string, lessonId: string) => {
    const teacherSchedule = teacherSchedules.get(teacherId);
    if (!teacherSchedule) return;

    teacherSchedule.moveQueueLessonUp(lessonId);
    setTeacherSchedules(new Map(teacherSchedules));
  };

  const handleMoveDown = (teacherId: string, lessonId: string) => {
    const teacherSchedule = teacherSchedules.get(teacherId);
    if (!teacherSchedule) return;

    teacherSchedule.moveQueueLessonDown(lessonId);
    setTeacherSchedules(new Map(teacherSchedules));
  };

  const handleRemoveGap = (teacherId: string, lessonId: string) => {
    const teacherSchedule = teacherSchedules.get(teacherId);
    if (!teacherSchedule) return;

    teacherSchedule.removeGapForLesson(lessonId);
    setTeacherSchedules(new Map(teacherSchedules));
  };

  const filteredData = useMemo(() => {
    if (!selectedDate || isNaN(Date.parse(selectedDate))) {
      return {
        bookings: [],
        teachers: data.teachers || [],
      };
    }

    const filterDate = new Date(selectedDate);
    filterDate.setHours(0, 0, 0, 0);

    const dateFilteredBookings = data.rawBookings.filter((booking) => {
      const bookingStart = new Date(booking.date_start);
      const bookingEnd = new Date(booking.date_end);
      bookingStart.setHours(0, 0, 0, 0);
      bookingEnd.setHours(23, 59, 59, 999);
      return filterDate >= bookingStart && filterDate <= bookingEnd;
    });

    // Filter out already assigned bookings from all teacher schedules
    const assignedBookingIds = new Set<string>();
    teacherSchedules.forEach((schedule) => {
      schedule.getLessonQueue().forEach((queuedLesson) => {
        // Extract booking ID from lesson ID (format: lesson_bookingId)
        const bookingId = queuedLesson.lessonId.replace("lesson_", "");
        assignedBookingIds.add(bookingId);
      });
    });

    const availableBookings = dateFilteredBookings.filter(
      (booking) => !assignedBookingIds.has(booking.id),
    );

    return {
      bookings: availableBookings,
      teachers: data.teachers || [],
    };
  }, [data, selectedDate, teacherSchedules]);

  return (
    <div className="min-h-screen p-4">
      {/* Header with date picker, controller, and stats */}
      <BillboardHeader
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
        controller={controller}
        onControllerChange={setController}
        teacherSchedules={teacherSchedules}
      />

      {/* Main content - 3/4 and 1/4 split */}
      <div className="grid grid-cols-4 gap-6">
        {/* Left side - Teachers (3/4 width) */}
        <div className="col-span-3">
          <h2 className="text-xl font-semibold mb-4">
            Teachers ({filteredData.teachers.length})
          </h2>
          <div className="space-y-3">
            {filteredData.teachers.map((teacher, index) => {
              // Different background colors for each teacher row
              const bgColors = [
                "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800",
                "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800",
                "bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800",
                "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800",
                "bg-teal-50 dark:bg-teal-950/20 border-teal-200 dark:border-teal-800",
              ];
              const colorClass = bgColors[index % bgColors.length];
              const teacherSchedule = teacherSchedules.get(teacher.id);
              const queuedLessons = teacherSchedule?.getLessonQueue() || [];

              return (
                <div
                  key={teacher.id}
                  className={`w-full p-4 rounded-lg border ${colorClass} transition-all`}
                  onDrop={(e) => handleDrop(teacher.id, e)}
                  onDragOver={handleDragOver}
                  onDragEnter={(e) => e.preventDefault()}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <HeadsetIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <h3 className="font-medium text-foreground">
                        {teacher.name}
                      </h3>
                      <span className="text-sm text-muted-foreground">
                        ({queuedLessons.length} queued)
                      </span>
                    </div>
                  </div>

                  {/* Queued lessons using LessonQueueCard */}
                  {queuedLessons.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {queuedLessons.map((queuedLesson, queueIndex) => (
                        <TeacherLessonQueueCard
                          key={queuedLesson.lessonId}
                          queuedLesson={{
                            ...queuedLesson,
                            scheduledDateTime: `${selectedDate}T${queuedLesson.scheduledStartTime || controller.submitTime}:00.000Z`,
                          }}
                          location={controller.location}
                          isFirst={queueIndex === 0}
                          isLast={queueIndex === queuedLessons.length - 1}
                          canMoveEarlier={
                            teacherSchedule?.canMoveQueueLessonEarlier(
                              queuedLesson.lessonId,
                            ) || false
                          }
                          canMoveLater={true}
                          onRemove={() =>
                            handleRemoveFromQueue(
                              teacher.id,
                              queuedLesson.lessonId,
                            )
                          }
                          onAdjustDuration={(_, increment) =>
                            handleAdjustDuration(
                              teacher.id,
                              queuedLesson.lessonId,
                              increment,
                            )
                          }
                          onAdjustTime={(_, increment) =>
                            handleAdjustTime(
                              teacher.id,
                              queuedLesson.lessonId,
                              increment,
                            )
                          }
                          onMoveUp={() =>
                            handleMoveUp(teacher.id, queuedLesson.lessonId)
                          }
                          onMoveDown={() =>
                            handleMoveDown(teacher.id, queuedLesson.lessonId)
                          }
                          onRemoveGap={() =>
                            handleRemoveGap(teacher.id, queuedLesson.lessonId)
                          }
                        />
                      ))}
                    </div>
                  )}

                  {/* Drop zone indicator */}
                  <div className="text-xs text-muted-foreground mt-2 text-center opacity-50">
                    Drop student booking here
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right side - Students Bookings (1/4 width) */}
        <div className="col-span-1">
          <h2 className="text-xl font-semibold mb-4">
            Bookings ({filteredData.bookings.length})
          </h2>
          <div className="space-y-3">
            {filteredData.bookings.length === 0 ? (
              <p className="text-muted-foreground">No bookings for this date</p>
            ) : (
              filteredData.bookings.map((booking) => {
                // Filter out teachers who already have lessons for this booking
                const bookingClass = new WhiteboardClass(booking);
                const existingLessons = bookingClass.getLessons() || [];
                const teachersWithLessons = new Set(
                  existingLessons
                    .map(lesson => lesson.teacher?.id)
                    .filter(Boolean)
                );
                
                // Create a filtered list of teachers excluding those who already have lessons
                const availableTeachers = filteredData.teachers.filter(
                  teacher => !teachersWithLessons.has(teacher.id)
                );
                
                return (
                  <StudentsBookingCard
                    key={booking.id}
                    booking={booking}
                    onDragStart={setDraggedBooking}
                    selectedDate={selectedDate}
                    teachers={availableTeachers}
                  />
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
