"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaymentIcon } from "@/svgs";
import { ArrowUpDown, Plus } from "lucide-react";
import { toast } from "sonner";
import { createPayment } from "@/actions/payment-actions";

interface AddPaymentToTeacherProps {
  teacherId: string;
  teacherName: string;
  sortOrder: 'desc' | 'asc';
  onSortChange: (order: 'desc' | 'asc') => void;
  onPaymentCreated?: () => void;
}

export function AddPaymentToTeacher({ 
  teacherId, 
  teacherName, 
  sortOrder, 
  onSortChange, 
  onPaymentCreated 
}: AddPaymentToTeacherProps) {
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDisabled = isSubmitting || !amount;
  const buttonStyles = isDisabled 
    ? "bg-gray-200 text-gray-500 cursor-not-allowed hover:bg-gray-200"
    : "bg-amber-100 hover:bg-amber-200 text-black dark:bg-amber-100 dark:hover:bg-amber-200 dark:text-black";
  const sortButtonText = sortOrder === 'desc' ? 'Newest First' : 'Oldest First';

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createPayment({
        amount: parseFloat(amount),
        teacher_id: teacherId
      });

      if (result.success) {
        toast.success("Payment added successfully!");
        setAmount("");
        onPaymentCreated?.();
      } else {
        toast.error(result.error || "Failed to create payment");
      }
    } catch {
      toast.error("An error occurred while creating the payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center gap-2 sm:gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
      <div className="flex-grow relative">
        <PaymentIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-amber-500" />
        <Input
          type="number"
          min="1"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={`Pay ${teacherName} (€)`}
          className="pl-10 focus:border-amber-500 focus:ring-amber-500"
        />
      </div>
      <Button
        onClick={handleSubmit}
        disabled={isDisabled}
        className={`${buttonStyles} sm:whitespace-nowrap`}
        size="sm"
      >
        <span className="sm:hidden">
          <Plus className="w-4 h-4" />
        </span>
        <span className="hidden sm:inline">
          {isSubmitting ? 'Adding...' : 'Add Payment'}
        </span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onSortChange(sortOrder === 'desc' ? 'asc' : 'desc')}
        className="flex items-center gap-2"
      >
        <ArrowUpDown className="w-4 h-4" />
        <span className="hidden sm:inline">
          {sortButtonText}
        </span>
      </Button>
    </div>
  );
}