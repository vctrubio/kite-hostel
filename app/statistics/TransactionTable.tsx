"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown } from "lucide-react";
import { TransactionData } from "../api/statistics/route";

type SortField = "eventDate" | "teacher" | "students" | "duration" | "revenue";
type SortOrder = "asc" | "desc";

interface TransactionTableProps {
  data: TransactionData[];
  sortField: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField) => void;
}

export function TransactionTable({
  data,
  sortField,
  sortOrder,
  onSort,
}: TransactionTableProps) {
  const handleRowClick = (bookingId: string, e: React.MouseEvent) => {
    e.preventDefault();
    window.open(`/bookings/${bookingId}`, '_blank');
  };

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

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-border bg-muted/50">
                <th
                  className="text-left p-4 font-semibold text-foreground cursor-pointer"
                  onClick={() => onSort("eventDate")}
                >
                  <div className="flex items-center space-x-2">
                    <span>Date</span>
                    {sortField === "eventDate" ? (
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
                  onClick={() => onSort("teacher")}
                >
                  <div className="flex items-center space-x-2">
                    <span>Teacher</span>
                    {sortField === "teacher" ? (
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
                  onClick={() => onSort("duration")}
                >
                  <div className="flex items-center space-x-2">
                    <span>Duration</span>
                    {sortField === "duration" ? (
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
              {data.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="cursor-pointer hover:bg-gray-50 border-b border-border"
                  onClick={(e) => handleRowClick(transaction.bookingId, e)}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {formatFriendlyDate(transaction.eventDate)}
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-md text-gray-600">
                        {transaction.eventStartTime}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">{transaction.students.join(", ")}</td>
                  <td className="p-4">{transaction.teacher}</td>
                  <td className="p-4">{formatHours(transaction.duration / 60)}h</td>
                  <td className="p-4 font-medium">
                    €{transaction.revenue.toFixed(2)}
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-muted-foreground">
                    No transactions found
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