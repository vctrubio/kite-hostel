'use client';

import React, { useState } from 'react';
import { BookingIcon, HelmetIcon, HeadsetIcon, PackageIcon, KiteIcon, ProgressIcon } from '@/svgs';
import { FormatDateRange } from '@/components/formatters/DateRange';
import { BookingStatusLabel } from '@/components/label/BookingStatusLabel';
import { LessonStatusLabel } from '@/components/label/LessonStatusLabel';
import { BookingProgressBar } from '@/components/formatters/BookingProgressBar';
import { Duration } from '@/components/formatters/Duration';
import { DateSince } from '@/components/formatters/DateSince';
import { BookingToLessonModal } from '@/components/modals/BookingToLessonModal';
import { useRouter } from 'next/navigation';

interface BookingCardProps {
  booking: any;
}

export default function BookingCard({ booking }: BookingCardProps) {
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [showCompletedEvents, setShowCompletedEvents] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const router = useRouter();

  const lessonsCount = booking.lessons?.length || 0;
  const allEvents = booking.lessons?.flatMap((lesson: any) => lesson.events || []) || [];
  
  // Filter events by status
  const completedEvents = allEvents.filter((event: any) => event.status === 'completed');
  const plannedOrTbcEvents = allEvents.filter((event: any) => event.status === 'planned' || event.status === 'tbc');
  
  // Calculate total used minutes from completed events only
  const usedMinutes = completedEvents.reduce((total: number, event: any) => 
    total + (event.duration || 0), 0);
  
  // Calculate planned/tbc minutes for orange indicator
  const plannedMinutes = plannedOrTbcEvents.reduce((total: number, event: any) => 
    total + (event.duration || 0), 0);
  
  // Get package total duration
  const packageDuration = booking.package?.duration || 0;

  // Check if booking is ready to be completed
  const isReadyForCompletion = usedMinutes >= packageDuration && packageDuration > 0 && booking.status !== 'completed';

  // Find first lesson that is rest or planned
  const firstActiveLesson = booking.lessons?.find((lesson: any) => 
    lesson.status === 'rest' || lesson.status === 'planned');

  const handleStudentClick = (studentId: string) => {
    router.push(`/students/${studentId}`);
  };

  const handleCompleteBooking = async () => {
    setIsCompleting(true);
    try {
      // TODO: Implement action to complete booking and lessons
      // await completeBookingAndLessons(booking.id);
      console.log('Completing booking:', booking.id);
      // For now, just simulate the action
      setTimeout(() => {
        setIsCompleting(false);
        // In real implementation, this would trigger a refresh/revalidation
      }, 1000);
    } catch (error) {
      console.error('Error completing booking:', error);
      setIsCompleting(false);
    }
  };

  return (
    <div className="p-4 bg-card border border-border rounded-lg hover:shadow-md transition-shadow">
      {/* First line: Booking and Status */}
      <div className="flex items-center gap-2 mb-3">
        <BookingIcon className="w-5 h-5 text-primary" />
        <FormatDateRange 
          startDate={booking.date_start} 
          endDate={booking.date_end}
        />
        <div className="ml-auto">
          <BookingStatusLabel 
            bookingId={booking.id}
            currentStatus={booking.status}
          />
        </div>
      </div>

      {/* Second line: Students and Package */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        {/* Students */}
        <div className="flex items-center gap-2">
          {booking.students && booking.students.length > 0 ? (
            <>
              <div className="flex items-center gap-1">
                {Array.from({ length: booking.students.length }, (_, index) => (
                  <HelmetIcon key={index} className="w-6 h-6 text-amber-500" />
                ))}
              </div>
              <div className="flex flex-wrap gap-1">
                {booking.students.map((studentRelation: any, index: number) => (
                  <span key={studentRelation.student.id} className="inline-flex items-center">
                    <button
                      onClick={() => handleStudentClick(studentRelation.student.id)}
                      className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                    >
                      {studentRelation.student.name}
                    </button>
                    {index < booking.students.length - 1 && (
                      <span className="text-sm text-muted-foreground ml-1">,</span>
                    )}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <>
              <HelmetIcon className="w-6 h-6 text-gray-400" />
              <span className="text-sm text-muted-foreground">No students assigned</span>
            </>
          )}
        </div>

        {/* Package */}
        {booking.package && (
          <div className="inline-flex items-center gap-2 px-3 py-2 border border-border rounded-sm bg-amber-50">
            <PackageIcon className="w-4 h-4" />
            <span className="text-sm font-medium">
              €{Math.round((booking.package.price_per_student / (booking.package.duration / 60)) * 100) / 100}/h
            </span>
            <span className="text-sm text-muted-foreground">|</span>
            <div className="flex items-center gap-1">
              {Array.from({ length: booking.package.capacity_kites || 1 }, (_, index) => (
                <KiteIcon key={index} className="w-4 h-4" />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Third line: Progress */}
      {packageDuration > 0 && (
        <div className="mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-2 border border-border rounded-sm bg-green-50">
            <ProgressIcon className="w-4 h-4" />
            <div className="flex items-center gap-1">
              <div
                className="h-2 rounded-full overflow-hidden border border-gray-200 bg-gray-100"
                style={{ width: "60px" }}
              >
                {/* Green bar for completed */}
                <div
                  className="h-full bg-green-500 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((usedMinutes / packageDuration) * 100, 100)}%` }}
                />
                {/* Orange overlay for planned/tbc */}
                {plannedMinutes > 0 && (
                  <div
                    className="h-full bg-orange-400 rounded-full transition-all duration-300 relative -top-2"
                    style={{ 
                      width: `${Math.min(((usedMinutes + plannedMinutes) / packageDuration) * 100, 100)}%`,
                      opacity: 0.7
                    }}
                  />
                )}
              </div>
              <span className="text-sm text-muted-foreground">|</span>
              <span className="text-sm font-medium">
                <Duration minutes={usedMinutes} />
                {plannedMinutes > 0 && (
                  <span className="text-orange-600">+<Duration minutes={plannedMinutes} /></span>
                )}
                /<Duration minutes={packageDuration} />
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Completion Notification */}
      {isReadyForCompletion && (
        <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <h4 className="text-sm font-semibold text-green-800">Booking Complete</h4>
              </div>
              <p className="text-xs text-green-700 mb-3">
                All package hours have been completed. Please change status to completed.
              </p>
              
              {/* Students Summary */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-green-600 font-medium">Students:</span>
                <div className="flex items-center gap-1">
                  {booking.students?.map((studentRelation: any, index: number) => (
                    <span key={studentRelation.student.id} className="inline-flex items-center">
                      <span className="text-xs text-green-700 font-medium">
                        {studentRelation.student.name}
                      </span>
                      {index < booking.students.length - 1 && (
                        <span className="text-xs text-green-600 mx-1">•</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <button
              onClick={handleCompleteBooking}
              disabled={isCompleting}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              {isCompleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Completing...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Mark Complete</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Fourth line: Teacher */}
      <div className="mb-4">
        {lessonsCount > 0 && firstActiveLesson ? (
          <div className="space-y-2">
            {/* Check if first lesson is delegated */}
            {firstActiveLesson.status === 'delegated' ? (
              <div className="space-y-2">
                {/* Show delegated lesson */}
                <div className="flex items-center gap-2">
                  <HeadsetIcon className="w-6 h-6 text-gray-400" />
                  <span className="text-sm">
                    <span className="text-muted-foreground">Teacher: </span>
                    <span className="font-medium">{firstActiveLesson.teacher?.name || 'Unassigned'}</span>
                  </span>
                  <LessonStatusLabel 
                    lessonId={firstActiveLesson.id}
                    currentStatus={firstActiveLesson.status}
                  />
                </div>
                {/* Add new lesson button */}
                <button
                  onClick={() => setShowLessonModal(true)}
                  className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors p-2 border border-dashed border-primary rounded hover:bg-primary/5"
                >
                  <HeadsetIcon className="w-4 h-4" />
                  <span>Add new lesson</span>
                </button>
              </div>
            ) : (
              /* Normal lesson display */
              <div className="flex items-center gap-2">
                {/* Multiple Headset Icons based on lesson count */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: lessonsCount }, (_, index) => (
                    <HeadsetIcon key={index} className="w-6 h-6 text-green-600" />
                  ))}
                </div>
                <span className="text-sm">
                  <span className="text-muted-foreground">Teacher: </span>
                  <span className="font-medium">{firstActiveLesson.teacher?.name || 'Unassigned'}</span>
                </span>
                <LessonStatusLabel 
                  lessonId={firstActiveLesson.id}
                  currentStatus={firstActiveLesson.status}
                />
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => setShowLessonModal(true)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors p-2 border border-dashed border-muted-foreground rounded hover:border-primary"
          >
            <HeadsetIcon className="w-6 h-6" />
            <span>No lessons - Click to add lesson</span>
          </button>
        )}
      </div>

      {/* Fifth line: Completed Events (Collapsible) */}
      {completedEvents.length > 0 && (
        <div className="mb-4">
          <button
            onClick={() => setShowCompletedEvents(!showCompletedEvents)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <span>Completed Events ({completedEvents.length})</span>
            <span className="text-xs">{showCompletedEvents ? '▼' : '▶'}</span>
          </button>
          {showCompletedEvents && (
            <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
              {completedEvents.map((event: any) => (
                <div key={event.id} className="flex items-center gap-2 text-xs px-3 py-2 border border-gray-200 rounded">
                  <KiteIcon className="w-4 h-4" />
                  <DateSince dateString={event.date} />
                  <Duration minutes={event.duration || 0} />
                  <span className="text-muted-foreground">
                    {event.kites && event.kites.length > 0 
                      ? event.kites.map((kiteEvent: any) => kiteEvent.kite?.model).join(', ')
                      : 'No kites'
                    }
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* IDs Section */}
      <div className="pt-3 border-t border-border space-y-2">
        {/* Package and Booking IDs */}
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div>
            <span className="font-medium">Package ID:</span>
            <div className="truncate">{booking.package?.id?.slice(-8) || 'N/A'}</div>
          </div>
          <div>
            <span className="font-medium">Booking ID:</span>
            <div className="truncate">{booking.id.slice(-8)}</div>
          </div>
        </div>

        {/* Lesson IDs */}
        {booking.lessons && booking.lessons.length > 0 && (
          <div className="text-xs text-muted-foreground">
            <span className="font-medium">Lesson IDs:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {booking.lessons.map((lesson: any, index: number) => (
                <span key={lesson.id} className="inline-flex items-center">
                  <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                    {lesson.id.slice(-8)}
                  </span>
                  {index < booking.lessons.length - 1 && <span className="mx-1">,</span>}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Event IDs */}
        {allEvents.length > 0 && (
          <div className="text-xs text-muted-foreground">
            <span className="font-medium">Event IDs:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {allEvents.map((event: any, index: number) => (
                <span key={event.id} className="inline-flex items-center">
                  <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                    {event.id.slice(-8)}
                  </span>
                  {index < allEvents.length - 1 && <span className="mx-1">,</span>}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lesson Modal */}
      {showLessonModal && (
        <BookingToLessonModal
          bookingId={booking.id}
          onClose={() => setShowLessonModal(false)}
        />
      )}
    </div>
  );
}
