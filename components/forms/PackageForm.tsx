"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookmarkIcon } from "@/svgs/BookmarkIcon";
import { createPackage } from "@/actions/package-actions";

interface PackageFormData {
  duration_hours: number;
  description: string;
  price_per_student: number;
  capacity_students: number;
  capacity_kites: number;
}

// interface FormFieldDescriptor {
//     key: keyof PackageFormData;
//     label: string;
//     type: 'number' | 'text';
//     required: boolean;
//     placeholder?: string;
//     min?: number;
//     step?: number;
// }

// const _FORM_FIELDS: FormFieldDescriptor[] = [
//     { key: 'duration_hours', label: 'Duration (hours)', type: 'number', required: true, placeholder: '2', min: 1, step: 0.5 },
//     { key: 'price_per_student', label: 'Price per Student (€)', type: 'number', required: true, placeholder: '85', min: 1 },
//     { key: 'capacity_students', label: 'Student Capacity', type: 'number', required: true, placeholder: '4', min: 1 },
//     { key: 'capacity_kites', label: 'Kites Required', type: 'number', required: true, placeholder: '1', min: 1 },
// ] as const;

export function PackageForm({
    onSubmit
}: {
    onSubmit?: (data: any) => void;
}) {
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<PackageFormData>({
        duration_hours: 1,
        description: '',
        price_per_student: 0,
        capacity_students: 0,
        capacity_kites: 1,
    });
    
    const resetForm = () => {
        setFormData({
            duration_hours: 1,
            description: '',
            price_per_student: 0,
            capacity_students: 0,
            capacity_kites: 1,
        });
        setError(null);
    };

    // Check if form is ready to submit
    const isFormValid = () => {
        return formData.duration_hours > 0 && 
               formData.price_per_student > 0 && 
               formData.capacity_students > 0 &&
               formData.capacity_kites > 0;
    };

    const handleInputChange = (key: keyof PackageFormData, value: any) => {
        setFormData(prev => ({ 
            ...prev, 
            [key]: key === 'description' ? value : 
                   key === 'duration_hours' ? (parseFloat(value) || 0) :
                   (parseInt(value) || 0)
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
            // Convert hours to minutes for database storage
            const durationInMinutes = Math.round(formData.duration_hours * 60);
            
            const data = {
                duration: durationInMinutes,
                price_per_student: formData.price_per_student,
                capacity_students: formData.capacity_students,
                capacity_kites: formData.capacity_kites,
                description: formData.description || undefined,
            };

            console.log('Package data being submitted:', data);

            const result = await createPackage(data);
            if (!result.success) {
                throw new Error(result.error || 'Failed to create package');
            }

            toast.success(`Package created successfully!`, {
                description: `Duration: ${formData.duration_hours}h (${durationInMinutes}min) • €${data.price_per_student}/student • ${data.capacity_students} students`,
                duration: 4000,
            });
            resetForm();
            if (onSubmit) onSubmit(result.data);

        } catch (err: any) {
            console.error('Error creating package:', err);
            const errorMessage = err.message || "Failed to create package";
            setError(errorMessage);
            toast.error("Error Creating Package", { description: errorMessage });
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
                            <BookmarkIcon className="h-5 w-5 text-orange-500" />
                        </div>
                        <CardTitle className="text-xl">Create Package</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-4">
                        {error && (
                            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                                {error}
                            </div>
                        )}

                        {/* First Row: Duration, Price, Student Capacity, Kites */}
                        <div className="flex flex-wrap gap-4">
                            {/* Duration */}
                            <div className="w-36 flex flex-col gap-2">
                                <Label htmlFor="duration_hours" className="text-xs font-medium">
                                    Duration (hours)<span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="duration_hours"
                                    name="duration_hours"
                                    type="number"
                                    min="1"
                                    step="0.5"
                                    required
                                    disabled={isLoading}
                                    value={formData.duration_hours || ''}
                                    onChange={(e) => handleInputChange('duration_hours', e.target.value)}
                                    className="h-9 text-sm"
                                    placeholder="2"
                                />
                            </div>

                            {/* Price per Student */}
                            <div className="w-36 flex flex-col gap-2">
                                <Label htmlFor="price_per_student" className="text-xs font-medium">
                                    Price per Student (€)<span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="price_per_student"
                                    name="price_per_student"
                                    type="number"
                                    min="1"
                                    required
                                    disabled={isLoading}
                                    value={formData.price_per_student || ''}
                                    onChange={(e) => handleInputChange('price_per_student', e.target.value)}
                                    className="h-9 text-sm"
                                    placeholder="85"
                                />
                            </div>

                            {/* Student Capacity */}
                            <div className="w-32 flex flex-col gap-2">
                                <Label htmlFor="capacity_students" className="text-xs font-medium">
                                    Student Capacity<span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="capacity_students"
                                    name="capacity_students"
                                    type="number"
                                    min="1"
                                    required
                                    disabled={isLoading}
                                    value={formData.capacity_students || ''}
                                    onChange={(e) => handleInputChange('capacity_students', e.target.value)}
                                    className="h-9 text-sm"
                                    placeholder="4"
                                />
                            </div>

                            {/* Kites Required */}
                            <div className="w-28 flex flex-col gap-2">
                                <Label htmlFor="capacity_kites" className="text-xs font-medium">
                                    Kites Required<span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="capacity_kites"
                                    name="capacity_kites"
                                    type="number"
                                    min="1"
                                    required
                                    disabled={isLoading}
                                    value={formData.capacity_kites || ''}
                                    onChange={(e) => handleInputChange('capacity_kites', e.target.value)}
                                    className="h-9 text-sm"
                                    placeholder="1"
                                />
                            </div>

                            {/* Description */}
                            <div className="flex-1 min-w-[200px] flex flex-col gap-2">
                                <Label htmlFor="description" className="text-xs font-medium">
                                    Description
                                </Label>
                                <Input
                                    id="description"
                                    name="description"
                                    type="text"
                                    disabled={isLoading}
                                    value={formData.description || ''}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    className="h-9 text-sm"
                                    placeholder="e.g., Beginner lesson, Advanced course..."
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end pt-4 border-t border-border/50">
                            <Button
                                type="submit"
                                disabled={isLoading || !isFormValid()}
                                className="h-9 px-6 bg-orange-500 hover:bg-orange-600 text-white"
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                        Creating...
                                    </span>
                                ) : (
                                    '+ Create Package'
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}