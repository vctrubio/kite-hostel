"use client";

import { useMemo } from "react";
import { TransactionData } from "../api/statistics/route";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown } from "lucide-react";

type SortField = "startDate" | "students" | "pricePerHour" | "packageHours" | "totalHours" | "revenue";
type SortOrder = "asc" | "desc";

interface BookingData {
  bookingId: string;
  startDate: string; // First event date = check-in/start date for filtering
  totalDays: number;
  students: string[];
  pricePerHour: number; // Revenue per hour per student
  packageHours: number; // Package duration in hours
  totalHours: number; // Total hours in decimal (e.g., 1.5h)
  totalRevenue: number;
}

interface BookingsTableProps {
  data: TransactionData[];
  sortField: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField) => void;
}

export function BookingsTable({
  data,
  sortField,
  sortOrder,
  onSort,
}: BookingsTableProps) {
  const formatFriendlyDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const suffix = day === 1 || day === 21 || day === 31 ? 'st' : 
                   day === 2 || day === 22 ? 'nd' : 
                   day === 3 || day === 23 ? 'rd' : 'th';
    const month = date.toLocaleDateString('en-GB', { month: 'short' });
    const year = date.getFullYear();
    return `${day}${suffix} ${month} ${year}`;
  };

  const formatHours = (hours: number) => {
    return hours % 1 === 0 ? hours.toString() : hours.toFixed(1);
  };

  // Group transactions by booking and calculate booking-level data
  const bookingData = useMemo(() => {
    const bookingMap = new Map<string, BookingData>();

    data.forEach((transaction) => {
      const bookingId = transaction.bookingId;
      
      if (!bookingMap.has(bookingId)) {
        // Initialize booking data - startDate is the first event date (check-in)
        const studentsSet = new Set(transaction.students);
        
        bookingMap.set(bookingId, {
          bookingId,
          startDate: transaction.eventDate, // This is the check-in/start date
          totalDays: 1,
          students: Array.from(studentsSet),
          pricePerHour: transaction.pricePerStudent, // Store pricePerStudent temporarily
          packageHours: transaction.packageHours,
          totalHours: transaction.duration / 60, // Convert minutes to hours
          totalRevenue: transaction.revenue,
        });
      } else {
        // Update existing booking data
        const booking = bookingMap.get(bookingId)!;
        const eventDate = new Date(transaction.eventDate);
        const currentStartDate = new Date(booking.startDate);
        
        // Update start date if this event is earlier (this is the actual check-in date)
        if (eventDate < currentStartDate) {
          booking.startDate = transaction.eventDate;
        }
        
        // Calculate total days span
        const latestDate = new Date(booking.startDate);
        data.filter(t => t.bookingId === bookingId).forEach(t => {
          const d = new Date(t.eventDate);
          if (d > latestDate) latestDate.setTime(d.getTime());
        });
        const daysDiff = Math.floor((latestDate.getTime() - new Date(booking.startDate).getTime()) / (1000 * 60 * 60 * 24));
        booking.totalDays = daysDiff + 1;
        
        // Add students
        const studentsSet = new Set([...booking.students, ...transaction.students]);
        booking.students = Array.from(studentsSet);
        
        // Add hours (convert minutes to hours) and revenue
        booking.totalHours += transaction.duration / 60;
        booking.totalRevenue += transaction.revenue;
      }
    });

    // Calculate price per hour per student for each booking (price_per_student / packageHours)
    bookingMap.forEach((booking) => {
      booking.pricePerHour = booking.packageHours > 0 
        ? booking.pricePerHour / booking.packageHours 
        : 0;
    });

    return Array.from(bookingMap.values());
  }, [data]);

  // Sort booking data
  const sortedBookingData = useMemo(() => {
    return [...bookingData].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "startDate":
          comparison = new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
          break;
        case "students":
          comparison = a.students.length - b.students.length;
          break;
        case "pricePerHour":
          comparison = a.pricePerHour - b.pricePerHour;
          break;
        case "packageHours":
          comparison = a.packageHours - b.packageHours;
          break;
        case "totalHours":
          comparison = a.totalHours - b.totalHours;
          break;
        case "revenue":
          comparison = a.totalRevenue - b.totalRevenue;
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [bookingData, sortField, sortOrder]);

  const handleRowClick = (bookingId: string, e: React.MouseEvent) => {
    e.preventDefault();
    window.open(`/bookings/${bookingId}`, '_blank');
  };

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-border bg-muted/50">
                <th
                  className="text-left p-4 font-semibold text-foreground cursor-pointer"
                  onClick={() => onSort("startDate")}
                >
                  <div className="flex items-center space-x-2">
                    <span>Check-in</span>
                    {sortField === "startDate" ? (
                      sortOrder === "asc" ? (
                        <ArrowUp className="h-4 w-4" />
                      ) : (
                        <ArrowDown className="h-4 w-4" />
                      )
                    ) : (
                      <div className="h-4 w-4 opacity-30">
                        <ArrowUp className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                </th>
                <th
                  className="text-left p-4 font-semibold text-foreground cursor-pointer"
                  onClick={() => onSort("students")}
                >
                  <div className="flex items-center space-x-2">
                    <span>Students</span>
                    {sortField === "students" ? (
                      sortOrder === "asc" ? (
                        <ArrowUp className="h-4 w-4" />
                      ) : (
                        <ArrowDown className="h-4 w-4" />
                      )
                    ) : (
                      <div className="h-4 w-4 opacity-30">
                        <ArrowUp className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                </th>
                <th
                  className="text-left p-4 font-semibold text-foreground cursor-pointer"
                  onClick={() => onSort("pricePerHour")}
                >
                  <div className="flex items-center space-x-2">
                    <span>Price/Hour/Student</span>
                    {sortField === "pricePerHour" ? (
                      sortOrder === "asc" ? (
                        <ArrowUp className="h-4 w-4" />
                      ) : (
                        <ArrowDown className="h-4 w-4" />
                      )
                    ) : (
                      <div className="h-4 w-4 opacity-30">
                        <ArrowUp className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                </th>
                <th
                  className="text-left p-4 font-semibold text-foreground cursor-pointer"
                  onClick={() => onSort("packageHours")}
                >
                  <div className="flex items-center space-x-2">
                    <span>Package Hours</span>
                    {sortField === "packageHours" ? (
                      sortOrder === "asc" ? (
                        <ArrowUp className="h-4 w-4" />
                      ) : (
                        <ArrowDown className="h-4 w-4" />
                      )
                    ) : (
                      <div className="h-4 w-4 opacity-30">
                        <ArrowUp className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                </th>
                <th
                  className="text-left p-4 font-semibold text-foreground cursor-pointer"
                  onClick={() => onSort("totalHours")}
                >
                  <div className="flex items-center space-x-2">
                    <span>Total Hours</span>
                    {sortField === "totalHours" ? (
                      sortOrder === "asc" ? (
                        <ArrowUp className="h-4 w-4" />
                      ) : (
                        <ArrowDown className="h-4 w-4" />
                      )
                    ) : (
                      <div className="h-4 w-4 opacity-30">
                        <ArrowUp className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                </th>
                <th
                  className="text-left p-4 font-semibold text-foreground cursor-pointer"
                  onClick={() => onSort("revenue")}
                >
                  <div className="flex items-center space-x-2">
                    <span>Revenue</span>
                    {sortField === "revenue" ? (
                      sortOrder === "asc" ? (
                        <ArrowUp className="h-4 w-4" />
                      ) : (
                        <ArrowDown className="h-4 w-4" />
                      )
                    ) : (
                      <div className="h-4 w-4 opacity-30">
                        <ArrowUp className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedBookingData.map((booking) => (
                <tr
                  key={booking.bookingId}
                  className="cursor-pointer hover:bg-gray-50 border-b border-border"
                  onClick={(e) => handleRowClick(booking.bookingId, e)}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {formatFriendlyDate(booking.startDate)}
                      </span>
                      {booking.totalDays > 1 && (
                        <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-md text-gray-600">
                          +{booking.totalDays - 1}d
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">{booking.students.join(", ")}</td>
                  <td className="p-4">€{booking.pricePerHour.toFixed(2)}</td>
                  <td className="p-4">{formatHours(booking.packageHours)}h</td>
                  <td className="p-4">{formatHours(booking.totalHours)}h</td>
                  <td className="p-4 font-medium">
                    €{booking.totalRevenue.toFixed(2)}
                  </td>
                </tr>
              ))}
              {sortedBookingData.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-muted-foreground">
                    No bookings found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
