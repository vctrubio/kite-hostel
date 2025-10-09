"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookingIcon, KiteIcon, ClockIcon } from "@/svgs";
import { TrendingUp, Activity, Wind } from "lucide-react";

interface Statistics {
  totalRevenue: number;
  totalBookings: number;
  totalEvents: number;
  totalHours: number;
  totalDays: number;
  daysWithNoWind: number;
}

interface StatisticsStatsBoxProps {
  statistics: Statistics;
}

export function StatisticsStatsBox({ statistics }: StatisticsStatsBoxProps) {
  // Format hours to remove unnecessary decimals
  const formatHours = (hours: number) => {
    return hours % 1 === 0 ? hours.toString() : hours.toFixed(1);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Revenue & Bookings Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Revenue
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-3xl font-bold">
            €{statistics.totalRevenue.toFixed(2)}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground border-t pt-3">
            <BookingIcon className="h-4 w-4" />
            <span className="text-sm">Bookings:</span>
            <span className="font-semibold text-foreground">
              {statistics.totalBookings}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Events & Hours Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
            <KiteIcon className="h-4 w-4" />
            Events
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-3xl font-bold">{statistics.totalEvents}</div>
          <div className="flex items-center gap-2 text-muted-foreground border-t pt-3">
            <ClockIcon className="h-4 w-4" />
            <span className="text-sm">Total hours:</span>
            <span className="font-semibold text-foreground">
              {formatHours(statistics.totalHours)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Total Days & No Wind Days Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Total Days
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-3xl font-bold">{statistics.totalDays}</div>
          <div className="flex items-center gap-2 text-muted-foreground border-t pt-3">
            <Wind className="h-4 w-4" />
            <span className="text-sm">No wind:</span>
            <span className="font-semibold text-foreground">
              {statistics.daysWithNoWind} days
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
