/**
 * Centralized stats calculation for all dashboard entities
 * Single source of truth for entity statistics
 */

import React from "react";
import { calcBookingRevenue } from "@/backend/CalcBookingRevenue";
import { calcLessonStats } from "@/backend/CalcLessonStats";
import { LessonCountWithEvent } from "@/getters/lesson-formatters";
import { getUserWalletName } from "@/getters/user-wallet-getters";

interface Stat {
  description: string;
  value: number | string | React.ReactNode;
  subStats?: Array<{
    label: string;
    value: number | string | React.ReactNode;
  }>;
}

// Helper functions (moved from Dashboard.tsx)
const getStatusCounts = (data: any[], statuses: string[]) => {
  return statuses.map(
    (status) => data.filter((item) => item.status === status).length,
  );
};

const buildStat = (
  description: string,
  value: number | string,
  subStats: Array<{ label: string; value: number | string }>,
) => ({
  description,
  value,
  subStats,
});

const createSubStats = (labels: string[], values: (number | string)[]) => {
  return labels.map((label, index) => ({ label, value: values[index] }));
};

// Entity-specific helpers
const getStudentBookingCounts = (students: any[]) => {
  const withActiveBookings = students.filter((s) =>
    s.bookings?.some((b: any) => b.status === "active"),
  ).length;
  const withCompletedBookings = students.filter((s) =>
    s.bookings?.some((b: any) => b.status === "completed"),
  ).length;
  const withNoBookings = students.filter(
    (s) => !s.bookings || s.bookings.length === 0,
  ).length;

  return { withActiveBookings, withCompletedBookings, withNoBookings };
};

const getLocalityBreakdown = (students: any[]) => {
  const local = students.filter((s) => s.country === "Spain").length;
  const foreign = students.length - local;
  return { local, foreign };
};

const getTopTeachersByLessons = (lessons: any[]) => {
  const teacherStats = lessons.reduce(
    (acc, lesson) => {
      const teacherName = lesson.teacher?.name || "Unknown";
      if (!acc[teacherName]) {
        acc[teacherName] = { lessonCount: 0, eventCount: 0, totalEventMinutes: 0 };
      }
      acc[teacherName].lessonCount += 1;
      
      // Count events and calculate total duration for this lesson
      const eventCount = lesson.events.length;
      const totalEventMinutes = lesson.events.reduce(
        (sum, event) => sum + event.duration,
        0,
      );
      acc[teacherName].eventCount += eventCount;
      acc[teacherName].totalEventMinutes += totalEventMinutes;
      
      return acc;
    },
    {} as Record<string, { lessonCount: number; eventCount: number; totalEventMinutes: number }>,
  );

  return Object.entries(teacherStats)
    .sort(([, a], [, b]) => (b as any).lessonCount - (a as any).lessonCount)
    .map(([name, stats], index) => ({
      label: `${index + 1}. ${name}`,
      value: <LessonCountWithEvent 
        lessonCount={stats.lessonCount}
        eventCount={stats.eventCount}
        totalEventMinutes={stats.totalEventMinutes}
        showLesson={true}
      />,
    }));
};

/**
 * Get stats configuration for entity type
 * @param entityType The entity type (student, booking, lesson, teacher, package, event, reference, kite, payment)
 * @param data The filtered data to calculate stats from
 * @returns Array of stat objects or empty array if no stats for entity
 */
