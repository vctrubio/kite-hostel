"use client";

import { Button } from "@/components/ui/button";
import { Clipboard, Share2 } from "lucide-react";
import { useState } from "react";

interface ReceiptProps {
  studentNames: string;
  packageHours: number;
  pricePerHour: number;
  totalKitedHours: number;
  totalPriceToPay: number;
  events: Array<{
    teacherName: string;
    date: string;
    time: string;
    duration: string;
    location: string;
  }>;
}

export function Receipt({
  studentNames,
  packageHours,
  pricePerHour,
  totalKitedHours,
  totalPriceToPay,
  events
}: ReceiptProps) {
  const [copied, setCopied] = useState(false);

  // Format the receipt text
  const getReceiptText = () => {
    const headerText = `
Students: ${studentNames}
Package Hours: ${packageHours % 1 === 0 ? Math.floor(packageHours) : packageHours.toFixed(1)}h
Price per Hour: €${pricePerHour.toFixed(2)}
Total Kited Hours: ${totalKitedHours % 1 === 0 ? Math.floor(totalKitedHours) : totalKitedHours.toFixed(1)}h
Total Price to Pay: €${totalPriceToPay.toFixed(2)}

*** RECEIPT ***`;

    const eventsText = events.map((event, index) => `
${index + 1}. ${event.teacherName}, ${event.date}, ${event.time}, ${event.duration}, ${event.location}`).join('');

    return `${headerText}${eventsText}`;
  };

  // Copy to clipboard function
  const copyToClipboard = () => {
    const text = getReceiptText();
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Share2 className="w-5 h-5 text-purple-500" />
          <span>Receipt</span>
        </h2>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
          onClick={copyToClipboard}
        >
          <Clipboard className="h-4 w-4" />
          {copied ? "Copied!" : "Copy to clipboard"}
        </Button>
      </div>

      <div className="bg-muted/50 rounded-md p-3 font-mono text-sm whitespace-pre-wrap">
        {getReceiptText()}
      </div>
    </div>
  );
}
