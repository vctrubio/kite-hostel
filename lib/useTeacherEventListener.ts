"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getTeacherPortalById, type TeacherPortalData } from "@/actions/teacher-actions";

interface UseTeacherEventListenerOptions {
  teacherId: string;
  initialData: TeacherPortalData;
}

export function useTeacherEventListener({ teacherId, initialData }: UseTeacherEventListenerOptions) {
  const [teacherData, setTeacherData] = useState<TeacherPortalData>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    // Function to refetch teacher data
    const refetchTeacherData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error } = await getTeacherPortalById(teacherId);
        if (error) {
          setError(error);
        } else if (data) {
          setTeacherData(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to refetch data");
      } finally {
        setIsLoading(false);
      }
    };

    // Subscribe to Event table changes
    const eventChannel = supabase
      .channel("teacher_event_changes")
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to all events (INSERT, UPDATE, DELETE)
          schema: "public",
          table: "event",
        },
        (payload) => {
          console.log("Event table change detected:", payload);
          refetchTeacherData();
        }
      )
      .subscribe();

    // Also listen to KiteEvent table changes since events depend on kites
    const kiteEventChannel = supabase
      .channel("teacher_kite_event_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public", 
          table: "kite_event",
        },
        (payload) => {
          console.log("KiteEvent table change detected:", payload);
          refetchTeacherData();
        }
      )
      .subscribe();

    // Also listen to Lesson table changes since events are linked to lessons
    const lessonChannel = supabase
      .channel("teacher_lesson_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "lesson",
        },
        (payload) => {
          console.log("Lesson table change detected:", payload);
          refetchTeacherData();
        }
      )
      .subscribe();

    // Cleanup subscriptions
    return () => {
      supabase.removeChannel(eventChannel);
      supabase.removeChannel(kiteEventChannel);
      supabase.removeChannel(lessonChannel);
    };
  }, [teacherId]);

  return {
    teacherData,
    isLoading,
    error,
  };
}