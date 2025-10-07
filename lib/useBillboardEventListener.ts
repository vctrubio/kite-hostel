"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getBillboardData, type BillboardData } from "@/actions/billboard-actions";
import { toast } from "sonner";
import { createStudentCreatedToast, createBookingCreatedToast } from "@/components/toaster";

interface UseBillboardEventListenerOptions {
  initialData: BillboardData;
}

const TOAST_DURATION = 5000;

export function useBillboardEventListener({ initialData }: UseBillboardEventListenerOptions) {
  const [billboardData, setBillboardData] = useState<BillboardData>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    console.log("🚀 Billboard Listener: Initializing...");

    // Function to refetch billboard data
    const refetchBillboardData = async () => {
      console.log("🔄 Billboard: Refetching data...");
      setIsLoading(true);
      setError(null);
      try {
        const { data, error } = await getBillboardData();
        if (error) {
          console.error("❌ Billboard: Error refetching:", error);
          setError(error);
        } else if (data) {
          console.log("✅ Billboard: Data refetched successfully");
          console.log("📊 Bookings:", data.bookings.length, "| Lessons:", 
            data.bookings.reduce((sum, b) => sum + (b.lessons?.length || 0), 0)
          );
          setBillboardData(data);
        }
      } catch (err) {
        console.error("❌ Billboard: Exception during refetch:", err);
        setError(err instanceof Error ? err.message : "Failed to refetch data");
      } finally {
        setIsLoading(false);
      }
    };

    // Generic subscription handler
    const createSubscription = (
      channelName: string,
      tableName: string,
      eventType: "*" | "INSERT" | "UPDATE" | "DELETE",
      onPayload: (payload: any) => void
    ) => {
      return supabase
        .channel(channelName)
        .on(
          "postgres_changes" as any,
          {
            event: eventType,
            schema: "public",
            table: tableName,
          },
          onPayload
        )
        .subscribe();
    };

    // Subscribe to Event table changes
    const eventChannel = createSubscription(
      "billboard_event_changes",
      "event",
      "*",
      (payload) => {
        console.log("📡 Event:", payload.eventType);
        refetchBillboardData();
      }
    );

    // Listen to Booking table changes since billboard depends on bookings
    const bookingChannel = supabase
      .channel("billboard_booking_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "booking",
        },
        (payload) => {
          console.log("� Billboard: Booking change detected", payload.eventType, payload);
          
          // Show toast notification for new bookings
          if (payload.eventType === "INSERT" && payload.new) {
            const booking = payload.new as any;
            console.log("🎉 New booking created:", booking.id);
            
            toast.success(createBookingCreatedToast(booking.date_start, booking.date_end), {
              duration: TOAST_DURATION,
            });
          }
          
          refetchBillboardData();
        }
      )
      .subscribe();

    // Listen to Lesson table changes
    const lessonChannel = supabase
      .channel("billboard_lesson_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "lesson",
        },
        (payload) => {
          console.log("🎓 ========================================");
          console.log("🎓 LESSON CHANGE DETECTED!");
          console.log("🎓 Event Type:", payload.eventType);
          console.log("🎓 Payload:", JSON.stringify(payload, null, 2));
          if (payload.new) {
            console.log("🎓 New Lesson Data:", payload.new);
          }
          if (payload.old) {
            console.log("🎓 Old Lesson Data:", payload.old);
          }
          console.log("🎓 ========================================");
          refetchBillboardData();
        }
      )
      .subscribe((status) => {
        console.log("📡 Lesson Channel Subscription Status:", status);
      });

    // Listen to Student table changes for new student notifications
    const studentChannel = supabase
      .channel("billboard_student_changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT", // Only listen for new students
          schema: "public",
          table: "student",
        },
        (payload) => {
          console.log("📡 Billboard: New student created", payload);
          
          // Show toast notification for new student
          if (payload.new) {
            const student = payload.new as any;
            const fullName = `${student.name}${student.last_name ? ' ' + student.last_name : ''}`;
            const description = student.desc || student.description || '';
            
            console.log("🎉 Showing toast for new student:", fullName);
            
            toast.success(createStudentCreatedToast(fullName, description), {
              duration: TOAST_DURATION,
            });
          }
          
          refetchBillboardData();
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      console.log("🧹 Billboard: Cleaning up listeners...");
      [eventChannel, bookingChannel, lessonChannel, studentChannel].forEach(channel => 
        supabase.removeChannel(channel)
      );
    };
  }, []);

  return {
    billboardData,
    isLoading,
    error,
  };
}
