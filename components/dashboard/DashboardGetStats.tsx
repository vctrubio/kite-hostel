/**
 * Centralized stats calculation for all dashboard entities
 * Single source of truth for entity statistics
 */

import React from "react";
import { Clock } from "lucide-react";
import { calcBookingRevenue } from "@/backend/CalcBookingRevenue";
import { calcLessonStats } from "@/backend/CalcLessonStats";
import { LessonCountWithEvent } from "@/getters/lesson-formatters";
import { KiteIcon } from "@/svgs";

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
    .sort(([, a], [, b]) => b.lessonCount - a.lessonCount)
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
      const totalLessons = data.length;
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
              .sort(([,a], [,b]) => b - a)[0];
            
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
      const totalKites = data.length;
      const kitesWithTeachers = data.filter(
        (k) => k.assignedTeachers?.length > 0,
      ).length;
      const kitesUsedInEvents = data.filter((k) => k.events?.length > 0).length;
      const totalKiteEvents = data.reduce(
        (sum, k) => sum + (k.events?.length || 0),
        0,
      );
      const totalTeacherAssignments = data.reduce(
        (sum, k) => sum + (k.assignedTeachers?.length || 0),
        0,
      );

      return [
        buildStat(
          "Total Kites",
          totalKites,
          createSubStats(
            ["With Teachers", "Available"],
            [kitesWithTeachers, totalKites - kitesWithTeachers],
          ),
        ),
        buildStat(
          "Usage & Events",
          `${kitesUsedInEvents} used`,
          createSubStats(
            ["Total Events", "Teacher Assignments"],
            [totalKiteEvents, totalTeacherAssignments],
          ),
        ),
      ];

    case "payment":
      const totalPayments = data.length;
      const totalAmount = data.reduce((sum, p) => sum + p.amount, 0);

      // Calculate top 3 teachers by payment amounts
      const teacherPaymentCounts = data.reduce(
        (acc, payment) => {
          const teacherName = payment.teacher?.name || "Unknown";
          acc[teacherName] = (acc[teacherName] || 0) + payment.amount;
          return acc;
        },
        {} as Record<string, number>,
      );

      const top3TeacherPayments = Object.entries(teacherPaymentCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([name, amount], index) => ({
          label: `${index + 1}. ${name}`,
          value: `€${amount}`,
        }));

      const avgPayment =
        totalPayments > 0 ? Math.round(totalAmount / totalPayments) : 0;

      return [
        buildStat(
          "Total Payments Made",
          `€${totalAmount}`,
          createSubStats(
            ["Number of Payments", "Average Payment"],
            [totalPayments, `€${avgPayment}`],
          ),
        ),
        buildStat(
          "Top Teachers",
          top3TeacherPayments.length > 0
            ? top3TeacherPayments[0].label.split(". ")[1]
            : "None",
          top3TeacherPayments,
        ),
      ];

    case "reference":
      const totalReferenceBookings = data.length;
      const teacherBookings = data.filter((b) => b.role === "teacher").length;
      const referenceBookings = data.filter(
        (b) => b.role === "reference",
      ).length;
      const otherBookings = data.filter(
        (b) => b.role !== "teacher" && b.role !== "reference",
      ).length;

      // Calculate total revenue
      const totalReferenceRevenue = data.reduce(
        (sum, b) => sum + (b.packagePrice || 0),
        0,
      );
      const avgCapacity =
        totalReferenceBookings > 0
          ? Math.round(
              data.reduce((sum, b) => sum + (b.packageCapacity || 0), 0) /
                totalReferenceBookings,
            )
          : 0;

      return [
        buildStat(
          "Total Referenced Bookings",
          totalReferenceBookings,
          createSubStats(
            ["Teacher", "Reference", "Others"],
            [teacherBookings, referenceBookings, otherBookings],
          ),
        ),
        buildStat(
          "Revenue & Capacity",
          `€${totalReferenceRevenue}`,
          createSubStats(
            ["Avg Capacity", "Avg Revenue"],
            [
              `${avgCapacity} students`,
              totalReferenceBookings > 0
                ? `€${Math.round(totalReferenceRevenue / totalReferenceBookings)}`
                : "€0",
            ],
          ),
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
