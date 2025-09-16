"use client";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { InferSelectModel } from "drizzle-orm";
import {
  Lesson,
  Teacher,
  Event,
  Commission,
} from "@/drizzle/migrations/schema";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Send } from "lucide-react";
import { Duration } from "@/components/formatters/Duration";
import { getStatusColors, ENTITY_DATA } from "@/lib/constants";
import { EventCountWithDuration } from "@/getters/event-getters";
import { DropdownExpandableRow } from "./DropdownExpandableRow";
import { PackageDetails } from "@/getters/package-details";
import { KiteIcon } from "@/svgs";

interface LessonRowProps {
  data: InferSelectModel<typeof Lesson> & {
    teacher: InferSelectModel<typeof Teacher>;
    commission: InferSelectModel<typeof Commission> | null;
    events: InferSelectModel<typeof Event>[];
    totalEventHours: number;
    packageCapacity: number | null;
    packageDuration: number | null;
    booking?: {
      id: string;
      package?: {
        description: string | null;
        price_per_student: number | null;
        duration: number | null;
        capacity_students: number | null;
        capacity_kites: number | null;
      } | null;
      students?: Array<{
        student: {
          id: string;
          name: string;
        };
      }> | null;
    } | null;
  };
  expandedRow: string | null;
  setExpandedRow: (id: string | null) => void;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
}

export function LessonRow({
  data: lesson,
  expandedRow,
  setExpandedRow,
}: LessonRowProps) {
  const isExpanded = expandedRow === lesson.id;
  const router = useRouter();

  const toggleExpand = () => {
    if (isExpanded) {
      setExpandedRow(null);
    } else {
      setExpandedRow(lesson.id);
    }
  };

  // Calculate total event duration
  const totalEventMinutes = lesson.events.reduce(
    (sum, event) => sum + event.duration,
    0,
  );
  const eventCount = lesson.events.length;

  // Get students from booking
  const students = lesson.booking?.students?.map((bs) => bs.student.name) || [];

  // Get entities for colors
  const bookingEntity = ENTITY_DATA.find(entity => entity.name === "Booking");
  const packageEntity = ENTITY_DATA.find(entity => entity.name === "Package");
  const eventEntity = ENTITY_DATA.find(entity => entity.name === "Event");

  // Calculate expected total for package
  const expectedTotal = lesson.booking?.package && lesson.booking?.students
    ? lesson.booking.package.price_per_student * lesson.booking.students.length
    : 0;

  return (
    <>
      <tr className="border-b border-border">
        <td className="py-2 px-4 text-left">{lesson.teacher.name}</td>
        <td className="py-2 px-4 text-left">{`€${lesson.commission?.price_per_hour || 0}/h`}</td>
        <td className="py-2 px-4 text-left">
          {students.length > 0 ? students.join(", ") : "No students"}
        </td>
        <td className="py-2 px-4 text-left">
          <EventCountWithDuration 
            eventCount={eventCount}
            totalHours={totalEventMinutes / 60}
          />
        </td>
        <td className="py-2 px-4 text-left">
          <span
            className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColors(lesson.status as any)}`}
          >
            {lesson.status}
          </span>
        </td>
        <td className="py-2 px-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleExpand}
              className="h-8 w-8"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/lessons/${lesson.id}`);
              }}
              className="h-8 w-8"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </td>
      </tr>
      <DropdownExpandableRow
        isExpanded={isExpanded}
        colSpan={6}
        sections={[
          ...(lesson.booking ? [{
            title: "Booking Details",
            icon: bookingEntity?.icon,
            color: bookingEntity?.color || "text-blue-500",
            children: (
              <div className="space-y-3">
                <button
                  onClick={() => router.push(`/bookings/${lesson.booking?.id}`)}
                  className="w-full p-3 bg-background/30 rounded-md border border-border hover:bg-muted/50 transition-colors text-left"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Booking ID:</span>
                      <p className="font-medium text-blue-600 hover:underline">
                        {lesson.booking.id}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Start Date:</span>
                      <p className="font-medium">
                        {lesson.booking.date_start ? format(new Date(lesson.booking.date_start), "PPP") : "N/A"}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">End Date:</span>
                      <p className="font-medium">
                        {lesson.booking.date_end ? format(new Date(lesson.booking.date_end), "PPP") : "N/A"}
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            )
          }] : []),
          ...(lesson.booking?.package ? [{
            title: "Package Details",
            icon: packageEntity?.icon,
            color: packageEntity?.color || "text-orange-500",
            children: (
              <PackageDetails 
                packageData={lesson.booking.package}
                variant="simple"
                totalPrice={expectedTotal}
              />
            )
          }] : []),
          ...(lesson.events && lesson.events.length > 0 ? [{
            title: (
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {lesson.events.map((_, index) => (
                    <KiteIcon key={index} className="w-4 h-4" />
                  ))}
                </div>
                <span>Events</span>
              </div>
            ),
            color: eventEntity?.color || "text-teal-500",
            children: (
              <div className="space-y-3">
                {lesson.events.map((event) => (
                  <div
                    key={event.id}
                    className="p-3 bg-background/30 rounded-md border border-border"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">
                        {format(new Date(event.date), "PPP")}
                      </span>
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColors(event.status as any)}`}
                      >
                        {event.status}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {event.location} • <Duration minutes={event.duration} />
                    </div>
                  </div>
                ))}
              </div>
            )
          }] : [])
        ]}
      />
    </>
  );
}
