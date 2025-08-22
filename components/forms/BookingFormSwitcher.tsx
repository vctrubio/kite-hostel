"use client";

import React, { useState } from "react";
import { BookingIcon, HelmetIcon, BookmarkIcon } from "@/svgs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import MasterBookingForm from "./MasterBookingForm";
import { StudentForm } from "./StudentForm";
import { PackageForm } from "./PackageForm";
import { FormSummary } from "./FormSummary";
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

interface FormSwitcherProps {
  packages?: any[];
  students?: any[];
  userWallets?: any[];
  teachers?: any[];
  initialForm?: FormType;
}

export function BookingFormSwitcher({
  packages = [],
  students = [],
  userWallets = [],
  teachers = [],
  initialForm = 'booking'
}: FormSwitcherProps) {
  const [activeForm, setActiveForm] = useState<FormType>(initialForm);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const handleFormSwitch = (formType: FormType) => {
    setActiveForm(formType);
    setFormData({});
  };

  const handleFormReset = () => {
    setFormData({});
    // Additional reset logic for each form type
  };

  const isFormValid = () => {
    if (activeForm === 'student') {
      return formData.name && formData.name.trim() !== '' && formData.languages && formData.languages.length > 0;
    } else if (activeForm === 'package') {
      return formData.duration_hours > 0 && formData.price_per_student > 0 && formData.capacity_students > 0 && formData.capacity_kites > 0;
    } else if (activeForm === 'booking') {
      // Booking validation is handled by the BookingForm itself
      return true;
    }
    return false;
  };


  const ActiveFormComponent = FORM_CONFIGS.find(config => config.key === activeForm)?.component || MasterBookingForm;

  return (
    <div className="min-h-screen bg-background">
      <div className="lg:grid lg:grid-cols-5 lg:gap-6 max-w-7xl mx-auto">
        {/* Summary Sidebar */}
        <div className="lg:col-span-2 order-2 lg:order-1">
          <div className="lg:sticky lg:top-4 p-4">
            <FormSummary
              activeForm={activeForm}
              onFormSwitch={handleFormSwitch}
              onReset={handleFormReset}
              loading={loading}
              setLoading={setLoading}
              isFormValid={isFormValid()}
              summaryData={formData}
            >
              {/* Form-specific summary content will go here */}
              {activeForm === 'booking' && formData.package && (
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Package:</span>
                    <span>{formData.package.description}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Students:</span>
                    <span>{formData.students?.length || 0}</span>
                  </div>
                </div>
              )}
              {activeForm === 'student' && formData.name && (
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span>{formData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Languages:</span>
                    <span>{formData.languages?.length || 0}</span>
                  </div>
                </div>
              )}
              {activeForm === 'package' && formData.duration_hours && (
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span>{formData.duration_hours}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price:</span>
                    <span>€{formData.price_per_student}</span>
                  </div>
                </div>
              )}
            </FormSummary>
          </div>
        </div>

        {/* Form Content */}
        <div className="lg:col-span-3 order-1 lg:order-2">
          <div className="transition-opacity duration-200">
            {activeForm === 'booking' && (
              <MasterBookingForm
                packages={packages}
                students={students}
                userWallets={userWallets}
                teachers={teachers}
                onFormSwitch={handleFormSwitch}
                activeForm={activeForm}
              />
            )}
            {activeForm === 'student' && (
              <div className="bg-card">
                <div className="px-4 py-6 border-b border-border">
                  <h1 className="text-2xl font-semibold text-foreground">
                    Create New Student
                  </h1>
                </div>
                <div className="p-4">
                  <StudentForm onDataChange={setFormData} />
                </div>
              </div>
            )}
            {activeForm === 'package' && (
              <div className="bg-card">
                <div className="px-4 py-6 border-b border-border">
                  <h1 className="text-2xl font-semibold text-foreground">
                    Create New Package
                  </h1>
                </div>
                <div className="p-4">
                  <PackageForm onDataChange={setFormData} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}