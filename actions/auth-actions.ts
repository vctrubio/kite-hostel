"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function getUsers() {
  const supabaseAdmin = createAdminClient();

  const {
    data: { users },
    error,
  } = await supabaseAdmin.auth.admin.listUsers();

  if (error) {
    console.error("Error fetching users:", error);
    throw new Error("Failed to fetch users");
  }

  return users;
}
