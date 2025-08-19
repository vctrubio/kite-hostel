"use client";

import { useEffect, useState } from "react";
import { getEventCsv } from "@/actions/event-actions";
import { CSVLink } from "react-csv";
import { Button } from "@/components/ui/button";

export default function EventsPage() {
  const [eventData, setEventData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEventData() {
      const { data, error } = await getEventCsv();
      if (error) {
        setError(error);
      } else if (data) {
        setEventData(data);
      }
      setLoading(false);
    }
    fetchEventData();
  }, []);

  if (loading) {
    return <div className="container mx-auto p-4">Loading events...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4">Error: {error}</div>;
  }

  const headers = [
    { label: "Date", key: "date" },
    { label: "Teacher", key: "teacher" },
    { label: "Students", key: "students" },
    { label: "Location", key: "location" },
    { label: "Duration", key: "duration" },
    { label: "Kite", key: "kite" },
    { label: "Price Per Hour", key: "pricePerHour" },
    { label: "Commission Per Hour", key: "commissionPerHour" },
  ];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Events Overview</h1>
      <div className="flex justify-end mb-4 space-x-2">
        <CSVLink data={eventData} headers={headers} filename={"events.csv"}>
          <Button>Export CSV</Button>
        </CSVLink>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              {headers.map((header) => (
                <th key={header.key} className="py-2 px-4 border-b text-left">
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {eventData.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                {headers.map((header) => (
                  <td key={header.key} className="py-2 px-4 border-b">
                    {row[header.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
