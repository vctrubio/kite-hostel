'use client';

import React, { useState } from 'react';
import { BookingIcon, LessonIcon, EventIcon, TeacherIcon, KiteIcon } from '@/svgs';
import BookingDetailModal from '@/components/modals/BookingDetailModal';
import LessonDetailModal from '@/components/modals/LessonDetailModal';
import EventDetailModal from '@/components/modals/EventDetailModal';
import TeacherDetailModal from '@/components/modals/TeacherDetailModal';
import KiteDetailModal from '@/components/modals/KiteDetailModal';

interface WhiteboardStatusProps {
  bookings: any[];
  lessons: any[];
  events: any[];
  kites?: any[]; // Will add this when we fetch kite data
}

interface TeacherSummary {
  name: string;
  totalHours: number;
  totalEvents: number;
  totalEarnings: number;
}

export default function WhiteboardStatus({ bookings, lessons, events, kites }: WhiteboardStatusProps) {
  // Helper function to calculate commission from lesson events
  const getCommissionFromLessonEvent = (lessonId: string, events: any[]): number => {
    // Find all events for this lesson
    const lessonEvents = events.filter(event => event.lesson?.id === lessonId);
    
    // Find the lesson to get commission rate
    const lesson = lessons.find(l => l.id === lessonId);
    if (!lesson || !lesson.commission?.price_per_hour) {
      console.log(`No commission found for lesson ${lessonId}:`, lesson?.commission);
      return 0;
    }

    // Calculate total hours from events and multiply by commission rate
    const totalMinutes = lessonEvents.reduce((sum, event) => sum + (event.duration || 0), 0);
    const totalHours = totalMinutes / 60;
    
    const earnings = totalHours * lesson.commission.price_per_hour;
    console.log(`Lesson ${lessonId}: ${totalHours}h × €${lesson.commission.price_per_hour}/h = €${earnings}`);
    
    return earnings;
  };

  const [modals, setModals] = useState({
    bookingActive: false,
    bookingCompleted: false,
    lessonPlanned: false,
    lessonRest: false,
    events: false,
    teachers: false,
    kites: false,
  });

  const closeModal = (modalName: keyof typeof modals) => {
    setModals(prev => ({ ...prev, [modalName]: false }));
  };

  const openModal = (modalName: keyof typeof modals) => {
    setModals(prev => ({ ...prev, [modalName]: true }));
  };

  // Calculate booking statistics
  const activeBookings = bookings.filter(b => b.status === 'active').length;
  const completedBookings = bookings.filter(b => b.status === 'completed').length;

  // Calculate lesson statistics
  const plannedLessons = lessons.filter(l => l.status === 'planned').length;
  const restLessons = lessons.filter(l => l.status === 'rest').length;

  // Calculate event statistics
  const totalEvents = events.length;
  const totalDuration = events.reduce((sum, event) => sum + (event.duration || 0), 0);
  
  // Calculate total money from packages
  const totalRevenue = events.reduce((sum, event) => {
    const packagePrice = event.booking?.package?.price_per_student || 0;
    const studentCount = event.booking?.students?.length || 0;
    return sum + (packagePrice * studentCount);
  }, 0);

  // Calculate teacher statistics
  const teacherStats = lessons.reduce((acc: Record<string, TeacherSummary>, lesson) => {
    const teacherName = lesson.teacher?.name || 'Unknown Teacher';
    
    if (!acc[teacherName]) {
      acc[teacherName] = {
        name: teacherName,
        totalHours: 0,
        totalEvents: 0,
        totalEarnings: 0,
      };
    }

    // Get events for this specific lesson
    const lessonEvents = events.filter(event => event.lesson?.id === lesson.id);
    
    // Calculate hours from events
    const totalMinutes = lessonEvents.reduce((sum, event) => sum + (event.duration || 0), 0);
    const hours = totalMinutes / 60;
    
    acc[teacherName].totalHours += hours;
    acc[teacherName].totalEvents += lessonEvents.length;

    // Calculate earnings using the new commission function
    const earnings = getCommissionFromLessonEvent(lesson.id, events);
    acc[teacherName].totalEarnings += earnings;

    return acc;
  }, {});

  const teacherSummaries: TeacherSummary[] = Object.values(teacherStats);

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold mb-4">Today&apos;s Summary</h3>
      
      {/* Bookings Section */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h4 className="text-lg font-medium mb-4 text-primary flex items-center gap-2">
          <BookingIcon className="w-5 h-5" />
          Bookings
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div 
            className="text-center p-4 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition-colors"
            onClick={() => openModal('bookingActive')}
          >
            <div className="text-2xl font-bold text-green-600">{activeBookings}</div>
            <div className="text-sm text-muted-foreground">Active</div>
          </div>
          <div 
            className="text-center p-4 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
            onClick={() => openModal('bookingCompleted')}
          >
            <div className="text-2xl font-bold text-blue-600">{completedBookings}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </div>
        </div>
      </div>

      {/* Lessons Section */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h4 className="text-lg font-medium mb-4 text-blue-600 flex items-center gap-2">
          <LessonIcon className="w-5 h-5" />
          Lessons
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div 
            className="text-center p-4 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
            onClick={() => openModal('lessonPlanned')}
          >
            <div className="text-2xl font-bold text-blue-600">{plannedLessons}</div>
            <div className="text-sm text-muted-foreground">Planned</div>
          </div>
          <div 
            className="text-center p-4 bg-yellow-50 rounded-lg cursor-pointer hover:bg-yellow-100 transition-colors"
            onClick={() => openModal('lessonRest')}
          >
            <div className="text-2xl font-bold text-yellow-600">{restLessons}</div>
            <div className="text-sm text-muted-foreground">Rest</div>
          </div>
        </div>
      </div>

      {/* Events Section */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h4 className="text-lg font-medium mb-4 text-purple-600 flex items-center gap-2">
          <EventIcon className="w-5 h-5" />
          Events
        </h4>
        <div className="grid grid-cols-3 gap-4">
          <div 
            className="text-center p-4 bg-purple-50 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors"
            onClick={() => openModal('events')}
          >
            <div className="text-2xl font-bold text-purple-600">{totalEvents}</div>
            <div className="text-sm text-muted-foreground">Total Events</div>
          </div>
          <div className="text-center p-4 bg-indigo-50 rounded-lg">
            <div className="text-2xl font-bold text-indigo-600">{Math.round(totalDuration / 60 * 10) / 10}h</div>
            <div className="text-sm text-muted-foreground">Total Duration</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">€{totalRevenue}</div>
            <div className="text-sm text-muted-foreground">Total Revenue</div>
          </div>
        </div>
      </div>

      {/* Teachers Section */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h4 className="text-lg font-medium mb-4 text-green-600 flex items-center gap-2">
          <TeacherIcon className="w-5 h-5" />
          Teachers
        </h4>
        {teacherSummaries.length === 0 ? (
          <div className="text-center p-8 text-muted-foreground">
            No teacher data available for this date
          </div>
        ) : (
          <div className="space-y-3">
            {teacherSummaries.map((teacher) => (
              <div 
                key={teacher.name} 
                className="flex justify-between items-center p-4 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors"
                onClick={() => openModal('teachers')}
              >
                <div className="font-medium">{teacher.name}</div>
                <div className="flex gap-6 text-sm">
                  <div className="text-center">
                    <div className="font-semibold text-blue-600">{Math.round(teacher.totalHours * 10) / 10}h</div>
                    <div className="text-xs text-muted-foreground">Hours</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-purple-600">{teacher.totalEvents}</div>
                    <div className="text-xs text-muted-foreground">Events</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-green-600">€{Math.round(teacher.totalEarnings)}</div>
                    <div className="text-xs text-muted-foreground">Earnings</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Kites Section */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h4 className="text-lg font-medium mb-4 text-orange-600 flex items-center gap-2">
          <KiteIcon className="w-5 h-5" />
          Kites
        </h4>
        {!kites || kites.length === 0 ? (
          <div className="text-center p-8 text-muted-foreground">
            No kite data available
          </div>
        ) : (
          <div className="space-y-3">
            {kites.map((kite: any) => (
              <div 
                key={kite.id} 
                className="flex justify-between items-center p-4 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors"
                onClick={() => openModal('kites')}
              >
                <div className="font-medium">{kite.model} - {kite.size}m</div>
                <div className="flex gap-6 text-sm">
                  <div className="text-center">
                    <div className="font-semibold text-blue-600">{kite.serial_id}</div>
                    <div className="text-xs text-muted-foreground">Serial</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-purple-600">{kite.events?.length || 0}</div>
                    <div className="text-xs text-muted-foreground">Events</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-green-600">{kite.assignedTeachers?.length || 0}</div>
                    <div className="text-xs text-muted-foreground">Teachers</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <BookingDetailModal 
        bookings={bookings} 
        isOpen={modals.bookingActive} 
        onClose={() => closeModal('bookingActive')}
        type="active"
      />
      <BookingDetailModal 
        bookings={bookings} 
        isOpen={modals.bookingCompleted} 
        onClose={() => closeModal('bookingCompleted')}
        type="completed"
      />
      <LessonDetailModal 
        lessons={lessons} 
        isOpen={modals.lessonPlanned} 
        onClose={() => closeModal('lessonPlanned')}
        type="planned"
      />
      <LessonDetailModal 
        lessons={lessons} 
        isOpen={modals.lessonRest} 
        onClose={() => closeModal('lessonRest')}
        type="rest"
      />
      <EventDetailModal 
        events={events} 
        isOpen={modals.events} 
        onClose={() => closeModal('events')}
      />
      <TeacherDetailModal 
        teacherSummaries={teacherSummaries} 
        lessons={lessons}
        events={events}
        isOpen={modals.teachers} 
        onClose={() => closeModal('teachers')}
      />
      <KiteDetailModal 
        kites={kites || []} 
        isOpen={modals.kites} 
        onClose={() => closeModal('kites')}
      />
    </div>
  );
}
