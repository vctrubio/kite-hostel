"use client";

import { useState } from "react";
import { CreatedOrUpdated } from "@/components/formatters/CreatedOrUpdated";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { updatePaymentAmount, deletePayment } from "@/actions/payment-actions";

interface PaymentRowProps {
  payment: {
    id: string;
    amount: number;
    created_at: string;
    updated_at: string;
    teacher: { name: string };
  };
}

export function PaymentRow({ payment }: PaymentRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newAmount, setNewAmount] = useState(payment.amount);
  const [loading, setLoading] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
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
      setIsExpanded(false); // Collapse after saving
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
      <tr className="cursor-pointer hover:bg-gray-50" onClick={toggleExpand}>
        <td className="py-2 px-4 text-left border-b border-gray-200">
          <CreatedOrUpdated createdAt={payment.created_at} updatedAt={payment.updated_at} />
        </td>
        <td className="py-2 px-4 text-left border-b border-gray-200">{payment.teacher.name}</td>
        <td className="py-2 px-4 text-left border-b border-gray-200">{payment.amount}</td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={3} className="py-2 px-4 border-b border-gray-200">
            <div className="p-2 flex items-center justify-between space-x-2">
              <div className="flex items-center space-x-2">
                <label htmlFor="edit-amount" className="font-semibold">Edit Amount:</label>
                <Input
                  id="edit-amount"
                  type="number"
                  value={newAmount}
                  onChange={handleAmountChange}
                  className="w-32"
                  disabled={loading}
                />
                <Button onClick={handleSaveAmount} disabled={loading}>
                  {loading ? "Saving..." : "Save"}
                </Button>
              </div>
              <Button variant="destructive" onClick={handleDelete} disabled={loading}>
                {loading ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
