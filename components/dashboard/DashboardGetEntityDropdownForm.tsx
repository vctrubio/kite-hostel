"use client";

import Link from 'next/link';
import { StudentForm } from "@/components/forms/StudentForm";
import { TeacherForm } from "@/components/forms/TeacherForm";
import { PackageForm } from "@/components/forms/PackageForm";
import { PaymentForm } from "@/components/forms/PaymentForm";
import { KiteForm } from "@/components/forms/KiteForm";

// Wrapper for Lesson Form
function LessonForm() {
  return (
    <div className="p-4">
      <Link href="/lessons/form" className="text-blue-500 hover:underline">
        Go to Lesson Creation Page
      </Link>
    </div>
  );
}

// Wrapper for Event Form
function EventForm() {
  return (
    <div className="p-4">
      <Link href="/events/form" className="text-blue-500 hover:underline">
        Go to Event Creation Page
      </Link>
    </div>
  );
}

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
