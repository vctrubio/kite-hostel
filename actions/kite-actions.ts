"use server";

import db from "@/drizzle";
import { Kite, KiteEvent, Event, TeacherKite, Teacher } from "@/drizzle/migrations/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createKite(kiteData: {
  model: string;
  size: number;
  serial_id: string;
}) {
  try {
    const [newKite] = await db.insert(Kite).values(kiteData).returning();
    revalidatePath("/kites");
    return { success: true, kite: newKite };
  } catch (error: any) {
    console.error("Error creating kite:", error);
    return { success: false, error: error.message };
  }
}

export async function assignKiteToTeacher(teacherIds: string[], kiteId: string) {
  try {
    const assignmentsToCreate = [];
    const errors: string[] = [];

    for (const teacherId of teacherIds) {
      // Check if the assignment already exists
      const existingAssignment = await db.query.TeacherKite.findFirst({
        where: and(eq(TeacherKite.teacher_id, teacherId), eq(TeacherKite.kite_id, kiteId)),
      });

      if (existingAssignment) {
        errors.push(`Kite already assigned to teacher ${teacherId}.`);
      } else {
        assignmentsToCreate.push({
          teacher_id: teacherId,
          kite_id: kiteId,
        });
      }
    }

    if (assignmentsToCreate.length > 0) {
      await db.insert(TeacherKite).values(assignmentsToCreate);
    }

    revalidatePath("/kites");
    for (const teacherId of teacherIds) {
      revalidatePath(`/teachers/${teacherId}`);
    }

    if (errors.length > 0) {
      return { success: false, error: errors.join(" ") };
    } else {
      return { success: true };
    }
  } catch (error: any) {
    console.error("Error assigning kite to teacher:", error);
    return { success: false, error: error.message };
  }
}

export async function unassignKiteFromTeacher(teacherId: string, kiteId: string) {
  try {
    await db.delete(TeacherKite).where(and(eq(TeacherKite.teacher_id, teacherId), eq(TeacherKite.kite_id, kiteId)));
    revalidatePath("/kites");
    revalidatePath(`/teachers/${teacherId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Error unassigning kite from teacher:", error);
    return { success: false, error: error.message };
  }
}

export async function getKitesWithEvents() {
  try {
    const kites = await db.query.Kite.findMany({
      with: {
        events: {
          with: {
            event: true, // Fetch details of the associated event
          },
        },
        teachers: {
          with: {
            teacher: true, // Fetch details of the assigned teacher
          },
        },
      },
    });

    // Format the data to match the previous structure expected by KiteRow
    const formattedKites = kites.map(kite => ({
      id: kite.id,
      model: kite.model,
      size: kite.size,
      serial_id: kite.serial_id,
      created_at: kite.created_at,
      updated_at: kite.updated_at,
      events: kite.events.map(ke => ke.event).filter(Boolean).map(event => ({
        id: event.id,
        date: event.date,
        duration: event.duration,
        location: event.location,
      })), // Filter out nulls if any
      assignedTeachers: kite.teachers.map(tk => ({ id: tk.teacher.id, name: tk.teacher.name })), // Get all assigned teacher names and IDs
    }));

    return { data: formattedKites, error: null };
  } catch (error: any) {
    console.error("Error fetching kites with events:", error);
    return { data: null, error: error.message };
  }
}
