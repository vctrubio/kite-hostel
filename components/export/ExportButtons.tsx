"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useCallback } from "react";
import * as XLSX from "xlsx";
import { type ExportBookingData, type ExportEventData } from "@/actions/export-actions";

interface ExportActionsProps {
  bookingId: string;
  bookingData: ExportBookingData | null;
  eventsData: ExportEventData[];
  receiptText?: string;
}

export function ExportButtons({ 
  bookingId, 
  bookingData, 
  eventsData,
  receiptText
}: ExportActionsProps) {
  const exportBookingToXlsx = useCallback(() => {
    if (!bookingData) return;

    // Calculate progression and expected revenue
    const packageHours = bookingData.packageHours;
    const kitedHours = bookingData.kitedHours;
    const progressPercentage = packageHours > 0 ? (kitedHours / packageHours) * 100 : 0;
    const pricePerStudent = bookingData.pricePerStudent;
    const expectedStudentRevenue = pricePerStudent * (kitedHours / packageHours);

    // Create worksheet from booking data
    const worksheet = XLSX.utils.json_to_sheet([{
      "Booking ID": bookingData.id,
      "Start Date": bookingData.startDate,
      "End Date": bookingData.endDate,
      "Reference ID": bookingData.referenceId,
      "Students": bookingData.students,
      "Package Description": bookingData.packageDescription,
      "Package Capacity": bookingData.packageCapacity,
      "Package Kites": bookingData.packageKites,
      "Hours Completed": bookingData.kitedHours.toFixed(1),
      "Progress": `${progressPercentage.toFixed(1)}%`,
      "Price per Student": `€${bookingData.pricePerStudent}`,
      "Expected Student Revenue": `€${expectedStudentRevenue.toFixed(2)}`,
      "Total Revenue": `€${bookingData.totalRevenue}`,
      "Total Expected Revenue": `€${(expectedStudentRevenue * (bookingData.students.split(',').length)).toFixed(2)}`
    }]);

    // Set column widths
    const colWidths = [
      { wch: 40 }, // Booking ID
      { wch: 15 }, // Start Date
      { wch: 15 }, // End Date
      { wch: 40 }, // Reference ID
      { wch: 30 }, // Students
      { wch: 30 }, // Package Description
      { wch: 15 }, // Package Capacity
      { wch: 15 }, // Package Kites
      { wch: 15 }, // Hours Completed
      { wch: 15 }, // Progress
      { wch: 20 }, // Price per Student
      { wch: 20 }, // Expected Student Revenue
      { wch: 20 }, // Total Revenue
      { wch: 20 }  // Total Expected Revenue
    ];
    worksheet['!cols'] = colWidths;

    // Create workbook and add worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Booking Details");

    // Generate file name
    const fileName = `booking_${bookingId}_${new Date().toISOString().split('T')[0]}.xlsm`;

    // Export to file
    XLSX.writeFile(workbook, fileName);
  }, [bookingData, bookingId]);

  const exportEventsToXlsx = useCallback(() => {
    if (!eventsData || eventsData.length === 0) return;

    // Format the data for export
    const formattedData = eventsData.map(event => ({
      "Event ID": event.id,
      "Date": event.date,
      "Time": event.time,
      "Duration": event.duration,
      "Location": event.location,
      "Teacher": event.teacher,
      "Students": event.students,
      "Teacher Commission": `€${event.teacherCommission.toFixed(2)}`,
      "School Revenue": `€${event.schoolRevenue.toFixed(2)}`
    }));

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(formattedData);

    // Set column widths
    const colWidths = [
      { wch: 40 }, // Event ID
      { wch: 15 }, // Date
      { wch: 10 }, // Time
      { wch: 10 }, // Duration
      { wch: 15 }, // Location
      { wch: 20 }, // Teacher
      { wch: 30 }, // Students
      { wch: 20 }, // Teacher Commission
      { wch: 20 }  // School Revenue
    ];
    worksheet['!cols'] = colWidths;

    // Create workbook and add worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Kite Events");

    // Generate file name
    const fileName = `events_${bookingId}_${new Date().toISOString().split('T')[0]}.xlsm`;

    // Export to file
    XLSX.writeFile(workbook, fileName);
  }, [eventsData, bookingId]);
  
  // Share via WhatsApp function
  const shareViaWhatsApp = useCallback(() => {
    if (!receiptText) return;
    const text = encodeURIComponent(receiptText);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  }, [receiptText]);

  return (
    <div className="flex flex-wrap gap-2">
      <Button 
        variant="outline" 
        size="default" 
        className="flex items-center gap-1" 
        onClick={exportBookingToXlsx}
        disabled={!bookingData}
      >
        <Download className="h-4 w-4" />
        Booking to XLSM
      </Button>
      <Button 
        variant="outline" 
        size="default" 
        className="flex items-center gap-1" 
        onClick={exportEventsToXlsx}
        disabled={eventsData.length === 0}
      >
        <Download className="h-4 w-4" />
        Events to XLSM
      </Button>
      {receiptText && (
        <Button 
          variant="outline" 
          size="default" 
          className="flex items-center gap-1" 
          onClick={shareViaWhatsApp}
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.273-.101-.473-.15-.673.15-.197.295-.771.964-.944 1.162-.175.195-.349.21-.646.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.174-.3-.019-.465.13-.615.136-.135.301-.345.451-.523.146-.181.194-.301.297-.496.1-.21.049-.375-.025-.524-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.172-.015-.371-.015-.571-.015-.2 0-.523.074-.797.359-.273.3-1.045 1.02-1.045 2.475s1.07 2.865 1.219 3.075c.149.195 2.105 3.195 5.1 4.485.714.3 1.27.48 1.704.629.714.227 1.365.195 1.88.121.574-.091 1.767-.721 2.016-1.426.255-.705.255-1.29.18-1.425-.074-.135-.27-.21-.57-.345m-5.446 7.443h-.016c-1.77 0-3.524-.48-5.055-1.38l-.36-.214-3.75.975 1.005-3.645-.239-.375a9.869 9.869 0 0 1-1.516-5.26c0-5.445 4.455-9.885 9.942-9.885a9.865 9.865 0 0 1 7.022 2.91 9.788 9.788 0 0 1 2.896 6.994c-.004 5.444-4.46 9.885-9.935 9.885M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.334.101 11.893c0 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652a12.062 12.062 0 0 0 5.71 1.447h.006c6.585 0 11.946-5.336 11.949-11.896 0-3.176-1.24-6.165-3.495-8.411" />
          </svg>
          Share Receipt
        </Button>
      )}
    </div>
  );
}
