import { getLessonById } from "@/actions/lesson-actions";
import { Duration } from "@/components/formatters/Duration";
import { DateSince } from "@/components/formatters/DateSince";
import { getEventStatusColor } from "@/lib/constants";
import { PackageDetails } from "@/getters/package-details";
import { LessonStatusLabel } from "@/components/label/LessonStatusLabel";
import { BookingStatusLabel } from "@/components/label/BookingStatusLabel";
import { EventCountWithDuration } from "@/getters/event-getters";
import { format } from "date-fns";
import Link from "next/link";
import {
  BookingIcon,
  HelmetIcon,
  KiteIcon,
  BookmarkIcon,
  FlagIcon
} from "@/svgs";

interface LessonDetailPageProps {
  params: { id: string };
}

// Shared card wrapper component
function Card({ title, icon: Icon, iconColor, children }: {
  title: string | React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card rounded-lg border border-border p-4 space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        {Icon && <Icon className={`w-5 h-5 ${iconColor}`} />}
        {typeof title === 'string' ? <span>{title}</span> : title}
      </h2>
      {children}
    </div>
  );
}

function BookingCard({ lesson }: { lesson: any }) {
  if (!lesson.booking) return null;

  return (
    <Card title="Booking" icon={BookingIcon} iconColor="text-blue-500">
      <Link 
        href={`/bookings/${lesson.booking.id}`}
        className="block p-3 rounded-md bg-background/50 hover:bg-muted/50 transition-colors"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground">Booking ID:</span>
            <p className="font-medium">{lesson.booking.id}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Reference:</span>
            <p className="font-medium">{lesson.booking.reference?.id || "NULL"}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Start Date:</span>
            <p className="font-medium">{format(new Date(lesson.booking.date_start), "PPP")}</p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-muted-foreground">End Date:</span>
              <p className="font-medium">{format(new Date(lesson.booking.date_end), "PPP")}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Status:</span>
              <BookingStatusLabel 
                bookingId={lesson.booking.id}
                currentStatus={lesson.booking.status}
              />
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">Created:</span>
            <span className="font-medium">
              <DateSince dateString={lesson.booking.created_at} />
            </span>
          </div>
        </div>
      </Link>
    </Card>
  );
}

function StudentsCard({ lesson }: { lesson: any }) {
  const students = lesson.booking?.students || [];

  return (
    <Card 
      title="Students" 
      icon={() => (
        <div className="flex items-center gap-1">
          {Array.from({ length: students.length }, (_, index) => (
            <HelmetIcon key={index} className="w-4 h-4 text-yellow-500" />
          ))}
        </div>
      )} 
      iconColor=""
    >
      <div className="flex flex-wrap gap-2">
        {students.length > 0 ? (
          students.map((bs: any) => (
            <Link
              key={bs.student.id}
              href={`/students/${bs.student.id}`}
              className="px-2 py-1 text-sm font-medium border border-yellow-500 rounded hover:bg-muted transition-colors"
            >
              {bs.student.name}
            </Link>
          ))
        ) : (
          <p className="text-muted-foreground">No students assigned</p>
        )}
      </div>
    </Card>
  );
}

function EventsCard({ lesson }: { lesson: any }) {
  const totalEventMinutes = lesson.events.reduce((sum: number, event: any) => sum + event.duration, 0);

  return (
    <Card 
      title={(
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {Array.from({ length: lesson.events.length }, (_, index) => (
                <KiteIcon key={index} className="w-4 h-4 text-teal-500" />
              ))}
            </div>
            <span>Events</span>
          </div>
          <EventCountWithDuration 
            eventCount={lesson.events.length}
            totalHours={totalEventMinutes / 60}
          />
        </div>
      )} 
      icon={() => <></>}
      iconColor=""
    >

      <div className="space-y-3">
        {lesson.events.length > 0 ? (
          lesson.events.map((event: any) => (
            <div key={event.id} className="p-3 bg-background/30 rounded-md border border-border">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">{format(new Date(event.date), "PPP")}</span>
                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getEventStatusColor(event.status as any)}`}>
                  {event.status}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                {event.location} • <Duration minutes={event.duration} />
              </div>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground">No events scheduled</p>
        )}
      </div>
    </Card>
  );
}

function LessonHeader({ lesson }: { lesson: any }) {
  return (
    <div className="col-span-full space-y-3">
      <div className="flex flex-wrap items-center gap-4">
        <FlagIcon className="w-8 h-8 text-cyan-500" />
        <h1 className="text-2xl font-bold">{lesson.teacher.name}</h1>
        {lesson.commission && (
          <span className="text-lg font-medium text-green-600">
            €{lesson.commission.price_per_hour}/h
          </span>
        )}
        <LessonStatusLabel 
          lessonId={lesson.id}
          currentStatus={lesson.status}
          lessonEvents={lesson.events}
        />
        <div className="text-sm text-muted-foreground ml-auto">
          <DateSince dateString={lesson.created_at} />
        </div>
      </div>
    </div>
  );
}

export default async function LessonDetailPage({ params }: LessonDetailPageProps) {
  const { id } = params;
  const { data: lesson, error } = await getLessonById(id);

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!lesson) {
    return <div className="text-gray-500">Lesson not found.</div>;
  }

  // Calculate expected total for package
  const expectedTotal = lesson.booking?.package && lesson.booking?.students
    ? lesson.booking.package.price_per_student * lesson.booking.students.length
    : 0;

  return (
    <div className="container mx-auto p-4">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Header Section */}
        <LessonHeader lesson={lesson} />

        {/* Left Column */}
        <div className="space-y-6">
          {/* Booking Section */}
          <BookingCard lesson={lesson} />

          {/* Students Section */}
          <StudentsCard lesson={lesson} />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Package Details Section */}
          {lesson.booking?.package && (
            <Card title="Package Details" icon={BookmarkIcon} iconColor="text-orange-500">
              <PackageDetails 
                packageData={lesson.booking.package}
                variant="simple"
                totalPrice={expectedTotal}
              />
            </Card>
          )}

          {/* Events Section */}
          <EventsCard lesson={lesson} />
        </div>
      </div>
    </div>
  );
}