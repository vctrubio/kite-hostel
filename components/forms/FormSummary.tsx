"use client";

import React from "react";
import { BookingIcon, HelmetIcon, BookmarkIcon } from "@/svgs";
import { Button } from "@/components/ui/button";
import { createStudent } from "@/actions/student-actions";
import { createPackage } from "@/actions/package-actions";
import { toast } from "sonner";

type FormType = 'booking' | 'student' | 'package';

interface FormConfig {
  key: FormType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}

const FORM_CONFIGS: FormConfig[] = [
  {
    key: 'booking',
    label: 'Booking',
    icon: BookingIcon,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500',
  },
  {
    key: 'student',
    label: 'Student', 
    icon: HelmetIcon,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500',
  },
  {
    key: 'package',
    label: 'Package',
    icon: BookmarkIcon,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500',
  },
];

interface FormSummaryProps {
  activeForm: FormType;
  onFormSwitch: (formType: FormType) => void;
  onSubmit?: () => void;
  onReset: () => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  isFormValid: boolean;
  summaryData?: any;
  children?: React.ReactNode;
}

export function FormSummary({
  activeForm,
  onFormSwitch,
  onSubmit,
  onReset,
  loading,
  setLoading,
  isFormValid,
  summaryData,
  children,
}: FormSummaryProps) {
  const activeConfig = FORM_CONFIGS.find(config => config.key === activeForm);
  
  const handleSubmit = async () => {
    if (onSubmit) {
      onSubmit();
      return;
    }
    
    setLoading(true);
    try {
      if (activeForm === 'student') {
        const result = await createStudent({
          name: summaryData.name,
          passport_number: summaryData.passport_number || null,
          country: summaryData.country || null,
          phone: summaryData.phone || null,
          size: summaryData.size || null,
          desc: summaryData.desc || null,
          languages: summaryData.languages || [],
        });
        if (!result.success) {
          throw new Error(result.error || 'Failed to create student');
        }
        toast.success(`Student "${summaryData.name}" created successfully!`);
      } else if (activeForm === 'package') {
        const durationInMinutes = Math.round(summaryData.duration_hours * 60);
        const result = await createPackage({
          duration: durationInMinutes,
          price_per_student: summaryData.price_per_student,
          capacity_students: summaryData.capacity_students,
          capacity_kites: summaryData.capacity_kites,
          description: summaryData.description || undefined,
        });
        if (!result.success) {
          throw new Error(result.error || 'Failed to create package');
        }
        toast.success('Package created successfully!');
      }
      onReset();
    } catch (error: any) {
      toast.error(`Error creating ${activeForm}: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-card border border-border rounded-lg shadow-sm sticky top-4 z-10">
      <div className="px-4 py-3 border-b border-border">
        {/* Form Type Switcher */}
        <div className="flex items-center justify-center gap-1 mb-3">
          {FORM_CONFIGS.map((config) => {
            const Icon = config.icon;
            const isActive = activeForm === config.key;
            
            return (
              <Button
                key={config.key}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => onFormSwitch(config.key)}
                className={`flex items-center gap-1.5 transition-all duration-200 text-xs px-2 py-1 h-7 ${
                  isActive 
                    ? `${config.bgColor} text-white shadow-md hover:${config.bgColor}/90` 
                    : 'hover:bg-muted'
                }`}
              >
                <Icon className={`w-3 h-3 ${isActive ? 'text-white' : config.color}`} />
                {config.label}
              </Button>
            );
          })}
        </div>
        
        <h2 className="text-lg font-semibold text-foreground">
          {activeConfig?.label} Summary
        </h2>
      </div>
      
      <div className="p-4 space-y-4">
        {/* Dynamic Summary Content */}
        {children}
        
        {/* Summary Data Display */}
        {summaryData && (
          <div className="space-y-2 text-sm">
            {Object.entries(summaryData).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-muted-foreground capitalize">{key.replace('_', ' ')}:</span>
                <span className="text-foreground">{String(value)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="p-4 border-t border-border space-y-2">
        <button
          onClick={handleSubmit}
          disabled={loading || !isFormValid}
          className={`w-full py-2 px-4 rounded-md font-medium text-sm transition-colors flex items-center justify-center gap-2 ${
            activeConfig?.bgColor || 'bg-blue-500'
          } text-white hover:opacity-90 disabled:bg-gray-300 disabled:cursor-not-allowed`}
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              Creating...
            </>
          ) : (
            `Create ${activeConfig?.label}`
          )}
        </button>
        
        <button
          onClick={onReset}
          disabled={loading}
          className="w-full py-2 px-4 rounded-md font-medium text-sm text-muted-foreground border border-border hover:bg-muted transition-colors disabled:opacity-50"
        >
          Reset Form
        </button>
      </div>
    </div>
  );
}