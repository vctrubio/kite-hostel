"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Fetches all rows from a specified Supabase table.
 * @param tableName The name of the table to query.
 * @returns A promise that resolves to an object containing the length, data, and any potential error.
 */
export async function getTableData(tableName: string) {
  const supabase = await createClient();

  const { data, error, count } = await supabase
    .from(tableName)
    .select("*", { count: "exact" });

  if (error) {
    console.error(`Error fetching table ${tableName}:`, error);
    return { len: 0, data: [], error: error.message };
  }

  return { len: count ?? 0, data: data || [], error: null };
}

export async function getUsers() {
  const supabaseAdmin = createAdminClient();

  const {
    data: { users },
    error,
  } = await supabaseAdmin.auth.admin.listUsers();ge

  if (error) {
    console.error("Error fetching users:", error);
    throw new Error("Failed to fetch users");
  }

  return users;
}