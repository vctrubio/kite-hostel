import {
  HelmetIcon,
  HeadsetIcon,
  PackageIcon,
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
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200/50 dark:border-slate-700/50 sticky top-0 z-10">
        <div className="px-4 py-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2 text-center">
          How the kite system works
          </h1>
        </div>
      </div>

      <div className="px-4 py-8 space-y-12">

        {/* Step 1: Teacher Setup */}
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

        {/* Step 2: Student Booking Flow */}
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

          <div className="flex flex-wrap items-center justify-center gap-6">
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
        </div>

        {/* Footer: Supporting Systems */}
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

        {/* User Wallet & Billboard Management */}
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
            {/* User Wallet Authentication */}
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

              {/* Authentication Flow */}
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

            {/* Billboard Management System */}
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

              {/* Key Features */}
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
          </div>

        </div>
      </div>
    </div>
  );
}
