"use client";

import { useState } from "react";
import { createKite, assignKiteToTeacher } from "@/actions/kite-actions";
import { MultiSelect } from "@/components/ui/multi-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { EquipmentIcon } from "@/svgs";
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <Card>
      <div className="w-full p-6">
        <div className="flex items-center gap-3 mb-6">
          <EquipmentIcon className="h-6 w-6 text-purple-500" />
          <h2 className="text-lg font-semibold">Add New Kite</h2>
        </div>
        
        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                placeholder="e.g., Rebel"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                disabled={loading}
                className="w-full"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="size">Size (m)</Label>
              <Input
                id="size"
                type="number"
                placeholder="e.g., 9"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                disabled={loading}
                className="w-full"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="serialId">Serial ID</Label>
              <Input
                id="serialId"
                placeholder="e.g., ABC123XYZ"
                value={serialId}
                onChange={(e) => setSerialId(e.target.value)}
                disabled={loading}
                className="w-full"
              />
            </div>
            
            <div className="grid gap-2">
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
                className="w-full"
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={loading || !model || !size || !serialId}
              className="h-9 px-6 bg-purple-500 hover:bg-purple-600 text-white"
            >
              {loading ? "Creating..." : "Create Kite"}
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
}