export function getDashboardStats(entityType: string, data: any[]): Stat[] {
  switch (entityType.toLowerCase()) {
    case "student":
      const totalStudents = data.length;
      const { local, foreign } = getLocalityBreakdown(data);
      const { withActiveBookings, withCompletedBookings, withNoBookings } =
        getStudentBookingCounts(data);

      return [
        buildStat(
          "Total Students",
          totalStudents,
          createSubStats(["Local (Spain)", "Foreign"], [local, foreign]),
        ),
        buildStat(
          "Active Bookings",
          withActiveBookings,
          createSubStats(
            ["Completed Bookings", "Students with No Bookings"],
            [withCompletedBookings, withNoBookings],
          ),
        ),
      ];

    case "booking":
      const totalBookings = data.length;
      const [activeBookings, completedBookings, uncompletedBookings] =
        getStatusCounts(data, ["active", "completed", "uncomplete"]);
      const revenueBreakdown = calcBookingRevenue(data);

      return [
        buildStat(
          "Total Bookings",
          totalBookings,
          createSubStats(
            ["Active", "Completed", "Uncompleted"],
            [activeBookings, completedBookings, uncompletedBookings],
          ),
        ),
        buildStat(
          "Total Revenue",
          `€${revenueBreakdown.moneyMade}`,
          createSubStats(
            ["Booked Revenue", "Teacher Earnings", "School Earnings"],
            [
              `€${revenueBreakdown.revenue}`,
              `€${revenueBreakdown.teacher}`,
              `€${revenueBreakdown.school}`,
            ],
          ),
        ),
      ];

    case "lesson":
      const topTeachers = getTopTeachersByLessons(data);
      const lessonStats = calcLessonStats(data);

      return [
        {
          description: "Lessons, Events, Hours",
          value: (
            <div className="text-2xl font-bold">
              <LessonCountWithEvent 
                lessons={data}
                showLesson={true}
              />
            </div>
          ),
          subStats: topTeachers.map((teacher) => ({
            label: teacher.label, // Keep the full label with ranking (1. Chantal, 2. Teacher 9113, etc.)
            value: teacher.value, // This is the LessonCountWithEvent component
          })),
        },
        {
          description: "Peak Hours", 
          value: (() => {
            // Calculate most popular start time
            const timeSlots = {};
            data.forEach(lesson => {
              lesson.events?.forEach(event => {
                if (event.date) {
                  const startTime = new Date(event.date).getHours();
                  const timeKey = `${startTime.toString().padStart(2, '0')}:00`;
                  timeSlots[timeKey] = (timeSlots[timeKey] || 0) + 1;
                }
              });
            });
            
            const mostPopular = Object.entries(timeSlots)
              .sort(([,a], [,b]) => (b as number) - (a as number))[0];
            
            return mostPopular ? mostPopular[0] : "N/A";
          })(),
          subStats: createSubStats(
            ["Private", "Semi-private", "Group"],
            [
              `${lessonStats.privateHours}h`,
              `${lessonStats.semiPrivate}h`,
              `${lessonStats.group}h`,
            ],
          ),
        },
      ];

    case "event":
      // No stats for events
      return [];

    case "kite":
      // No stats for kites
      return [];

    case "payment":
      const totalAmount = data.reduce((sum, p) => sum + p.amount, 0);

      // Calculate all teachers by payment amounts (no limit)
      const teacherPaymentCounts = data.reduce(
        (acc, payment) => {
          const teacherName = payment.teacher?.name || "Unknown";
          acc[teacherName] = (acc[teacherName] || 0) + payment.amount;
          return acc;
        },
        {} as Record<string, number>,
      );

      const allTeacherPayments = Object.entries(teacherPaymentCounts)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .map(([name, amount], index) => ({
          label: `${index + 1}. ${name}`,
          value: `€${amount}`,
        }));

      return [
        buildStat(
          "Total Payments Made",
          `€${totalAmount}`,
          allTeacherPayments,
        ),
      ];

    case "reference":
      // Calculate total revenue
      const totalReferenceRevenue = data.reduce(
        (sum, b) => sum + (b.packagePrice || 0),
        0,
      );

      // Calculate ranking by reference name using getUserWalletName
      const referenceRevenueCounts = data.reduce(
        (acc, booking) => {
          // Create a reference object for getUserWalletName (same as ReferenceBookingRow)
          const reference = {
            role: booking.role,
            note: booking.note,
            teacher: booking.teacherName ? { name: booking.teacherName } : null
          };
          
          const referenceName = getUserWalletName(reference);
          acc[referenceName] = (acc[referenceName] || 0) + (booking.packagePrice || 0);
          return acc;
        },
        {} as Record<string, number>,
      );

      const allReferenceRankings = Object.entries(referenceRevenueCounts)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .map(([name, revenue], index) => ({
          label: `${index + 1}. ${name}`,
          value: `€${revenue}`,
        }));

      return [
        buildStat(
          "Total Revenue",
          `€${totalReferenceRevenue}`,
          allReferenceRankings,
        ),
      ];

    case "teacher":
    case "package":
      // No stats for these entities
      return [];

    default:
      // Unknown entity type
      return [];
  }
}
