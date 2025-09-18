"use client";

import {
  HelmetIcon,
  HeadsetIcon,
  BookingIcon,
  KiteIcon,
  PaymentIcon,
  BookIcon,
  CalendarIcon,
  FlagIcon,
  EquipmentIcon,
  BookmarkIcon,
  UsersIcon,
} from "@/svgs";
import { BillboardClass } from "@/backend/BillboardClass";
import MockStudentsBookingCard from "@/components/cards/MockStudentsBookingCard";

// Header Component
function PageHeader() {
  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200/50 dark:border-slate-700/50 sticky top-0 z-10">
      <div className="px-4 py-6">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2 text-center">
        How the kite system works
        </h1>
      </div>
    </div>
  );
}

// Step 1: Teacher Setup Component
function Step1TeacherSetup() {
  return (
    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-3 bg-green-100 dark:bg-green-900/30 px-6 py-3 rounded-full mb-4">
          <HeadsetIcon className="w-8 h-8 text-green-600" />
          <span className="text-xl font-semibold text-green-800 dark:text-green-200">Step 1: Set Up Your Team</span>
        </div>
        <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          First, we create teacher profiles and set their commission rates - this is our employment contract
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-8">
        <TeacherCard />
        <div className="flex items-center gap-2 text-4xl text-green-600">
          <span>→</span>
          <span className="text-sm font-medium text-green-700 dark:text-green-300">sets contract</span>
          <span>→</span>
        </div>
        <CommissionCard />
      </div>
    </div>
  );
}

// Flow Diagram Component
function StudentJourneyFlowDiagram() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6 mb-12">
      <div className="text-center">
        <StudentCard />
        <div className="text-center text-sm text-slate-500 dark:text-slate-400 mt-2">
          Creates booking
        </div>
      </div>

      <div className="flex items-center gap-2 text-4xl text-blue-600">
        <span>→</span>
        <span className="text-xs text-blue-700 dark:text-blue-300 font-medium">creates</span>
      </div>

      <div className="text-center">
        <BookingCard />
        <div className="text-center text-sm text-slate-500 dark:text-slate-400 mt-2">
          Chooses dates & package
        </div>
      </div>

      <div className="flex items-center gap-2 text-4xl text-cyan-600">
        <span>→</span>
        <span className="text-xs text-cyan-700 dark:text-cyan-300 font-medium">assigns</span>
      </div>

      <div className="text-center">
        <LessonCard />
        <div className="text-center text-sm text-slate-500 dark:text-slate-400 mt-2">
          Picks teacher & commission
        </div>
      </div>

      <div className="flex items-center gap-2 text-4xl text-teal-600">
        <span>→</span>
        <span className="text-xs text-teal-700 dark:text-teal-300 font-medium">creates</span>
      </div>

      <div className="text-center">
        <EventCard />
        <div className="text-center text-sm text-slate-500 dark:text-slate-400 mt-2">
          Within booking date range
        </div>
      </div>
    </div>
  );
}

