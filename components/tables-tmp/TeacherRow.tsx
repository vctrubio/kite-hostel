"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Send } from "lucide-react";
import { DateSince } from "@/components/formatters/DateSince";
import { Checkbox } from "@/components/ui/checkbox";

interface TeacherRowProps {
  data: any;
  expandedRow: string | null;
  setExpandedRow: (id: string | null) => void;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
}

export function TeacherRow({ data: teacher, expandedRow, setExpandedRow, isSelected, onSelect }: TeacherRowProps) {
  const isExpanded = expandedRow === teacher.id;
  const router = useRouter();

  const toggleExpand = () => {
    if (isExpanded) {
      setExpandedRow(null);
    } else {
      setExpandedRow(teacher.id);
    }
  };

  return (
    <>
      <tr className="border-b border-border">
        <td className="py-2 px-4 text-left"><DateSince dateString={teacher.created_at} /></td>
        <td className="py-2 px-4 text-left">{teacher.name}</td>
        <td className="py-2 px-4 text-left">{teacher.phone || 'N/A'}</td>
        <td className="py-2 px-4 text-left">{teacher.commissions?.length || 0}</td>
        <td className="py-2 px-4">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={toggleExpand}
              className="h-8 w-8"
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/teachers/${teacher.id}`);
              }}
              className="h-8 w-8"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={5} className="py-4 px-4 bg-background/30">
            <div className="w-full space-y-3">
              {/* Teacher Details */}
              <div className="flex items-center gap-4 w-full p-3 bg-background/50 rounded-md border-l-4 border-green-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                  <div>
                    <span className="text-sm text-muted-foreground">Languages: </span>
                    <span className="text-sm font-medium">{teacher.languages?.join(", ") || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Country: </span>
                    <span className="text-sm font-medium">{teacher.country || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Passport: </span>
                    <span className="text-sm font-medium">{teacher.passport_number || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Phone: </span>
                    <span className="text-sm font-medium">{teacher.phone || 'N/A'}</span>
                  </div>
                </div>
              </div>
              
              {/* Commissions Details */}
              {teacher.commissions && teacher.commissions.length > 0 && (
                <div className="p-3 bg-background/50 rounded-md border-l-4 border-blue-500">
                  <div className="text-sm text-muted-foreground mb-2">Commissions:</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {teacher.commissions.map((commission: any) => (
                      <div key={commission.id} className="text-sm font-medium">
                        €{commission.price_per_hour}/h {commission.desc && `- ${commission.desc}`}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
