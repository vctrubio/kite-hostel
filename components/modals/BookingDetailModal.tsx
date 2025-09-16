
import { DateTime } from '@/components/formatters/DateTime';

interface BookingDetailModalProps {
  bookings: any[];
  isOpen: boolean;
  onClose: () => void;
  type: 'active' | 'completed';
}

export default function BookingDetailModal({ bookings, isOpen, onClose, type }: BookingDetailModalProps) {
  if (!isOpen) return null;

  const filteredBookings = bookings.filter(b => b.status === type);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl max-h-[80vh] overflow-y-auto p-6 m-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold capitalize">{type} Bookings</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div key={booking.id} className="border rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">{booking.package?.name || 'Unknown Package'}</h3>
                  <p className="text-sm text-gray-600">
                    <DateTime dateString={booking.date} formatType="date" /> at <DateTime dateString={booking.date} formatType="time" />
                  </p>
                  <p className="text-sm">
                    Students: {booking.students?.length || 0}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">
                    €{(booking.package?.price_per_student || 0) * (booking.students?.length || 0)}
                  </p>
                  <p className="text-sm text-gray-600">
                    €{booking.package?.price_per_student || 0} per student
                  </p>
                </div>
              </div>
              
              {booking.students && booking.students.length > 0 && (
                <div className="mt-2 pt-2 border-t">
                  <p className="text-sm font-medium">Students:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {booking.students.map((student: any) => (
                      <span key={student.id} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {student.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
