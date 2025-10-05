"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Duration } from "@/components/formatters/Duration";
import { ElegantDate } from "@/components/formatters/DateTime";
import { BookingStatusLabel } from "@/components/label/BookingStatusLabel";
import { getUserWalletName } from "@/getters/user-wallet-getters";
import { LessonCountWithEvent } from "@/getters/lesson-formatters";
import { deletePackage } from "@/actions/package-actions";
import { toast } from "sonner";
import {
  BookingIcon,
  HelmetIcon,
  HeadsetIcon,
  PackageIcon,
  TeacherIcon,
} from "@/svgs";
import {
  Search,
  ArrowUpDown,
  Eye,
  EyeOff,
  Euro,
  Trash2,
} from "lucide-react";

interface PackageDetailsProps {
  pkg: any;
}

// Utility functions for calculations and formatting
const formatHours = (hours: number) => {
  return hours % 1 === 0 ? hours.toString() : hours.toFixed(1);
};

const formatCurrency = (amount: number) => {
  return amount % 1 === 0 ? amount.toString() : amount.toFixed(2);
};

// Calculate total minutes from lessons (similar to lesson-formatters logic)
const calculateTotalMinutes = (lessons: any[]) => {
  return lessons.reduce((sum, lesson) => 
    sum + (lesson.events?.reduce((eventSum: number, event: any) => eventSum + (event.duration || 0), 0) || 0), 0
  );
};

const calculateBookingHours = (booking: any) => {
  return calculateTotalMinutes(booking.lessons || []) / 60;
};

const calculateTeacherCommissions = (bookings: any[]) => {
  return bookings.reduce((total: number, booking: any) => {
    return total + (booking.lessons?.reduce((lessonTotal: number, lesson: any) => {
      const eventMinutes = lesson.events?.reduce((sum: number, event: any) => sum + (event.duration || 0), 0) || 0;
      return lessonTotal + (eventMinutes / 60) * (lesson.commission?.price_per_hour || 0);
    }, 0) || 0);
  }, 0);
};

const calculateTotalUsedHours = (bookings: any[]) => {
  const allLessons = bookings.flatMap(booking => booking.lessons || []);
  return calculateTotalMinutes(allLessons) / 60;
};

const calculateTotalRevenue = (pkg: any) => {
  const pricePerHourPerStudent = pkg.price_per_student / (pkg.duration / 60);
  return pkg.bookings?.reduce((total: number, booking: any) => {
    const bookingHours = calculateBookingHours(booking);
    return total + (bookingHours * pricePerHourPerStudent * (booking.students?.length || 0));
  }, 0) || 0;
};

const calculateBookingRevenue = (booking: any, pkg: any) => {
  const bookingHours = calculateBookingHours(booking);
  const pricePerHourPerStudent = pkg.price_per_student / (pkg.duration / 60);
  return bookingHours * pricePerHourPerStudent * (booking.students?.length || 0);
};

// Component for delete package button
function DeletePackageButton({ packageId }: { packageId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this package? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deletePackage(packageId);
      
      if (result.success) {
        toast.success("Package deleted successfully!");
        router.push('/packages');
      } else {
        toast.error(result.error || "Failed to delete package");
      }
    } catch {
      toast.error("An error occurred while deleting the package");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDelete}
      disabled={isDeleting}
      className="border-2 border-red-300 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
    >
      <Trash2 className="w-4 h-4 mr-2" />
      {isDeleting ? 'Deleting...' : 'Delete Package'}
    </Button>
  );
}

