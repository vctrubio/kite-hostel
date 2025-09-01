"use client";

import { useState, useEffect, useMemo } from "react";
import WhiteboardMiniNav from "./WhiteboardMiniNav";
import WhiteboardBookings from "./WhiteboardBookings";
import WhiteboardLessons from "./WhiteboardLessons";
import WhiteboardEvents from "./WhiteboardEvents";
import { WhiteboardData } from "@/actions/whiteboard-actions";
import { WhiteboardClass } from "@/backend/WhiteboardClass";
import {
  createTeacherSchedulesFromLessons,
  calculateGlobalStats,
  getEarliestTimeFromSchedules,
} from "./WhiteboardMethods";
import {
  getStoredDate,
  setStoredDate,
  getTodayDateString,
} from "@/components/formatters/DateTime";
import {
  type BookingStatusFilter,
  LOCATION_ENUM_VALUES,
} from "@/lib/constants";
import {
  type EventController,
  type WhiteboardActionHandler,
} from "@/backend/types";
import { ShareUtils } from "@/backend/ShareUtils";
import { BookingIcon, HeadsetIcon, KiteIcon } from "@/svgs";

// The shape of the items that will be passed in for navigation
export interface NavItem {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly icon: React.ElementType | null;
  readonly color: string;
  readonly borderColor: string;
}

// Props for the MiniNav component, centralized here
export interface WhiteboardMiniNavProps {
  activeSection: string;
  onSectionClick: (sectionId: string) => void;
  selectedDate: string | null;
  onDateChange: (date: string) => void;
  bookingsCount: number;
  lessonsCount: number;
  eventsCount: number;
  bookingFilter: BookingStatusFilter;
  onBookingFilterChange: (filter: BookingStatusFilter) => void;
  onActionClick: WhiteboardActionHandler;
  globalStats: {
    totalEvents: number;
    totalLessons: number;
    totalHours: number;
    totalEarnings: number;
    schoolRevenue: number;
  };
  navItems: readonly NavItem[];
}

const STORAGE_KEY = "whiteboard-selected-date";
const CONTROLLER_STORAGE_KEY = "controller-settings";

const NAV_ITEMS = [
  {
    id: "bookings",
    name: "Bookings",
    description: "See all available bookings",
    icon: BookingIcon,
    color: "text-blue-500",
    borderColor: "border-blue-500",
  },
  {
    id: "lessons",
    name: "Lessons",
    description: "See all teachers with lessons",
    icon: HeadsetIcon,
    color: "text-green-500",
    borderColor: "border-green-500",
  },
  {
    id: "events",
    name: "Events",
    description: "See all ongoing lessons",
    icon: KiteIcon,
    color: "text-teal-500",
    borderColor: "border-teal-500",
  },
] as const;

interface WhiteboardClientProps {
  data: WhiteboardData;
}

