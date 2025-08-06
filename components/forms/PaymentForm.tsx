"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createPayment } from "@/actions/payment-actions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PaymentFormProps {
  teachers: any[];
}

export function PaymentForm({ teachers }: PaymentFormProps) {
  const [amount, setAmount] = useState<number | "">("");
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!amount || !selectedTeacherId) {
      toast.error("Please fill in all fields.");
      setLoading(false);
      return;
    }

    const result = await createPayment({
      amount: Number(amount),
      teacher_id: selectedTeacherId,
    });

    if (result.success) {
      toast.success("Payment created successfully!");
      setAmount("");
      setSelectedTeacherId(null);
    } else {
      toast.error(result.error || "Failed to create payment.");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col md:flex-row md:items-end space-y-2 md:space-y-0 md:space-x-2">
      <div className="grid gap-1 w-full md:w-auto">
        <Label htmlFor="amount">Amount (€)</Label>
        <Input
          id="amount"
          type="number"
          placeholder="e.g., 100"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          disabled={loading}
        />
      </div>
      <div className="grid gap-1 w-full md:w-auto">
        <Label htmlFor="teacher">Teacher</Label>
        <Select onValueChange={setSelectedTeacherId} value={selectedTeacherId || ""} disabled={loading}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a teacher" />
          </SelectTrigger>
          <SelectContent>
            {teachers.map((teacher) => (
              <SelectItem key={teacher.id} value={teacher.id}>
                {teacher.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create Payment"}
      </Button>
    </form>
  );
}
