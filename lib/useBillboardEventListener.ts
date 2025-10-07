"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getBillboardData, type BillboardData } from "@/actions/billboard-actions";

interface UseBillboardEventListenerOptions {
  initialData: BillboardData;
}

export function useBillboardEventListener({ initialData }: UseBillboardEventListenerOptions) {
  const [billboardData, setBillboardData] = useState<BillboardData>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    // Function to refetch billboard data
    const refetchBillboardData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error } = await getBillboardData();
        if (error) {
          setError(error);
        } else if (data) {
          setBillboardData(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to refetch data");
      } finally {
        setIsLoading(false);
      }
    };

    // Subscribe to Event table changes
    const eventChannel = supabase
      .channel("billboard_event_changes")
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to all events (INSERT, UPDATE, DELETE)
          schema: "public",
          table: "event",
        },
        (payload) => {
          console.log("📡 Billboard: Event change detected", payload.eventType);
          refetchBillboardData();
        }
      )
      .subscribe();

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
          console.log("📡 Billboard: Booking change detected", payload.eventType);
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
          console.log("📡 Billboard: Lesson change detected", payload.eventType);
          refetchBillboardData();
        }
      )
      .subscribe();

    // Cleanup subscriptions
    return () => {
      supabase.removeChannel(eventChannel);
      supabase.removeChannel(bookingChannel);
      supabase.removeChannel(lessonChannel);
    };
  }, []);

  return {
    billboardData,
    isLoading,
    error,
  };
}
