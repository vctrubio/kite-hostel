"use client";

import { BillboardClass } from "@/backend/BillboardClass";
import { type BookingData } from "@/backend/types";

interface BillboardDevProps {
  bookingsData: BookingData[];
}

export default function BillboardDev({ bookingsData }: BillboardDevProps) {
  // Create BillboardClass instances from the booking data
  const billboardClasses = bookingsData.map(booking => new BillboardClass(booking));

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-gray-50 border rounded-lg mt-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Billboard Dev - JSON View
        </h2>
        <p className="text-sm text-gray-600">
          Showing {billboardClasses.length} booking(s) as BillboardClass instances
        </p>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {billboardClasses.map((billboardClass, index) => (
          <div key={billboardClass.booking.id} className="bg-white border rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-gray-700">
                Booking #{index + 1} - {billboardClass.booking.id.slice(0, 8)}...
              </h3>
              <div className="flex gap-2 text-xs">
                <span className={`px-2 py-1 rounded ${
                  billboardClass.booking.status === 'active'
                    ? 'bg-green-100 text-green-800' 
                    : billboardClass.booking.status === 'completed'
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {billboardClass.booking.status}
                </span>
              </div>
            </div>
            
            {/* Quick access examples */}
            <div className="mb-3 p-3 bg-gray-50 rounded text-sm">
              <h4 className="font-medium mb-2">Direct Access Examples:</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <strong>Start Date:</strong> {billboardClass.booking.date_start}
                </div>
                <div>
                  <strong>End Date:</strong> {billboardClass.booking.date_end}
                </div>
                <div>
                  <strong>First Student ID:</strong> {billboardClass.booking.students?.[0]?.student?.id || 'N/A'}
                </div>
                <div>
                  <strong>First Student Name:</strong> {billboardClass.booking.students?.[0]?.student?.name || 'N/A'}
                </div>
                <div>
                  <strong>First Student Last Name:</strong> {billboardClass.booking.students?.[0]?.student?.last_name || 'N/A'}
                </div>
                <div>
                  <strong>Student Count:</strong> {billboardClass.booking.students?.length || 0}
                </div>
                <div>
                  <strong>Planned Minutes:</strong> {billboardClass.getEventMinutes().planned} min
                </div>
                <div>
                  <strong>TBC Minutes:</strong> {billboardClass.getEventMinutes().tbc} min
                </div>
                <div>
                  <strong>Completed Minutes:</strong> {billboardClass.getEventMinutes().completed} min
                </div>
                <div>
                  <strong>Cancelled Minutes:</strong> {billboardClass.getEventMinutes().cancelled} min
                </div>
                <div>
                  <strong>Remaining Minutes:</strong> {billboardClass.getRemainingMinutes()} min
                </div>
                <div>
                  <strong>Package Duration:</strong> {billboardClass.package?.duration || 0} min
                </div>
                <div>
                  <strong>Package Price:</strong> €{billboardClass.package?.price_per_student || 0}
                </div>
                <div>
                  <strong>Lessons Count:</strong> {billboardClass.lessons.length}
                </div>
                <div>
                  <strong>Expected Total:</strong> {billboardClass.getPackageMinutes().expected.total} min
                </div>
                <div>
                  <strong>Expected Total Price:</strong> €{billboardClass.getPackageMinutes().expected.totalPrice}
                </div>
                <div>
                  <strong>Expected Price/Student:</strong> €{billboardClass.getPackageMinutes().expected.pricePerStudent}
                </div>
                <div>
                  <strong>Spent Total:</strong> {billboardClass.getPackageMinutes().spent.total} min
                </div>
                <div>
                  <strong>Spent Total Price:</strong> €{billboardClass.getPackageMinutes().spent.totalPrice.toFixed(2)}
                </div>
                <div>
                  <strong>Spent Price/Student:</strong> €{billboardClass.getPackageMinutes().spent.pricePerStudent.toFixed(2)}
                </div>
                <div>
                  <strong>Package Hours:</strong> {(billboardClass.package?.duration || 0) / 60}h
                </div>
                <div>
                  <strong>Event Hours:</strong> {(billboardClass.getEventMinutes().completed / 60).toFixed(1)}h
                </div>
              </div>
            </div>

            {/* Full JSON */}
            <div className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto">
              <pre>{JSON.stringify({
                booking: billboardClass.booking,
                package: billboardClass.package,
                lessons: billboardClass.lessons,
                computed: {
                  eventMinutes: billboardClass.getEventMinutes(),
                  packageMinutes: billboardClass.getPackageMinutes(),
                  remainingMinutes: billboardClass.getRemainingMinutes(),
                  packageHours: (billboardClass.package?.duration || 0) / 60,
                  eventHours: billboardClass.getEventMinutes().completed / 60,
                }
              }, null, 2)}</pre>
            </div>
          </div>
        ))}
      </div>

      {/* Usage Examples */}
      {/* <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">Direct Access Usage:</h3>
        <div className="text-sm text-blue-700 space-y-1">
          <div><code>billboardClass.booking.date_start</code> - Start date</div>
          <div><code>billboardClass.booking.date_end</code> - End date</div>
          <div><code>billboardClass.booking.students[0].student.id</code> - First student ID</div>
          <div><code>billboardClass.booking.students[0].student.last_name</code> - First student last name</div>
          <div><code>billboardClass.lessons</code> - All lessons array</div>
          <div><code>billboardClass.package.duration</code> - Package duration</div>
          <div><code>billboardClass.package.price_per_student</code> - Price per student</div>
          <div><code>billboardClass.booking.status</code> - Booking status</div>
        </div>
        <div className="mt-3 text-sm text-blue-700">
          <strong>Computed methods available:</strong>
          <div className="space-y-1 mt-1">
            <div><code>billboardClass.getEventMinutes().planned</code> - Planned event durations</div>
            <div><code>billboardClass.getEventMinutes().completed</code> - Completed event durations</div>
            <div><code>billboardClass.getEventMinutes().tbc</code> - TBC event durations</div>
            <div><code>billboardClass.getEventMinutes().cancelled</code> - Cancelled event durations</div>
            <div><code>billboardClass.getPackageMinutes().expected.total</code> - Expected total minutes</div>
            <div><code>billboardClass.getPackageMinutes().expected.totalPrice</code> - Expected total price</div>
            <div><code>billboardClass.getPackageMinutes().expected.pricePerStudent</code> - Expected price per student</div>
            <div><code>billboardClass.getPackageMinutes().spent.total</code> - Spent total minutes</div>
            <div><code>billboardClass.getPackageMinutes().spent.totalPrice</code> - Spent total price</div>
            <div><code>billboardClass.getPackageMinutes().spent.pricePerStudent</code> - Spent price per student</div>
            <div><code>billboardClass.getRemainingMinutes()</code> - Planned - Completed</div>
            <div><code>billboardClass.getStudentCount()</code> - Number of students</div>
          </div>
          <div className="mt-2 text-xs text-blue-600">
            <strong>Direct calculations:</strong>
            <div className="space-y-1 mt-1">
              <div><code>billboardClass.package.duration / 60</code> - Package hours</div>
              <div><code>billboardClass.getEventMinutes().completed / 60</code> - Event hours</div>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
}
