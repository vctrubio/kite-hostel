import { getEventById } from "@/actions/event-actions";
import { Duration } from "@/components/formatters/Duration";
import { DateSince } from "@/components/formatters/DateSince";
import { PackageDetails } from "@/getters/package-details";
import { BookingStatusLabel } from "@/components/label/BookingStatusLabel";
import { EventStatusLabel } from "@/components/label/EventStatusLabel";
import { format } from "date-fns";
import Link from "next/link";
import {
  BookingIcon,
  HelmetIcon,
  KiteIcon,
  BookmarkIcon,
  FlagIcon,
  HeadsetIcon,
  EquipmentIcon
} from "@/svgs";

interface EventDetailPageProps {
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

function TeacherCard({ event }: { event: any }) {
  if (!event.teacher) return null;

  return (
    <Card title="Teacher" icon={HeadsetIcon} iconColor="text-green-500">
      <Link 
        href={`/teachers/${event.teacher.id}`}
        className="block p-3 rounded-md bg-background/50 hover:bg-muted/50 transition-colors"
      >
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div>
            <span className="text-muted-foreground">Name:</span>
            <p className="font-medium">{event.teacher.name}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Commission Rate:</span>
            <p className="font-medium text-green-600">
              €{event.commission_per_hour || 0}/h
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Time:</span>
            <p className="font-medium">{format(new Date(event.date), "HH:mm")}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Duration:</span>
            <p className="font-medium"><Duration minutes={event.duration} /></p>
          </div>
          <div>
            <span className="text-muted-foreground">Location:</span>
            <p className="font-medium">{event.location}</p>
          </div>
        </div>
      </Link>
    </Card>
  );
}

function LessonCard({ event }: { event: any }) {
  if (!event.lesson) return null;

  return (
    <Card title="Lesson" icon={FlagIcon} iconColor="text-cyan-500">
      <Link 
        href={`/lessons/${event.lesson.id}`}
        className="block p-3 rounded-md bg-background/50 hover:bg-muted/50 transition-colors"
      >
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div>
            <span className="text-muted-foreground">Lesson ID:</span>
            <p className="font-medium">{event.lesson.id}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Status:</span>
            <p className="font-medium">{event.lesson.status}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Created:</span>
            <span className="font-medium">
              <DateSince dateString={event.lesson?.created_at} />
            </span>
          </div>
        </div>
      </Link>
    </Card>
  );
}

function BookingCard({ event }: { event: any }) {
  if (!event.lesson?.booking) return null;

  const booking = event.lesson.booking;

  return (
    <Card title="Booking" icon={BookingIcon} iconColor="text-blue-500">
      <Link 
        href={`/bookings/${booking.id}`}
        className="block p-3 rounded-md bg-background/50 hover:bg-muted/50 transition-colors"
      >
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div>
            <span className="text-muted-foreground">Start Date:</span>
            <p className="font-medium">{format(new Date(booking.date_start), "PPP")}</p>
          </div>
          <div>
            <span className="text-muted-foreground">End Date:</span>
            <p className="font-medium">{format(new Date(booking.date_end), "PPP")}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Reference:</span>
            <p className="font-medium">{booking.reference_id || "NULL"}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Created:</span>
            <span className="font-medium">
              <DateSince dateString={booking?.created_at} />
            </span>
          </div>
          <div className="col-span-2 flex items-center gap-2">
            <span className="text-muted-foreground">Status:</span>
            <BookingStatusLabel 
              bookingId={booking.id}
              currentStatus={booking.status}
            />
          </div>
        </div>
      </Link>
    </Card>
  );
}

function StudentsCard({ event }: { event: any }) {
  const students = event.lesson?.booking?.students || [];

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
              {bs.student.name} {bs.student.last_name || ''}
            </Link>
          ))
        ) : (
          <p className="text-muted-foreground">No students assigned</p>
        )}
      </div>
    </Card>
  );
}

function EquipmentCard({ event }: { event: any }) {
  const kites = event.kites || [];

  return (
    <Card 
      title="Equipment" 
      icon={EquipmentIcon}
      iconColor="text-purple-500"
    >
      <div className="space-y-3">
        {kites.length > 0 ? (
          kites.map((kiteEvent: any) => (
            <div key={kiteEvent.kite.id} className="p-3 bg-background/30 rounded-md border border-border">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Model:</span>
                  <p className="font-medium">{kiteEvent.kite.model || "N/A"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Size:</span>
                  <p className="font-medium">{kiteEvent.kite.size ? `${kiteEvent.kite.size}m` : "N/A"}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Serial ID:</span>
                  <p className="font-medium">{kiteEvent.kite.serial_id || "N/A"}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground">No equipment assigned</p>
        )}
      </div>
    </Card>
  );
}

function EventHeader({ event }: { event: any }) {
  // Calculate total revenue for this event
  const calculateTotal = () => {
    if (event.lesson?.booking?.package?.price_per_student && event.lesson?.booking?.students && event.duration && event.lesson.booking.package?.duration) {
      const hours = event.duration / 60;
      const packageHours = event.lesson.booking.package.duration / 60;
      const pricePerHour = event.lesson.booking.package.price_per_student / packageHours;
      return Math.round(pricePerHour * hours * event.lesson.booking.students.length);
    }
    return 0;
  };

  const total = calculateTotal();

  return (
    <div className="col-span-full space-y-3">
      <div className="flex flex-wrap items-center gap-4">
        <KiteIcon className="w-8 h-8 text-teal-500" />
        <h1 className="text-2xl font-bold">{format(new Date(event.date), "PPP")}</h1>
        <span className="text-lg font-medium text-green-600">
          €{total}
        </span>
        <EventStatusLabel 
          eventId={event.id}
          currentStatus={event.status}
        />
        <div className="text-sm text-muted-foreground ml-auto">
          <DateSince dateString={event.created_at} />
        </div>
      </div>
    </div>
  );
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { id } = params;
  const { data: event, error } = await getEventById(id);

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!event) {
    return <div className="text-gray-500">Event not found.</div>;
  }

  // Calculate expected total for package
  const expectedTotal = event.lesson?.booking?.package && event.lesson?.booking?.students
    ? event.lesson.booking.package.price_per_student * event.lesson.booking.students.length
    : 0;

  return (
    <div className="container mx-auto p-4">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Header Section */}
        <EventHeader event={event} />

        {/* Left Column */}
        <div className="space-y-6">
          {/* Teacher Section */}
          <TeacherCard event={event} />

          {/* Lesson Section */}
          <LessonCard event={event} />

          {/* Booking Section */}
          <BookingCard event={event} />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Package Details Section */}
          {event.lesson?.booking?.package && (
            <Card title="Package Details" icon={BookmarkIcon} iconColor="text-orange-500">
              <PackageDetails 
                packageData={event.lesson.booking.package}
                variant="simple"
                totalPrice={expectedTotal}
              />
            </Card>
          )}

          {/* Students Section */}
          <StudentsCard event={event} />

          {/* Equipment Section */}
          <EquipmentCard event={event} />
        </div>
      </div>
    </div>
  );
}