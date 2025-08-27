"use client";

import {
  Share2Icon,
  StethoscopeIcon,
  FileTextIcon,
  PrinterIcon,
} from "@/svgs";
import type { WhiteboardActionHandler } from "@/backend/types";

const ACTION_BUTTONS = [
  {
    id: "share",
    label: "Share",
    icon: Share2Icon,
    title: "Share to WhatsApp",
  },
  {
    id: "medical",
    label: "Medical",
    icon: StethoscopeIcon,
    title: "Generate Medical Email",
  },
  {
    id: "csv",
    label: "CSV",
    icon: FileTextIcon,
    title: "Export CSV",
  },
  {
    id: "print",
    label: "Print",
    icon: PrinterIcon,
    title: "Print Lesson Plan",
  },
] as const;

interface WhiteboardActionsProps {
  onActionClick: WhiteboardActionHandler;
}

export default function WhiteboardActions({
  onActionClick,
}: WhiteboardActionsProps) {
  const handleActionClick = async (actionId: 'share' | 'medical' | 'csv' | 'print') => {
    try {
      await onActionClick(actionId);
    } catch (error) {
      console.error(`Error executing ${actionId} action:`, error);
    }
  };

  return (
    <div className="p-3 border-t border-border">
      <h3 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-2">
        <Share2Icon className="w-3 h-3" />
        Actions
      </h3>
      <div className="grid grid-cols-4 gap-1">
        {ACTION_BUTTONS.map((button) => {
          const IconComponent = button.icon;
          return (
            <button
              key={button.id}
              onClick={() => handleActionClick(button.id)}
              className="px-2 py-1 text-[10px] font-medium rounded transition-all duration-200 border border-transparent hover:border-gray-300 hover:bg-gray-50"
              title={button.title}
            >
              {button.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}