// Live Example Component
function LiveBookingExample({ mockBillboardClass, mockTeachers }: { mockBillboardClass: BillboardClass, mockTeachers: any[] }) {
  return (
    <div className="border-t border-slate-200 dark:border-slate-700 pt-8">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">
          Live Example: Complete Student Booking
        </h3>
      </div>

      <div className="flex flex-wrap gap-8 max-w-6xl mx-auto justify-around items-center">
        {/* BookingCard Component */}
        <div className="flex">
          <div className="">
            <MockStudentsBookingCard
              billboardClass={mockBillboardClass}
              selectedDate="2025-09-16"
              teachers={mockTeachers}
            />
          </div>
        </div>

        {/* Detailed Explanation */}
        <div className="flex-1 min-w-[320px] max-w-[480px] space-y-6">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg">
            <div className="space-y-4 text-sm">
              {/* Booking Dates & Progress */}
              <div className="flex items-start gap-3">
                <BookingIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <h5 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    <span className="text-blue-600 dark:text-blue-400">Booking Dates</span> & Progress Bar
                  </h5>
                  <p className="text-slate-600 dark:text-slate-400 text-xs">
                    Top section shows booking period with progress visualization:
                  </p>
                  <ul className="mt-1 ml-2 space-y-1 text-xs">
                    <li>• <span className="font-semibold text-green-700 dark:text-green-400">Dark Green</span>: Completed lessons/events</li>
                    <li>• <span className="font-semibold text-green-400 dark:text-green-300">Light Green</span>: Pending confirmation</li>
                  </ul>
                </div>
              </div>

              {/* Student Names */}
              <div className="flex items-start gap-3">
                <HelmetIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <h5 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    <span className="text-yellow-600 dark:text-yellow-400">Student Names</span>
                  </h5>
                  <p className="text-slate-600 dark:text-slate-400 text-xs">
                    Displays all students in this booking: <span className="font-mono font-semibold">Emma & Carlos</span>
                  </p>
                </div>
              </div>

              {/* Lessons & Events */}
              <div className="flex items-start gap-3">
                <HeadsetIcon className="w-5 h-5 text-cyan-600 dark:text-cyan-400 mt-0.5" />
                <div>
                  <h5 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    <span className="text-cyan-600 dark:text-cyan-400">Lessons</span> with <FlagIcon className="inline w-4 h-4 text-teal-600 dark:text-teal-400 mx-1" />Events
                  </h5>
                  <p className="text-slate-600 dark:text-slate-400 text-xs">
                    Shows detailed lesson information:
                  </p>
                  <ul className="mt-1 ml-2 space-y-1 text-xs">
                    <li>• <span className="font-semibold">Teacher Name</span>: Miguel Sanchez</li>
                    <li>• <span className="font-semibold">Event Duration</span>: 120min completed, 90min planned</li>
                    <li>• <span className="font-semibold">Event Dates</span>: Sep 16 (completed), Sep 18 (planned)</li>
                  </ul>
                </div>
              </div>

              {/* Interactive Elements */}
              <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div>
                      <h6 className="font-semibold text-slate-700 dark:text-slate-300 text-xs">
                        <span className="text-orange-600 dark:text-orange-400">Details Dropdown</span>
                      </h6>
                      <p className="text-slate-600 dark:text-slate-400 text-xs">
                        Package, Booking, References 
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

  
        </div>
      </div>
    </div>
  );
}

// Step 2: Student Journey Component
function Step2StudentJourney({ mockBillboardClass, mockTeachers }: { mockBillboardClass: BillboardClass, mockTeachers: any[] }) {
  return (
    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-3 bg-blue-100 dark:bg-blue-900/30 px-6 py-3 rounded-full mb-4">
          <HelmetIcon className="w-8 h-8 text-yellow-600" />
          <span className="text-xl font-semibold text-blue-800 dark:text-blue-200">Step 2: Student Journey</span>
        </div>
        <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          <span className="font-bold text-yellow-700 dark:text-yellow-300">Students</span> create <span className="font-bold text-blue-700 dark:text-blue-300">bookings</span>, we assign <span className="font-bold text-cyan-400 dark:text-cyan-300">lessons</span>, and track everything with <span className="font-bold text-teal-700 dark:text-teal-300">events</span>
        </p>
      </div>

      <StudentJourneyFlowDiagram />
      <LiveBookingExample mockBillboardClass={mockBillboardClass} mockTeachers={mockTeachers} />
    </div>
  );
}

// Supporting Systems Component
function SupportingSystems() {
  return (
    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">Extras, yet important systems ...</h2>
      </div>

      <div className="flex flex-wrap justify-center gap-6">
        <KiteCard />
        <PaymentCard />
        <PackageCard />
      </div>
    </div>
  );
}

