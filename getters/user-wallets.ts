import { userRole } from "@/drizzle/migrations/schema";

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

