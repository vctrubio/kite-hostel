
"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Duration } from "@/components/formatters/Duration";
import { ElegantDate } from "@/components/formatters/DateTime";
import { DateSince } from "@/components/formatters/DateSince";
import { BookingStatusLabel } from "@/components/label/BookingStatusLabel";
import {
  BookmarkIcon,
  BookingIcon,
  HelmetIcon,
  HeadsetIcon,
  PackageIcon,
  TeacherIcon
} from "@/svgs";
import { Search, ArrowUpDown, Eye, EyeOff, TrendingUp, Users, DollarSign } from "lucide-react";

interface PackageDetailsProps {
  pkg: any;
}

// Component for displaying package specifications
function PackageSpecifications({ pkg }: { pkg: any }) {
  // Helper function to format hours without unnecessary decimals
  const formatHours = (hours: number) => {
    return hours % 1 === 0 ? hours.toString() : hours.toFixed(1);
  };
  // Calculate total revenue from all bookings
  const totalRevenue = pkg.bookings?.reduce((total: number, booking: any) => {
    return total + (pkg.price_per_student * booking.students?.length || 0);
  }, 0) || 0;

  // Calculate used hours across all bookings
  const usedHours = pkg.bookings?.reduce((total: number, booking: any) => {
    return total + (booking.lessons?.reduce((lessonTotal: number, lesson: any) => {
      return lessonTotal + (lesson.events?.reduce((eventTotal: number, event: any) => {
        return eventTotal + (event.duration || 0);
      }, 0) || 0);
    }, 0) || 0);
  }, 0) / 60 || 0;

  // Calculate total teacher commissions across all bookings
  const totalTeacherCommissions = pkg.bookings?.reduce((total: number, booking: any) => {
    return total + (booking.lessons?.reduce((lessonTotal: number, lesson: any) => {
      const eventHours = lesson.events?.reduce((sum: number, event: any) => sum + (event.duration || 0), 0) / 60 || 0;
      return lessonTotal + (eventHours * (lesson.commission?.price_per_hour || 0));
    }, 0) || 0);
  }, 0) || 0;

  // Calculate top references
  const referenceStats = useMemo(() => {
    const refMap = new Map();
    pkg.bookings?.forEach((booking: any) => {
      if (booking.reference?.teacher) {
        const teacherName = booking.reference.teacher.name;
        const current = refMap.get(teacherName) || { count: 0, revenue: 0 };
        refMap.set(teacherName, {
          count: current.count + 1,
          revenue: current.revenue + (pkg.price_per_student * booking.students?.length || 0)
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
        <div className="flex items-center gap-3 mb-4">
          <PackageIcon className="w-8 h-8 text-orange-500" />
          <h1 className="text-3xl font-bold">{pkg.description}</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Duration:</span>
              <span className="font-medium"><Duration minutes={pkg.duration} /></span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Used Hours:</span>
              <span className="font-medium">{formatHours(usedHours)}h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Price per Hour/Student:</span>
              <span className="font-medium">€{(pkg.price_per_student / (pkg.duration / 60)).toFixed(2)}</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Kite Capacity:</span>
              <span className="font-medium">{pkg.capacity_kites} kites / {pkg.capacity_students} students</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-border">
              <span className="text-muted-foreground">Total Revenue:</span>
              <span className="font-bold text-green-600">€{totalRevenue}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Package Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-2">
            <BookingIcon className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-muted-foreground">Total Bookings</span>
          </div>
          <p className="text-2xl font-bold mt-1">{pkg.bookingCount}</p>
        </div>
        
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-muted-foreground">Total to Pay</span>
          </div>
          <p className="text-2xl font-bold mt-1 text-orange-600">€{totalRevenue}</p>
        </div>
        
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-2">
            <HeadsetIcon className="w-5 h-5 text-green-500" />
            <span className="text-sm text-muted-foreground">Commissions</span>
          </div>
          <p className="text-2xl font-bold mt-1 text-green-600">€{totalTeacherCommissions.toFixed(0)}</p>
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
              <div key={ref.name} className="flex items-center justify-between p-2 bg-muted/20 rounded">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-100 px-2 py-1 rounded">
                    #{index + 1}
                  </span>
                  <span className="font-medium">{ref.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">€{ref.revenue}</p>
                  <p className="text-xs text-muted-foreground">{ref.count} booking{ref.count !== 1 ? 's' : ''}</p>
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
function BookingCard({ booking, pkg, compact }: { booking: any; pkg: any; compact: boolean }) {
  // Calculate expected revenue
  const expectedRevenue = pkg.price_per_student * (booking.students?.length || 0);
  
  // Calculate total teacher costs, event count, and total hours
  let totalTeacherCosts = 0;
  let totalEvents = 0;
  let totalHours = 0;
  
  // Sum all events from all lessons to get accurate totals
  booking.lessons?.forEach((lesson: any) => {
    if (lesson.events && lesson.events.length > 0) {
      lesson.events.forEach((event: any) => {
        totalEvents++;
        const eventHours = (event.duration || 0) / 60;
        totalHours += eventHours;
        totalTeacherCosts += eventHours * (lesson.commission?.price_per_hour || 0);
      });
    }
  });
  
  // Helper function to format hours without unnecessary decimals
  const formatHours = (hours: number) => {
    return hours % 1 === 0 ? hours.toString() : hours.toFixed(1);
  };
  
  const students = booking.students?.map((bs: any) => bs.student) || [];
  
  if (compact) {
    return (
      <div className="bg-card rounded-lg border border-border p-4 hover:shadow-sm transition-shadow">
        {/* Compact View: Students, Expected Revenue, and Total to Pay */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {Array.from({ length: students.length }, (_, index) => (
                <HelmetIcon key={index} className="w-4 h-4 text-yellow-500" />
              ))}
            </div>
            <span className="font-medium">
              {students.map((student: any) => `${student.name} ${student.last_name || ''}`).join(', ')}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Expected Revenue</p>
              <p className="font-semibold text-green-600">€{expectedRevenue}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Total to Pay</p>
              <p className="font-bold text-orange-600">€{totalTeacherCosts.toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        {/* Footer: Booking Icon + Period + Status */}
        <div className="flex items-center justify-between pt-2 border-t border-border text-sm">
          <div className="flex items-center gap-2">
            <BookingIcon className="w-4 h-4 text-blue-500" />
            <Link href={`/bookings/${booking.id}`} className="hover:underline text-muted-foreground">
              {booking.id.slice(0, 8)}
            </Link>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">
              <ElegantDate dateString={booking.date_start} /> - <ElegantDate dateString={booking.date_end} />
            </span>
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
            {students.map((student: any) => `${student.name} ${student.last_name || ''}`).join(', ')}
          </span>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Expected Revenue</p>
          <p className="font-semibold text-green-600">€{expectedRevenue}</p>
        </div>
      </div>
      
      {/* Second Row: Lessons with Teachers and Commissions */}
      {booking.lessons && booking.lessons.length > 0 && (
        <div className="space-y-2 mb-3">
          {booking.lessons.map((lesson: any) => {
            // Calculate total hours for this lesson across all its events
            let lessonHours = 0;
            if (lesson.events && lesson.events.length > 0) {
              lessonHours = lesson.events.reduce((sum: number, event: any) => sum + (event.duration || 0), 0) / 60;
            }
            const lessonCost = lessonHours * (lesson.commission?.price_per_hour || 0);
            
            return (
              <div key={lesson.id} className="flex items-center justify-between p-2 bg-muted/20 rounded text-sm">
                <div className="flex items-center gap-2">
                  <HeadsetIcon className="w-4 h-4 text-green-600" />
                  <span>{lesson.teacher?.name || 'Unknown Teacher'}</span>
                  <span className="text-muted-foreground">({formatHours(lessonHours)}h)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">€{lesson.commission?.price_per_hour || 0}/h</span>
                  <span className="font-semibold">€{lessonCost.toFixed(2)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Total Events and Total to Pay */}
      <div className="flex items-center justify-between mb-3 p-2 bg-orange-50 dark:bg-orange-900/20 rounded">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{totalEvents} event{totalEvents !== 1 ? 's' : ''}, {formatHours(totalHours)}h</span>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Total to Pay</p>
          <p className="font-bold text-orange-600">€{totalTeacherCosts.toFixed(2)}</p>
        </div>
      </div>
      
      {/* Footer: Booking Icon + Period + Status */}
      <div className="flex items-center justify-between pt-2 border-t border-border text-sm">
        <div className="flex items-center gap-2">
          <BookingIcon className="w-4 h-4 text-blue-500" />
          <Link href={`/bookings/${booking.id}`} className="hover:underline text-muted-foreground">
            {booking.id.slice(0, 8)}
          </Link>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground">
            <ElegantDate dateString={booking.date_start} /> - <ElegantDate dateString={booking.date_end} />
          </span>
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
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [studentSearch, setStudentSearch] = useState('');
  const [compactView, setCompactView] = useState(false);
  
  const filteredAndSortedBookings = useMemo(() => {
    // Filter by student name
    const filtered = bookings.filter((booking) => {
      if (!studentSearch.trim()) return true;
      
      return booking.students?.some((bookingStudent: any) => 
        bookingStudent.student?.name?.toLowerCase().includes(studentSearch.toLowerCase()) ||
        bookingStudent.student?.last_name?.toLowerCase().includes(studentSearch.toLowerCase())
      );
    });
    
    // Sort by creation date
    filtered.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
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
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            <ArrowUpDown className="w-4 h-4" />
            {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCompactView(!compactView)}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            {compactView ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            {compactView ? 'Expand' : 'Compact'}
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
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">No Results</h3>
          <p className="text-gray-600 dark:text-gray-400">No bookings found matching your search criteria.</p>
        </div>
      ) : (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 border-2 border-dashed border-gray-300 dark:border-gray-600">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">No Bookings</h3>
          <p className="text-gray-600 dark:text-gray-400">No bookings found for this package yet.</p>
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