// User Authentication Section
function UserAuthenticationSection() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-purple-900/20 dark:to-indigo-900/20 p-6 rounded-xl border-2 border-purple-200 dark:border-purple-700 shadow-lg">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-purple-500 rounded-lg">
            <UsersIcon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-purple-800 dark:text-purple-200">User Wallet</h3>
            <p className="text-sm text-purple-600 dark:text-purple-300">References</p>
          </div>
        </div>
        <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
            <span>Teacher Admin - Full system access</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
            <span>Teacher - Lesson management</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
            <span>Reception - Booking coordination</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
            <span>Reference - Client tracking</span>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-indigo-900/20 dark:to-blue-900/20 p-6 rounded-xl border-2 border-indigo-200 dark:border-indigo-700 shadow-lg">
        <h4 className="text-lg font-semibold text-indigo-800 dark:text-indigo-200 mb-3">How Authentication Works</h4>
        <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
            <span>Supabase auth users link to User Wallet profiles</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
            <span>Role-based permissions control access levels</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
            <span>Secure session management for daily operations</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Billboard Management Section
function BillboardManagementSection() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-green-50 to-teal-100 dark:from-green-900/20 dark:to-teal-900/20 p-6 rounded-xl border-2 border-green-200 dark:border-green-700 shadow-lg">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-green-500 rounded-lg">
            <CalendarIcon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-green-800 dark:text-green-200">Billboard System</h3>
            <p className="text-sm text-green-600 dark:text-green-300">Daily Operations Hub</p>
          </div>
        </div>
        <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>Drag & drop event scheduling</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>Real-time date filtering</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>Global statistics dashboard</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>Multi-format export system</span>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-teal-50 to-cyan-100 dark:from-teal-900/20 dark:to-cyan-900/20 p-6 rounded-xl border-2 border-teal-200 dark:border-teal-700 shadow-lg">
        <h4 className="text-lg font-semibold text-teal-800 dark:text-teal-200 mb-3">Power Features</h4>
        <div className="grid grid-cols-2 gap-3 text-sm text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
            <span>CSV Export</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
            <span>WhatsApp Share</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
            <span>Medical Reports</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
            <span>Print Ready</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
            <span>Debug Mode</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
            <span>Real-time Updates</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// User Authentication & Billboard Management Component
function UserAuthAndBillboardManagement() {
  return (
    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-3 bg-purple-100 dark:bg-purple-900/30 px-6 py-3 rounded-full mb-4">
          <UsersIcon className="w-8 h-8 text-purple-600" />
          <span className="text-xl font-semibold text-purple-800 dark:text-purple-200">User Authentication & Daily Operations</span>
        </div>
        <p className="text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
          Secure role-based access for teachers, admins, and reception staff to manage the complete booking lifecycle
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <UserAuthenticationSection />
        <BillboardManagementSection />
      </div>
    </div>
  );
}

