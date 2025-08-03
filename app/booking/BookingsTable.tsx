"use client";

import React from "react";

export default function BookingsTable() {
  return (
    <div className="container mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Existing Bookings</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Booking ID</th>
              <th className="py-2 px-4 border-b">Package</th>
              <th className="py-2 px-4 border-b">Start Date</th>
              <th className="py-2 px-4 border-b">End Date</th>
              <th className="py-2 px-4 border-b">Status</th>
              <th className="py-2 px-4 border-b">Students</th>
            </tr>
          </thead>
          <tbody>
            {/* Booking rows will be dynamically loaded here */}
            <tr>
              <td className="py-2 px-4 border-b">#12345</td>
              <td className="py-2 px-4 border-b">Beginner Package</td>
              <td className="py-2 px-4 border-b">2025-08-01</td>
              <td className="py-2 px-4 border-b">2025-08-05</td>
              <td className="py-2 px-4 border-b">Active</td>
              <td className="py-2 px-4 border-b">John Doe, Jane Smith</td>
            </tr>
            <tr>
              <td className="py-2 px-4 border-b">#12346</td>
              <td className="py-2 px-4 border-b">Intermediate Package</td>
              <td className="py-2 px-4 border-b">2025-07-20</td>
              <td className="py-2 px-4 border-b">2025-07-25</td>
              <td className="py-2 px-4 border-b">Completed</td>
              <td className="py-2 px-4 border-b">Peter Jones</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}