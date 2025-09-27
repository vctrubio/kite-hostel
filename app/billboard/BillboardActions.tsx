"use client";

import { Share2Icon, StethoscopeIcon, PrinterIcon, FileTextIcon } from "@/svgs";
import { Database } from "lucide-react";

type BillboardAction = "share" | "medical" | "csv" | "xlsm" | "print";

interface BillboardActionsProps {
  onActionClick: (action: BillboardAction) => void;
}

export default function BillboardActions({ onActionClick }: BillboardActionsProps) {
  return (
    <div>
      <div className="flex justify-around items-center">
        <button onClick={() => onActionClick("share")} className="flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200 hover:bg-muted/50">
          <Share2Icon className="w-5 h-5 text-blue-500" />
          <span className="text-xs font-medium text-foreground">Share</span>
        </button>
        <button onClick={() => onActionClick("medical")} className="flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200 hover:bg-muted/50">
          <StethoscopeIcon className="w-5 h-5 text-red-500" />
          <span className="text-xs font-medium text-foreground">Medical</span>
        </button>
        <button onClick={() => onActionClick("csv")} className="flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200 hover:bg-muted/50">
          <FileTextIcon className="w-5 h-5 text-green-500" />
          <span className="text-xs font-medium text-foreground">CSV</span>
        </button>
        <button onClick={() => onActionClick("xlsm")} className="flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200 hover:bg-muted/50">
          <Database className="w-5 h-5 text-emerald-500" />
          <span className="text-xs font-medium text-foreground">XLSM</span>
        </button>
        <button onClick={() => onActionClick("print")} className="flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200 hover:bg-muted/50">
          <PrinterIcon className="w-5 h-5 text-gray-500" />
          <span className="text-xs font-medium text-foreground">Print</span>
        </button>
      </div>
    </div>
  );
}
