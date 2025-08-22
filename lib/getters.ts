interface UserWalletReference {
  role: string;
  note?: string | null;
  teacher?: {
    name: string;
  } | null;
}

/**
 * Get the display name for a user wallet reference
 * - If role is "reference", show the note
 * - If there's a teacher, show the teacher name
 * - Otherwise, show the role
 */
export function getUserWalletName(reference: UserWalletReference | null): string {
  if (!reference) {
    return 'N/A';
  }

  if (reference.role === 'reference' && reference.note) {
    return reference.note;
  }

  if (reference.teacher?.name) {
    return reference.teacher.name;
  }

  return reference.role || 'N/A';
}