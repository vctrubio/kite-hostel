"use client";

import { StudentForm } from "@/components/forms/StudentForm";
import { TeacherForm } from "@/components/forms/TeacherForm";

export function getEntityDropdownForm(entityName: string) {
  const normalizedName = entityName.toLowerCase();
  
  switch (normalizedName) {
    case 'student':
      return StudentForm;
    case 'teacher':
      return TeacherForm;
    default:
      return null;
  }
}