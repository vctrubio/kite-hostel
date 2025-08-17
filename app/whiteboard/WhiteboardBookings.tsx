'use client';

import { useState, useMemo } from 'react';
import BookingCard from '@/components/cards/BookingCard';
import { BOOKING_STATUS_FILTERS, type BookingStatusFilter } from '@/lib/constants';
import { WhiteboardClass, createBookingClasses } from '@/backend/WhiteboardClass';
import { CheckCircle } from 'lucide-react';
import { TeacherSchedule } from '@/backend/TeacherSchedule';
import { type EventController } from '@/backend/types';

interface WhiteboardBookingsProps {
  bookings: any[];
  teacherSchedules: Map<string, TeacherSchedule>;
  selectedDate: string;
  controller: EventController;
}

export default function WhiteboardBookings({ 
  bookings, 
  teacherSchedules, 
  selectedDate, 
  controller
}: WhiteboardBookingsProps) {
  const [activeFilter, setActiveFilter] = useState<BookingStatusFilter>('all');

  // Create WhiteboardClass instances for enhanced business logic
  const bookingClasses = useMemo(() => createBookingClasses(bookings), [bookings]);

  // Enhanced filtering using WhiteboardClass business logic
  const filteredBookings = useMemo(() => {
    let filtered = bookingClasses;
    
    if (activeFilter !== 'all') {
      filtered = bookingClasses.filter(bookingClass => bookingClass.getStatus() === activeFilter);
    }
    
    return filtered;
  }, [bookingClasses, activeFilter]);

  // Enhanced status counts using business logic
  const statusCounts = {
    all: bookingClasses.length,
    active: bookingClasses.filter(bc => bc.getStatus() === 'active').length,
    completed: bookingClasses.filter(bc => bc.getStatus() === 'completed').length,
    cancelled: bookingClasses.filter(bc => bc.getStatus() === 'cancelled').length,
  };

  // Get bookings ready for completion using business logic
  const completableBookings = bookingClasses.filter(bc => bc.isReadyForCompletion());

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Bookings ({filteredBookings.length})</h3>
        
        {/* Filter Buttons */}
        <div className="flex gap-2">
          {BOOKING_STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setActiveFilter(filter.value)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                activeFilter === filter.value 
                  ? filter.color.replace('hover:', '').replace('100', '200')
                  : filter.color
              }`}
            >
              {filter.label} ({statusCounts[filter.value]})
            </button>
          ))}
        </div>
      </div>

      {/* Enhanced Status Alerts */}
      {completableBookings.length > 0 && (
        <div className="mb-4 p-3 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
              {completableBookings.length} booking{completableBookings.length > 1 ? 's' : ''} ready for completion
            </span>
          </div>
        </div>
      )}

      {filteredBookings.length === 0 ? (
        <div className="p-8 bg-muted rounded-lg text-center">
          <p className="text-muted-foreground">
            {activeFilter === 'all' 
              ? 'No bookings found for this date' 
              : `No ${activeFilter} bookings found for this date`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {filteredBookings.map((bookingClass) => (
            <BookingCard 
              key={bookingClass.getId()} 
              booking={bookingClass.toJSON()}
              teacherSchedules={teacherSchedules}
              selectedDate={selectedDate}
              controller={controller}
            />
          ))}
        </div>
      )}
    </div>
  );
}