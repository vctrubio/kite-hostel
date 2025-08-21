"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreatedOrUpdated } from "@/components/formatters/CreatedOrUpdated";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Send } from "lucide-react";
import { updatePaymentAmount, deletePayment } from "@/actions/payment-actions";

interface PaymentRowProps {
  data: {
    id: string;
    amount: number;
    created_at: string;
    updated_at: string;
    teacher_id: string;
    teacher: { id: string; name: string };
  };
  expandedRow: string | null;
  setExpandedRow: (id: string | null) => void;
}

export function PaymentRow({ data: payment, expandedRow, setExpandedRow }: PaymentRowProps) {
  const isExpanded = expandedRow === payment.id;
  const router = useRouter();
  const [newAmount, setNewAmount] = useState(payment.amount);
  const [loading, setLoading] = useState(false);

  const toggleExpand = () => {
    if (isExpanded) {
      setExpandedRow(null);
    } else {
      setExpandedRow(payment.id);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewAmount(Number(e.target.value));
  };

  const handleSaveAmount = async () => {
    setLoading(true);
    if (isNaN(newAmount) || newAmount <= 0) {
      toast.error("Amount must be a positive number.");
      setLoading(false);
      return;
    }

    const result = await updatePaymentAmount(payment.id, newAmount);
    if (result.success) {
      toast.success("Payment amount updated successfully!");
      setExpandedRow(null); // Collapse after saving
    } else {
      toast.error(result.error || "Failed to update payment amount.");
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this payment?")) {
      setLoading(true);
      const result = await deletePayment(payment.id);
      if (result.success) {
        toast.success("Payment deleted successfully!");
      } else {
        toast.error(result.error || "Failed to delete payment.");
      }
      setLoading(false);
    }
  };

  return (
    <>
      <tr className="border-b border-border">
        <td className="py-2 px-4 text-left">
          <CreatedOrUpdated createdAt={payment.created_at} updatedAt={payment.updated_at} />
        </td>
        <td className="py-2 px-4 text-left">{payment.teacher.name}</td>
        <td className="py-2 px-4 text-left">€{payment.amount}</td>
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
                router.push(`/teachers/${payment.teacher.id}`);
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
          <td colSpan={4} className="py-4 px-4 bg-background/30">
            <div className="w-full space-y-3">
              {/* Payment Edit Details */}
              <div className="flex items-center gap-4 w-full p-3 bg-background/50 rounded-md border-l-4 border-amber-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                  <div className="flex flex-col gap-2">
                    <span className="text-sm text-muted-foreground">Edit Amount:</span>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={newAmount}
                        onChange={handleAmountChange}
                        className="w-32 h-9"
                        disabled={loading}
                        min="1"
                        placeholder="Amount"
                      />
                      <Button onClick={handleSaveAmount} disabled={loading} size="sm">
                        {loading ? "Saving..." : "Save"}
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-end">
                    <Button 
                      variant="destructive" 
                      onClick={handleDelete} 
                      disabled={loading}
                      size="sm"
                    >
                      {loading ? "Deleting..." : "Delete Payment"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
