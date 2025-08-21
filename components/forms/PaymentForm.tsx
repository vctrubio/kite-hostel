"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PaymentIcon } from "@/svgs/PaymentIcon";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createPayment } from "@/actions/payment-actions";

interface PaymentFormData {
  amount: number;
  teacher_id: string;
}

interface PaymentFormProps {
  teachers?: any[];
  onSubmit?: (data: any) => void;
}

export function PaymentForm({ teachers = [], onSubmit }: PaymentFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<PaymentFormData>({
    amount: 0,
    teacher_id: '',
  });

  const resetForm = () => {
    setFormData({
      amount: 0,
      teacher_id: '',
    });
    setError(null);
  };

  // Check if form is ready to submit
  const isFormValid = () => {
    return formData.amount > 0 && formData.teacher_id !== '';
  };

  const handleInputChange = (key: keyof PaymentFormData, value: any) => {
    setFormData(prev => ({ 
      ...prev, 
      [key]: key === 'amount' ? (parseInt(value) || 0) : value
    }));
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && event.shiftKey) {
      event.preventDefault();
      if (isFormValid()) {
        const form = event.currentTarget.closest('form');
        if (form) {
          form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        }
      }
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const data = {
        amount: formData.amount,
        teacher_id: formData.teacher_id,
      };

      console.log('Payment data being submitted:', data);

      const result = await createPayment(data);
      if (!result.success) {
        throw new Error(result.error || 'Failed to create payment');
      }

      const selectedTeacher = teachers.find(t => t.id === formData.teacher_id);
      toast.success(`Payment created successfully!`, {
        description: `€${data.amount} paid to ${selectedTeacher?.name || 'teacher'}`,
        duration: 4000,
      });
      resetForm();
      if (onSubmit) onSubmit(result.data);

    } catch (err: any) {
      console.error('Error creating payment:', err);
      const errorMessage = err.message || "Failed to create payment";
      setError(errorMessage);
      toast.error("Error Creating Payment", { description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full p-6">
      <Card className="w-full border-border/50 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center">
              <PaymentIcon className="h-5 w-5 text-amber-500" />
            </div>
            <CardTitle className="text-xl">Create Payment</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-4">
            {error && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}

            {/* First Row: Amount, Teacher */}
            <div className="flex flex-wrap gap-4">
              {/* Amount */}
              <div className="w-36 flex flex-col gap-2">
                <Label htmlFor="amount" className="text-xs font-medium">
                  Amount (€)<span className="text-red-500">*</span>
                </Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  min="1"
                  required
                  disabled={isLoading}
                  value={formData.amount || ''}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  className="h-9 text-sm"
                  placeholder="100"
                />
              </div>

              {/* Teacher Selection */}
              <div className="flex-1 min-w-[200px] flex flex-col gap-2">
                <Label htmlFor="teacher" className="text-xs font-medium">
                  Teacher<span className="text-red-500">*</span>
                </Label>
                <Select 
                  onValueChange={(value) => handleInputChange('teacher_id', value)} 
                  value={formData.teacher_id} 
                  disabled={isLoading}
                >
                  <SelectTrigger className="h-9">
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
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4 border-t border-border/50">
              <Button
                type="submit"
                disabled={isLoading || !isFormValid()}
                className="h-9 px-6 bg-amber-500 hover:bg-amber-600 text-white"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </span>
                ) : (
                  '+ Create Payment'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
