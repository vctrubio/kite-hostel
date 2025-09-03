import { ExportButtons } from "@/components/export/ExportButtons";

interface ExportSectionProps {
  bookingId: string;
  bookingData: any;
  eventsData: any;
  receiptText: string;
}

export function ExportSection({ 
  bookingId, 
  bookingData, 
  eventsData,
  receiptText 
}: ExportSectionProps) {
  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <h2 className="text-xl font-semibold mb-4">Export & Share</h2>
      <ExportButtons
        bookingId={bookingId}
        bookingData={bookingData}
        eventsData={eventsData}
        receiptText={receiptText}
      />
    </div>
  );
}
