"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createCommission } from "@/actions/commission-actions";

interface CommissionFormProps {
  teacherId: string;
  onCommissionCreated?: (commissionId: string) => void;
}

export function CommissionForm({ teacherId, onCommissionCreated }: CommissionFormProps) {
  const [newCommissionRate, setNewCommissionRate] = useState<string>("");
  const [newCommissionDesc, setNewCommissionDesc] = useState<string>("");
  const [showNewCommissionForm, setShowNewCommissionForm] = useState(false);

  const handleCreateNewCommission = async () => {
    if (!teacherId) {
      toast.error("Teacher ID is missing.");
      return;
    }
    const rate = parseInt(newCommissionRate);
    if (isNaN(rate) || rate < 1 || rate >= 100) {
      toast.error("Commission rate must be a whole number between 1 and 99.");
      return;
    }

    const result = await createCommission({
      teacher_id: teacherId,
      price_per_hour: rate,
      desc: newCommissionDesc || null,
    });

    if (result.success) {
      if (onCommissionCreated && result.commission?.id) {
        onCommissionCreated(result.commission.id);
      }
      setNewCommissionRate("");
      setNewCommissionDesc("");
      setShowNewCommissionForm(false);
    } else {
      toast.error(result.error || "Failed to create new commission.");
    }
  };

  return (
    <div className="space-y-3">
      <Button
        variant="outline"
        onClick={() => setShowNewCommissionForm(!showNewCommissionForm)}
        className="w-full"
      >
        {showNewCommissionForm
          ? "Cancel New Commission"
          : "Create New Commission"}
      </Button>

      {showNewCommissionForm && (
        <div className="space-y-3 border p-4 rounded-lg">
          <h4 className="text-md font-semibold">New Commission</h4>
          <div>
            <Label htmlFor="new-commission-rate">Rate (€/hour)</Label>
            <Input
              id="new-commission-rate"
              type="number"
              step="1"
              value={newCommissionRate}
              onChange={(e) => setNewCommissionRate(e.target.value)}
              placeholder="e.g., 25"
            />
          </div>
          <div>
            <Label htmlFor="new-commission-desc">
              Description (Optional)
            </Label>
            <Input
              id="new-commission-desc"
              type="text"
              value={newCommissionDesc}
              onChange={(e) => setNewCommissionDesc(e.target.value)}
              placeholder="e.g., Summer Rate"
            />
          </div>
          <Button onClick={handleCreateNewCommission} className="w-full">
            Add Commission
          </Button>
        </div>
      )}
    </div>
  );
}
