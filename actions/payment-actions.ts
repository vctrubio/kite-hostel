"use server";

import db from "@/drizzle";
import { Payment, Teacher } from "@/drizzle/migrations/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { toUTCString } from '@/components/formatters/TimeZone';

export async function getPaymentsWithTeacher() {
  try {
    const payments = await db.query.Payment.findMany({
      with: {
        teacher: true,
      },
    });
    return { data: payments, error: null };
  } catch (error: any) {
    console.error("Error fetching payments with teacher:", error);
    return { data: null, error: error.message };
  }
}

export async function createPayment(paymentData: {
  amount: number;
  teacher_id: string;
}) {
  try {
    const [newPayment] = await db.insert(Payment).values(paymentData).returning();
    revalidatePath("/payments");
    revalidatePath(`/teachers/${paymentData.teacher_id}`);
    return { success: true, payment: newPayment };
  } catch (error: any) {
    console.error("Error creating payment:", error);
    return { success: false, error: error.message };
  }
}

export async function updatePaymentAmount(paymentId: string, newAmount: number) {
  try {
    const [updatedPayment] = await db.update(Payment)
      .set({ amount: newAmount, updated_at: toUTCString(new Date()) })
      .where(eq(Payment.id, paymentId))
      .returning();

    revalidatePath("/payments");
    if (updatedPayment) {
      revalidatePath(`/teachers/${updatedPayment.teacher_id}`);
    }
    
    return { success: true, payment: updatedPayment };
  } catch (error: any) {
    console.error("Error updating payment amount:", error);
    return { success: false, error: error.message };
  }
}

export async function deletePayment(paymentId: string) {
  try {
    const [deletedPayment] = await db.delete(Payment).where(eq(Payment.id, paymentId)).returning();
    revalidatePath("/payments");
    if (deletedPayment) {
      revalidatePath(`/teachers/${deletedPayment.teacher_id}`);
    }
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting payment:", error);
    return { success: false, error: error.message };
  }
}