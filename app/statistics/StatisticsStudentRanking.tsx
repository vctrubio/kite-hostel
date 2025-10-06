"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";
import { KiteIcon, ClockIcon, HelmetIcon } from "@/svgs";

interface StudentBookingStats {
  students: string[];
  studentIds: string[];
  totalRevenue: number;
  totalHours: number;
  eventCount: number;
  bookingId: string;
}

interface StatisticsStudentRankingProps {
  studentRankings: StudentBookingStats[];
  isOpen: boolean;
  onToggle: () => void;
}

export function StatisticsStudentRanking({
  studentRankings,
  isOpen,
  onToggle,
}: StatisticsStudentRankingProps) {
  const router = useRouter();
  
  const totalRevenue = studentRankings.reduce(
    (sum, booking) => sum + booking.totalRevenue,
    0
  );

  const handleStudentClick = (booking: StudentBookingStats) => {
    // If there's only one student, go to their page, otherwise go to the booking
    if (booking.studentIds.length === 1 && booking.studentIds[0]) {
      router.push(`/students/${booking.studentIds[0]}`);
    } else {
      router.push(`/bookings/${booking.bookingId}`);
    }
  };

  // Format hours to remove unnecessary decimals
  const formatHours = (hours: number) => {
    return hours % 1 === 0 ? hours.toString() : hours.toFixed(1);
  };

  return (
    <Card>
      <CardHeader 
        className="cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center justify-between flex-1">
            <div className="flex items-center gap-2">
              <HelmetIcon className="w-5 h-5 text-yellow-500" />
              <span>Student Rankings</span>
            </div>
            <span className="text-sm font-normal text-muted-foreground">
              Total Revenue: €{totalRevenue.toFixed(2)}
            </span>
          </CardTitle>
          <div className="ml-2">
            {isOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </div>
        </div>
      </CardHeader>
      {isOpen && (
        <CardContent>
          <div className="space-y-2">
            {studentRankings.map((booking, index) => (
              <div
                key={booking.bookingId}
                onClick={() => handleStudentClick(booking)}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="font-semibold text-gray-500 w-8">
                    #{index + 1}
                  </div>
                  <div>
                    <div className="font-medium">{booking.students.join(", ")}</div>
                    <div className="text-sm text-gray-600 flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1.5">
                        <KiteIcon className="h-3.5 w-3.5" />
                        <span>{booking.eventCount}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <ClockIcon className="h-3.5 w-3.5" />
                        <span>{formatHours(booking.totalHours)}h</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-lg font-bold">
                  €{booking.totalRevenue.toFixed(2)}
                </div>
              </div>
            ))}
            {studentRankings.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No booking data available
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
