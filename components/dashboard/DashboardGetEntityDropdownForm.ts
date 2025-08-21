"use client";

import { StudentForm } from "@/components/forms/StudentForm";
import { TeacherForm } from "@/components/forms/TeacherForm";
import { PackageForm } from "@/components/forms/PackageForm";
import { PaymentForm } from "@/components/forms/PaymentForm";
import { KiteForm } from "@/components/forms/KiteForm";
import { EventForm } from "@/components/forms/EventForm";
import { LessonForm } from "@/components/forms/LessonForm";

export function getEntityDropdownForm(entityName: string) {
  const normalizedName = entityName.toLowerCase();
  
  switch (normalizedName) {
    case 'student':
      return StudentForm;
    case 'teacher':
      return TeacherForm;
    case 'package':
      return PackageForm;
    case 'payment':
      return PaymentForm;
    case 'kite':
      return KiteForm;
    case 'event':
      return EventForm;
    case 'lesson':
      return LessonForm;
    default:
      return null;
  }
}