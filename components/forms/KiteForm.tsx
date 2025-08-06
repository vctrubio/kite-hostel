"use client";

import { useState } from "react";
import { createKite, assignKiteToTeacher } from "@/actions/kite-actions";
import { MultiSelect } from "@/components/ui/multi-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface KiteFormProps {
  teachers: any[];
}

export function KiteForm({ teachers }: KiteFormProps) {
  const [model, setModel] = useState("");
  const [size, setSize] = useState<number | "">("");
  const [serialId, setSerialId] = useState("");
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!model || !size || !serialId) {
      toast.error("Please fill in all fields.");
      setLoading(false);
      return;
    }

    const numericSize = Number(size);
    if (isNaN(numericSize) || numericSize <= 1 || numericSize >= 20) {
      toast.error("Kite size must be between 1 and 20 (exclusive).");
      setLoading(false);
      return;
    }

    const result = await createKite({
      model,
      size: Number(size),
      serial_id: serialId,
    });

    if (result.success) {
      toast.success("Kite created successfully!");
      if (selectedTeacherIds.length > 0 && result.kite?.id) {
        const assignResult = await assignKiteToTeacher(
          selectedTeacherIds,
          result.kite.id,
        );
        if (assignResult.success) {
          toast.success("Kite assigned to teacher successfully!");
        } else {
          toast.error(
            assignResult.error || "Failed to assign kite to teacher.",
          );
        }
      }
      setModel("");
      setSize("");
      setSerialId("");
      setSelectedTeacherIds([]);
    } else {
      toast.error(result.error || "Failed to create kite.");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col md:flex-row md:items-end space-y-2 md:space-y-0 md:space-x-2">
      <div className="grid gap-1 w-full md:w-auto">
        <Label htmlFor="model">Model</Label>
        <Input
          id="model"
          placeholder="e.g., Rebel"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          disabled={loading}
        />
      </div>
      <div className="grid gap-1 w-full md:w-auto">
        <Label htmlFor="size">Size (m)</Label>
        <Input
          id="size"
          type="number"
          placeholder="e.g., 9"
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
          disabled={loading}
        />
      </div>
      <div className="grid gap-1 w-full md:w-auto">
        <Label htmlFor="serialId">Serial ID</Label>
        <Input
          id="serialId"
          placeholder="e.g., ABC123XYZ"
          value={serialId}
          onChange={(e) => setSerialId(e.target.value)}
          disabled={loading}
        />
      </div>
      <div className="grid gap-1 w-full md:w-auto">
        <Label htmlFor="teacher">Assign to Teacher</Label>
        <MultiSelect
          options={teachers.map((teacher) => ({
            label: teacher.name,
            value: teacher.id,
          }))}
          selected={selectedTeacherIds}
          onValueChange={setSelectedTeacherIds}
          placeholder="Select teachers"
          disabled={loading}
          className="w-[180px]"
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create Kite"}
      </Button>
    </form>
  );
}