export default function WhiteboardClient({ data }: WhiteboardClientProps) {
  const [activeSection, setActiveSection] = useState("bookings");
  const [selectedDate, setSelectedDate] = useState(() => getTodayDateString());

  const [bookingFilter, setBookingFilter] =
    useState<BookingStatusFilter>("all");

  const [controller, setController] = useState<EventController>(() => {
    const defaultSettings: EventController = {
      flag: false,
      location: LOCATION_ENUM_VALUES[0],
      submitTime: "11:00",
      durationCapOne: 120,
      durationCapTwo: 180,
      durationCapThree: 240,
    };

    if (typeof window === "undefined") {
      return defaultSettings;
    }

    try {
      const savedSettings = localStorage.getItem(CONTROLLER_STORAGE_KEY);
      if (savedSettings) {
        return { ...defaultSettings, ...JSON.parse(savedSettings) };
      }
    } catch (error) {
      console.error(
        "Failed to parse controller settings from localStorage",
        error,
      );
    }
    return defaultSettings;
  });

  useEffect(() => {
    try {
      const settingsToSave = {
        location: controller.location,
        submitTime: controller.submitTime,
        durationCapOne: controller.durationCapOne,
        durationCapTwo: controller.durationCapTwo,
        durationCapThree: controller.durationCapThree,
      };
      localStorage.setItem(
        CONTROLLER_STORAGE_KEY,
        JSON.stringify(settingsToSave),
      );
    } catch (error) {
      console.error(
        "Failed to save controller settings to localStorage",
        error,
      );
    }
  }, [controller]);

  const handleDateChange = (date: string) => {
    if (!date || isNaN(Date.parse(date))) {
      console.error("Invalid date provided to handleDateChange:", date);
      return;
    }
    setSelectedDate(date);
    setStoredDate(STORAGE_KEY, date);
  };

  const handleBookingFilterChange = (filter: BookingStatusFilter) => {
    setBookingFilter(filter);
  };

  const handleActionClick: WhiteboardActionHandler = async (actionId) => {
    try {
      const shareData = ShareUtils.extractShareData(
        selectedDate,
        filteredData.teacherSchedules,
        filteredData.events,
      );

      switch (actionId) {
        case "share":
          const whatsappMessage = ShareUtils.generateWhatsAppMessage(shareData);
          ShareUtils.shareToWhatsApp(whatsappMessage);
          break;
        case "medical":
          const { subject, body } = ShareUtils.generateMedicalEmail(
            selectedDate,
            filteredData.events,
          );
          ShareUtils.sendMedicalEmail(subject, body);
          break;
        case "csv":
          const csvData = ShareUtils.generateCSVData(shareData);
          const csvFilename = `tkh-${selectedDate}.csv`;
          ShareUtils.downloadCSV(csvData, csvFilename);
          break;
        case "print":
          await ShareUtils.downloadPrintTable(shareData);
          break;
        default:
          console.warn(`Unknown action: ${actionId}`);
      }
    } catch (error) {
      console.error(`Error executing ${actionId} action:`, error);
    }
  };

  useEffect(() => {
    const storedDate = getStoredDate(STORAGE_KEY);
    const isValidDate = storedDate && !isNaN(Date.parse(storedDate));

    if (isValidDate) {
      setSelectedDate(storedDate);
    } else {
      const today = getTodayDateString();
      setSelectedDate(today);
      setStoredDate(STORAGE_KEY, today);
    }
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash && NAV_ITEMS.some((section) => section.id === hash)) {
        setActiveSection(hash);
      }
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const filteredData = useMemo(() => {
    if (!selectedDate || isNaN(Date.parse(selectedDate))) {
      return {
        bookings: [],
        bookingClasses: [],
        events: [],
        teacherSchedules: new Map(),
        status: {
          totalBookings: 0,
          totalLessons: 0,
          totalEvents: 0,
        },
      };
    }

    const filterDate = new Date(selectedDate);
    filterDate.setHours(0, 0, 0, 0);

    const dateFilteredBookings = data.rawBookings.filter((booking) => {
      const bookingStart = new Date(booking.date_start);
      const bookingEnd = new Date(booking.date_end);
      bookingStart.setHours(0, 0, 0, 0);
      bookingEnd.setHours(23, 59, 59, 999);
      return filterDate >= bookingStart && filterDate <= bookingEnd;
    });

    const statusFilteredBookings =
      bookingFilter === "all"
        ? dateFilteredBookings
        : dateFilteredBookings.filter(
          (booking) => booking.status === bookingFilter,
        );

    const bookingClasses = statusFilteredBookings.map(
      (booking) => new WhiteboardClass(booking),
    );

    const filteredLessons = statusFilteredBookings.flatMap(
      (booking) =>
        booking.lessons?.map((lesson: any) => {
          const originalEvents = lesson.events || [];
          const eventsForSelectedDate =
            lesson.events?.filter((event: any) => {
              if (!event.date) return true;
              const eventDate = new Date(event.date);
              eventDate.setHours(0, 0, 0, 0);
              return eventDate.getTime() === filterDate.getTime();
            }) || [];

          return {
            ...lesson,
            originalEvents: originalEvents,
            events: eventsForSelectedDate,
            selectedDate: selectedDate,
            booking: booking,
          };
        }) || [],
    );

    const filteredEvents = filteredLessons.flatMap(
      (lesson) =>
        lesson.events?.map((event: any) => ({
          ...event,
          lesson: {
            id: lesson.id,
            teacher: lesson.teacher,
            status: lesson.status,
          },
          booking: lesson.booking,
        })) || [],
    );

    // Create teacher schedules using centralized utility function
    const teacherSchedules = createTeacherSchedulesFromLessons(
      filteredLessons,
      bookingClasses,
      selectedDate,
    );

    // Calculate stats from teacherSchedules instead of filtered lessons
    const enhancedStats = {
      totalBookings: statusFilteredBookings.length,
      totalLessons: Array.from(teacherSchedules.values()).reduce(
        (total, schedule) => total + schedule.lessons.length,
        0,
      ),
      totalEvents: filteredEvents.length,
    };

    return {
      bookings: statusFilteredBookings,
      bookingClasses,
      events: filteredEvents,
      teacherSchedules,
      status: enhancedStats,
    };
  }, [data, selectedDate, bookingFilter]);

  const globalStats = useMemo(() => {
    return calculateGlobalStats(filteredData.teacherSchedules);
  }, [filteredData.teacherSchedules]);

  const earliestTime = useMemo(() => {
    return (
      getEarliestTimeFromSchedules(filteredData.teacherSchedules) || "11:00"
    );
  }, [filteredData.teacherSchedules]);

  const [hasInitializedTime, setHasInitializedTime] = useState(false);

  useEffect(() => {
    if (
      !hasInitializedTime &&
      earliestTime &&
      controller.submitTime === "11:00"
    ) {
      setController((prev) => ({
        ...prev,
        submitTime: earliestTime,
      }));
      setHasInitializedTime(true);
    }
  }, [earliestTime, hasInitializedTime, controller.submitTime]);

  const handleSectionClick = (sectionId: string) => {
    setActiveSection(sectionId);
    window.location.hash = sectionId;
  };

  const miniNav = (
    <WhiteboardMiniNav
      activeSection={activeSection}
      onSectionClick={handleSectionClick}
      selectedDate={selectedDate}
      onDateChange={handleDateChange}
      bookingsCount={filteredData.bookings.length}
      lessonsCount={Array.from(filteredData.teacherSchedules.values()).reduce(
        (total, schedule) => total + schedule.lessons.length,
        0,
      )}
      eventsCount={filteredData.events.length}
      bookingFilter={bookingFilter}
      onBookingFilterChange={handleBookingFilterChange}
      onActionClick={handleActionClick}
      globalStats={globalStats}
      navItems={NAV_ITEMS}
    />
  );

  return (
    <div className="desktop:flex">
      {/* Sidebar: sticky top on mobile, sticky left on desktop */}
      <aside className="sticky top-0 z-20 p-2 bg-background/95 backdrop-blur-sm border-b border-border desktop:h-screen desktop:w-80 desktop:flex-shrink-0 desktop:p-4 desktop:bg-background desktop:backdrop-blur-none">
        <div className="desktop:sticky desktop:top-4">{miniNav}</div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow">
        <div className="p-4">
          <div className="w-full">
            {activeSection === "bookings" && (
              <WhiteboardBookings
                bookings={filteredData.bookings}
                bookingClasses={filteredData.bookingClasses}
                selectedDate={selectedDate}
                teacherSchedules={filteredData.teacherSchedules}
                controller={controller}
                teachers={data.teachers}
              />
            )}

            {activeSection === "lessons" && (
              <WhiteboardLessons
                selectedDate={selectedDate}
                teacherSchedules={filteredData.teacherSchedules}
                controller={controller}
                onControllerChange={setController}
              />
            )}

            {activeSection === "events" && (
              <WhiteboardEvents
                events={filteredData.events}
                selectedDate={selectedDate}
                teacherSchedules={filteredData.teacherSchedules}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
