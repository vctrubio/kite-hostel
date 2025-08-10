'use client';

import { useState } from 'react';
import BookingCard from '@/components/cards/BookingCard';
import { BOOKING_STATUS_FILTERS, type BookingStatusFilter } from '@/lib/constants';

interface WhiteboardBookingsProps {
  bookings: any[];
}

export default function WhiteboardBookings({ bookings }: WhiteboardBookingsProps) {
  const [activeFilter, setActiveFilter] = useState<BookingStatusFilter>('all');

  // Filter bookings based on selected status
  const filteredBookings = activeFilter === 'all' 
    ? bookings 
    : bookings.filter(booking => booking.status === activeFilter);

  // Count bookings by status for button labels
  const statusCounts = {
    all: bookings.length,
    active: bookings.filter(b => b.status === 'active').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  };

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
          {filteredBookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </div>
      )}
    </div>
  );
}
