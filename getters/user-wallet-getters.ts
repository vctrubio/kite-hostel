interface UserWalletReference {
  role: string;
  note?: string | null;
  teacher?: {
    name: string;
  } | null;
}

// Type definition for user wallet with additional computed fields
export interface UserWalletWithView {
  id: string;
  role: string;
  sk: string | null;
  pk: string | null;
  note: string | null;
  teacher_name: string | null;
  sk_email: string | null;
  sk_full_name: string | null;
  viewAs: string; // Computed field
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

/**
 * Returns the appropriate display name for a user wallet
 * - If role is "teacher" or "teacherAdmin": returns the linked teacher name
 * - Otherwise: returns the note
 */
export function getUserName(userWallet: {
  role: string;
  teacher_name: string | null;
  note: string | null;
}): string {
  if (userWallet.role === "teacher" || userWallet.role === "teacherAdmin") {
    return userWallet.teacher_name || "No teacher linked";
  }
  
  return userWallet.note || "No note";
}