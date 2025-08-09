import React from 'react';
import { DateTime } from '@/components/formatters/DateTime';

interface EventDetailModalProps {
  events: any[];
  isOpen: boolean;
  onClose: () => void;
}

export default function EventDetailModal({ events, isOpen, onClose }: EventDetailModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl max-h-[80vh] overflow-y-auto p-6 m-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">All Events</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="border rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Event #{event.id}</h3>
                  <p className="text-sm text-gray-600">
                    <DateTime dateString={event.date} formatType="datetime" />
                  </p>
                  <p className="text-sm">Duration: {event.duration || 0} minutes</p>
                  <p className="text-sm">Kite: {event.kite?.model || 'No kite'} {event.kite?.size ? `(${event.kite.size}m)` : ''}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-purple-600">
                    €{(event.booking?.package?.price_per_student || 0) * (event.booking?.students?.length || 0)}
                  </p>
                  <p className="text-sm text-gray-600">Revenue</p>
                </div>
              </div>
              
              <div className="mt-2 pt-2 border-t grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Booking Info:</p>
                  <p className="text-xs text-gray-600">Package: {event.booking?.package?.name || 'Unknown'}</p>
                  <p className="text-xs text-gray-600">Students: {event.booking?.students?.length || 0}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Lesson Info:</p>
                  <p className="text-xs text-gray-600">Teacher: {event.lesson?.teacher?.name || 'Unassigned'}</p>
                  <p className="text-xs text-gray-600">Status: {event.lesson?.status || 'Unknown'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