// Component for displaying package specifications
function PackageSpecifications({ pkg }: { pkg: any }) {
  // Use utility functions for calculations
  const totalRevenue = calculateTotalRevenue(pkg);
  const usedHours = calculateTotalUsedHours(pkg.bookings || []);
  const totalTeacherCommissions = calculateTeacherCommissions(pkg.bookings || []);

  // Calculate top references
  const referenceStats = useMemo(() => {
    const refMap = new Map();
    pkg.bookings?.forEach((booking: any) => {
      if (booking.reference?.teacher) {
        const teacherName = booking.reference.teacher.name;
        const current = refMap.get(teacherName) || { count: 0, revenue: 0 };
        refMap.set(teacherName, {
          count: current.count + 1,
          revenue:
            current.revenue +
            (pkg.price_per_student * booking.students?.length || 0),
        });
      }
    });
    return Array.from(refMap.entries())
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 3);
  }, [pkg.bookings, pkg.price_per_student]);

  return (
    <div className="space-y-6">
      {/* Package Header */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <PackageIcon className="w-8 h-8 text-orange-500" />
            <h1 className="text-3xl font-bold">{pkg.description}</h1>
          </div>
          {pkg.bookingCount === 0 && (
            <DeletePackageButton packageId={pkg.id} />
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Duration:</span>
              <span className="font-medium">
                <Duration minutes={pkg.duration} />
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Price per Hour/Student:
              </span>
              <span className="font-medium">
                €{(pkg.price_per_student / (pkg.duration / 60)).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Package Price/Student:</span>
              <span className="font-medium">
                €{pkg.price_per_student}
              </span>
            </div>
            {pkg.capacity_students > 1 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Package Price:</span>
                <span className="font-medium">
                  €{pkg.price_per_student * pkg.capacity_students}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Capacity:</span>
              <span className="font-medium">
                {pkg.capacity_kites} kites / {pkg.capacity_students} students
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Used Hours:</span>
              <span className="font-medium">{formatHours(usedHours)}h</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-border">
              <span className="text-muted-foreground">Total Revenue:</span>
              <span className="font-bold text-green-600">€{formatCurrency(totalRevenue)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Package Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-2">
            <BookingIcon className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-muted-foreground">
              Total Bookings
            </span>
          </div>
          <p className="text-2xl font-bold mt-1">{pkg.bookingCount}</p>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-2">
            <Euro className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-muted-foreground">
              School Revenue
            </span>
          </div>
          <p className="text-2xl font-bold mt-1 text-orange-600">
            €{formatCurrency(totalRevenue - totalTeacherCommissions)}
          </p>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-2">
            <HeadsetIcon className="w-5 h-5 text-green-500" />
            <span className="text-sm text-muted-foreground">Commissions</span>
          </div>
          <p className="text-2xl font-bold mt-1 text-green-600">
            €{formatCurrency(totalTeacherCommissions)}
          </p>
        </div>
      </div>

      {/* Top References */}
      {referenceStats.length > 0 && (
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-2 mb-4">
            <TeacherIcon className="w-5 h-5 text-cyan-500" />
            <h3 className="text-xl font-semibold">Top References</h3>
          </div>
          <div className="space-y-3">
            {referenceStats.map((ref, index) => (
              <div
                key={ref.name}
                className="flex items-center justify-between p-2 bg-muted/20 rounded"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-100 px-2 py-1 rounded">
                    #{index + 1}
                  </span>
                  <span className="font-medium">{ref.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">€{ref.revenue}</p>
                  <p className="text-xs text-muted-foreground">
                    {ref.count} booking{ref.count !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Component for displaying booking card
function BookingCard({
  booking,
  pkg,
  compact,
}: {
  booking: any;
  pkg: any;
  compact: boolean;
}) {
  // Use utility functions for calculations
  const expectedRevenue = calculateBookingRevenue(booking, pkg);

  const students = booking.students?.map((bs: any) => bs.student) || [];

  if (compact) {
    return (
      <div className="bg-card rounded-lg border border-border p-4 hover:shadow-sm transition-shadow">
        {/* Compact View: Students and Expected Revenue only */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {Array.from({ length: students.length }, (_, index) => (
                <HelmetIcon key={index} className="w-4 h-4 text-yellow-500" />
              ))}
            </div>
            <span className="font-medium">
              {students
                .map(
                  (student: any) =>
                    `${student.name} ${student.last_name || ""}`,
                )
                .join(", ")}
            </span>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Revenue</p>
            <p className="font-semibold text-green-600">€{formatCurrency(expectedRevenue)}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border p-4 hover:shadow-sm transition-shadow">
      {/* First Row: Students and Expected Revenue */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {Array.from({ length: students.length }, (_, index) => (
              <HelmetIcon key={index} className="w-4 h-4 text-yellow-500" />
            ))}
          </div>
          <span className="font-medium">
            {students
              .map(
                (student: any) => `${student.name} ${student.last_name || ""}`,
              )
              .join(", ")}
          </span>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Revenue</p>
          <p className="font-semibold text-green-600">€{formatCurrency(expectedRevenue)}</p>
        </div>
      </div>

      {/* Second Row: Lessons with Teachers and Commissions */}
      {booking.lessons && booking.lessons.length > 0 && (
        <div className="space-y-2 mb-3">
          {booking.lessons.map((lesson: any) => {
            const eventMinutes = lesson.events?.reduce((sum: number, event: any) => sum + (event.duration || 0), 0) || 0;
            const lessonCost = (eventMinutes / 60) * (lesson.commission?.price_per_hour || 0);

            return (
              <div
                key={lesson.id}
                className="flex items-center justify-between p-2 bg-muted/20 rounded text-sm"
              >
                <div className="flex items-center gap-2">
                  <HeadsetIcon className="w-4 h-4 text-green-600" />
                  <span>{lesson.teacher?.name || "Unknown Teacher"}</span>
                  <LessonCountWithEvent 
                    lesson={lesson}
                    showLesson={false}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">
                    €{lesson.commission?.price_per_hour || 0}/h
                  </span>
                  <span className="font-semibold">
                    €{formatCurrency(lessonCost)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer: Booking Icon + Period + Status */}
      <div className="flex items-center justify-between pt-2 border-t border-border text-sm">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <BookingIcon className="w-4 h-4 text-blue-500" />
            <Link
              href={`/bookings/${booking.id}`}
              className="hover:underline text-muted-foreground"
            >
              {booking.id.slice(0, 8)}
            </Link>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">
              <ElegantDate dateString={booking.date_start} /> -{" "}
              <ElegantDate dateString={booking.date_end} />
            </span>
          </div>
          <div className="flex items-center gap-2 pl-6">
            <span className="text-xs text-muted-foreground">
              Reference: {getUserWalletName(booking.reference)}
            </span>
          </div>
        </div>
        <BookingStatusLabel
          bookingId={booking.id}
          currentStatus={booking.status}
          showDeleteOption={false}
        />
      </div>
    </div>
  );
}

// Component for displaying bookings list
function BookingsList({ bookings, pkg }: { bookings: any[]; pkg: any }) {
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [studentSearch, setStudentSearch] = useState("");
  const [compactView, setCompactView] = useState(false);

  const filteredAndSortedBookings = useMemo(() => {
    // Filter by student name
    const filtered = bookings.filter((booking) => {
      if (!studentSearch.trim()) return true;

      return booking.students?.some(
        (bookingStudent: any) =>
          bookingStudent.student?.name
            ?.toLowerCase()
            .includes(studentSearch.toLowerCase()) ||
          bookingStudent.student?.last_name
            ?.toLowerCase()
            .includes(studentSearch.toLowerCase()),
      );
    });

    // Sort by creation date
    filtered.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [bookings, studentSearch, sortOrder]);

  return (
    <div className="space-y-6">
      {/* Booking Controls */}
      {bookings.length > 0 && (
        <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by student name..."
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            <ArrowUpDown className="w-4 h-4" />
            {sortOrder === "desc" ? "Newest First" : "Oldest First"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCompactView(!compactView)}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            {compactView ? (
              <Eye className="w-4 h-4" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}
            {compactView ? "Expand" : "Compact"}
          </Button>
        </div>
      )}

      {/* Bookings List */}
      {filteredAndSortedBookings.length > 0 ? (
        <div className="space-y-4">
          {filteredAndSortedBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              pkg={pkg}
              compact={compactView}
            />
          ))}
        </div>
      ) : bookings.length > 0 ? (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 border-2 border-dashed border-gray-300 dark:border-gray-600">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            No Results
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            No bookings found matching your search criteria.
          </p>
        </div>
      ) : (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 border-2 border-dashed border-gray-300 dark:border-gray-600">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            No Bookings
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            No bookings found for this package yet.
          </p>
        </div>
      )}
    </div>
  );
}

export function PackageDetails({ pkg }: PackageDetailsProps) {
  if (!pkg) {
    return <div>Package not found.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column - Package Specifications */}
        <div>
          <PackageSpecifications pkg={pkg} />
        </div>

        {/* Right Column - Bookings List */}
        <div>
          <BookingsList bookings={pkg.bookings || []} pkg={pkg} />
        </div>
      </div>
    </div>
  );
}