// Sub-components for each entity
function StudentCard() {
  return (
    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-6 rounded-xl border-2 border-yellow-200 dark:border-yellow-700 shadow-lg">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 border-2 border-yellow-500 rounded-lg">
            <HelmetIcon className="w-8 h-8 text-yellow-600" />
          </div>
          <h3 className="text-xl font-bold text-yellow-800 dark:text-yellow-200">Student</h3>
        </div>
        <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300 w-full">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
            <span>Name & contact</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
            <span>Languages</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
            <span>Passport info</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
            <span>Descption Note</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function TeacherCard() {
  return (
    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-6 rounded-xl border-2 border-green-200 dark:border-green-700 shadow-lg">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 border-2 border-green-500 rounded-lg">
            <HeadsetIcon className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-green-800 dark:text-green-200">Teacher</h3>
        </div>
        <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300 w-full">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>Name & contact info</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>Languages</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>Passport & country</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CommissionCard() {
  return (
    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-6 rounded-xl border-2 border-cyan-200 dark:border-cyan-700 shadow-lg">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 border-2 border-cyan-500 rounded-lg">
            <BookIcon className="w-8 h-8 text-cyan-600" />
          </div>
          <h3 className="text-xl font-bold text-cyan-800 dark:text-cyan-200">Commission</h3>
        </div>
        <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300 w-full">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-cyan-500 rounded-full"></span>
            <span>€ Price per hour</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-cyan-500 rounded-full"></span>
            <span>Description & terms</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function BookingCard() {
  return (
    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-6 rounded-xl border-2 border-blue-200 dark:border-blue-700 shadow-lg">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 border-2 border-blue-500 rounded-lg">
            <BookingIcon className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-blue-800 dark:text-blue-200">Booking</h3>
        </div>
        <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300 w-full">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            <span>Start & end dates</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            <span>Reference source</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            <span>Package selected</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function LessonCard() {
  return (
    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-6 rounded-xl border-2 border-cyan-200 dark:border-cyan-700 shadow-lg">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 border-2 border-cyan-500 rounded-lg">
            <FlagIcon className="w-8 h-8 text-cyan-600" />
          </div>
          <h3 className="text-xl font-bold text-cyan-800 dark:text-cyan-200">Lesson</h3>
        </div>
        <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300 w-full">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-cyan-500 rounded-full"></span>
            <span>Teacher assigned</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-cyan-500 rounded-full"></span>
            <span>Commission rate</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-cyan-500 rounded-full"></span>
            <span>Status tracking</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function EventCard() {
  return (
    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-6 rounded-xl border-2 border-teal-200 dark:border-teal-700 shadow-lg">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 border-2 border-teal-500 rounded-lg">
            <KiteIcon className="w-8 h-8 text-teal-600" />
          </div>
          <h3 className="text-xl font-bold text-teal-800 dark:text-teal-200">Event</h3>
        </div>
        <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300 w-full">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
            <span>Date/time</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
            <span>Duration</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
            <span>Location & status & kite used</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function KiteCard() {
  return (
    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-6 rounded-xl border-2 border-purple-200 dark:border-purple-700 shadow-lg">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 border-2 border-purple-500 rounded-lg">
            <EquipmentIcon className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-lg font-bold text-purple-800 dark:text-purple-200">Kites</h3>
        </div>
        <p className="text-sm text-slate-700 dark:text-slate-300 text-center">
         Track usage & assign to teachers
        </p>
      </div>
    </div>
  );
}

function PaymentCard() {
  return (
    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-6 rounded-xl border-2 border-amber-200 dark:border-amber-700 shadow-lg">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 border-2 border-amber-500 rounded-lg">
            <PaymentIcon className="w-8 h-8 text-amber-600" />
          </div>
          <h3 className="text-lg font-bold text-amber-800 dark:text-amber-200">Payments</h3>
        </div>
        <p className="text-sm text-slate-700 dark:text-slate-300 text-center">
         Pay teachers for net tracking 
        </p>
      </div>
    </div>
  );
}

function PackageCard() {
  return (
    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-6 rounded-xl border-2 border-orange-200 dark:border-orange-700 shadow-lg">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 border-2 border-orange-500 rounded-lg">
            <BookmarkIcon className="w-8 h-8 text-orange-600" />
          </div>
          <h3 className="text-lg font-bold text-orange-800 dark:text-orange-200">Packages</h3>
        </div>
        <p className="text-sm text-slate-700 dark:text-slate-300 text-center">
          Define price, hours and capacity. 
        </p>
      </div>
    </div>
  );
}

export default function DocsPage() {
  // Mock data for StudentsBookingCard in Step 2
  const mockTeachers = [
    {
      id: "teacher-123",
      name: "Miguel Sanchez",
      languages: ["Spanish", "English", "French"],
      passport_number: "MS345678",
      country: "Spain",
      phone: "+34 666 123 456",
      created_at: "2024-01-15T00:00:00.000Z",
      deleted_at: null
    },
    {
      id: "teacher-456",
      name: "Anna Kowalski",
      languages: ["English", "Polish", "German"],
      passport_number: "AK567890",
      country: "Poland",
      phone: "+48 123 456 789",
      created_at: "2024-02-01T00:00:00.000Z",
      deleted_at: null
    }
  ];

  const mockBillboardClass = new BillboardClass({
    // Main booking data
    id: "booking-123",
    package_id: "package-456",
    date_start: "2025-09-15T00:00:00.000Z",
    date_end: "2025-09-20T00:00:00.000Z",
    status: "active",
    reference_id: "ref-789",
    created_at: "2025-09-10T10:30:00.000Z",
    deleted_at: null,

    // Package details
    package: {
      id: "package-456",
      duration: 480, // 8 hours total (in minutes)
      description: "Beginner Kite Surfing Package",
      price_per_student: 400, // €400 total per student
      capacity_students: 2,
      capacity_kites: 2,
      created_at: "2025-01-01T00:00:00.000Z"
    },

    // Reference information
    reference: {
      id: "ref-789",
      role: "reference",
      sk: "user-auth-123",
      pk: null,
      note: "VIP customer - prefers morning sessions",
      created_at: "2025-09-01T00:00:00.000Z",
      updated_at: "2025-09-01T00:00:00.000Z",
      teacher: null
    },

    // Students in this booking
    students: [
      {
        id: "bs-1",
        booking_id: "booking-123",
        student_id: "student-001",
        student: {
          id: "student-001",
          name: "Emma",
          last_name: "Johnson",
          languages: ["English", "Spanish"],
          passport_number: "EJ123456",
          country: "United Kingdom",
          phone: "+44 123 456 7890",
          size: "M",
          desc: "Beginner kiter, excited to learn!",
          created_at: "2025-09-05T00:00:00.000Z",
          deleted_at: null
        }
      },
      {
        id: "bs-2",
        booking_id: "booking-123",
        student_id: "student-002",
        student: {
          id: "student-002",
          name: "Carlos",
          last_name: "Rodriguez",
          languages: ["Spanish", "English"],
          passport_number: "CR789012",
          country: "Spain",
          phone: "+34 987 654 321",
          size: "L",
          desc: "Has some windsurfing experience",
          created_at: "2025-09-05T00:00:00.000Z",
          deleted_at: null
        }
      }
    ],

    // Lessons assigned to this booking
    lessons: [
      {
        id: "lesson-001",
        teacher_id: "teacher-123",
        booking_id: "booking-123",
        commission_id: "commission-456",
        status: "planned",
        created_at: "2025-09-12T00:00:00.000Z",
        deleted_at: null,

        // Teacher information
        teacher: {
          id: "teacher-123",
          name: "Miguel Sanchez",
          languages: ["Spanish", "English", "French"],
          passport_number: "MS345678",
          country: "Spain",
          phone: "+34 666 123 456",
          created_at: "2024-01-15T00:00:00.000Z",
          deleted_at: null
        },

        // Events within this lesson
        events: [
          {
            id: "event-001",
            lesson_id: "lesson-001",
            date: "2025-09-16T10:00:00.000Z", // 10:00 AM
            duration: 120, // 2 hours
            location: "Los Lances",
            status: "completed",
            created_at: "2025-09-12T00:00:00.000Z",

            // Kites used in this event
            kites: [
              {
                id: "kite-event-001",
                event_id: "event-001",
                kite_id: "kite-001",
                created_at: "2025-09-16T10:00:00.000Z",
                kite: {
                  id: "kite-001",
                  serial_id: "KS-2024-001",
                  model: "Cabrinha Switchblade",
                  size: 12,
                  created_at: "2024-03-01T00:00:00.000Z",
                  updated_at: "2024-03-01T00:00:00.000Z"
                }
              },
              {
                id: "kite-event-002",
                event_id: "event-001",
                kite_id: "kite-002",
                created_at: "2025-09-16T10:00:00.000Z",
                kite: {
                  id: "kite-002",
                  serial_id: "KS-2024-002",
                  model: "Cabrinha Switchblade",
                  size: 10,
                  created_at: "2024-03-01T00:00:00.000Z",
                  updated_at: "2024-03-01T00:00:00.000Z"
                }
              }
            ]
          },
          {
            id: "event-002",
            lesson_id: "lesson-001",
            date: "2025-09-18T14:00:00.000Z", // 2:00 PM
            duration: 90, // 1.5 hours
            location: "Los Lances",
            status: "planned",
            created_at: "2025-09-12T00:00:00.000Z",
            kites: [] // No kites assigned yet
          }
        ],

        totalKiteEventDuration: 120
      }
    ],

    lessonCount: 1
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <PageHeader />
      
      <div className="px-4 py-8 space-y-12">
        <Step1TeacherSetup />
        <Step2StudentJourney mockBillboardClass={mockBillboardClass} mockTeachers={mockTeachers} />
        <SupportingSystems />
        <UserAuthAndBillboardManagement />
      </div>
    </div>
  );
}
