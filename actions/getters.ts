"use server";

import { createClient } from "@/lib/supabase/server";
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

export async function getStudentById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("student")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching student with ID ${id}:`, error);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function getStudents() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("student")
    .select("*");

  if (error) {
    console.error("Error fetching students:", error);
    return { data: [], error: error.message };
  }

  return { data: data || [], error: null };
}

export async function getTeachers() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("teacher")
    .select("*");

  if (error) {
    console.error("Error fetching teachers:", error);
    return { data: [], error: error.message };
  }

  return { data: data || [], error: null };
}

export async function getTeacherById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("teacher")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching teacher with ID ${id}:`, error);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function getPackages() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("package_student")
    .select("*");

  if (error) {
    console.error("Error fetching packages:", error);
    return { data: [], error: error.message };
  }

  return { data: data || [], error: null };
}

export async function getPackageById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("package_student")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching package with ID ${id}:`, error);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function getBookingCountByPackageId(packageId: string) {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("booking")
    .select("", { count: "exact" })
    .eq("package_id", packageId);

  if (error) {
    console.error(
      `Error fetching booking count for package with ID ${packageId}:`,
      error
    );
    return { count: 0, error: error.message };
  }

  return { count: count || 0, error: null };
}
