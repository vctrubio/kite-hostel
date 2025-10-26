import { RoleSelectionProps } from "./RoleSelectionComponent";
import { ROLE_CONFIGS, ROLE_ICONS } from "./RoleConfigs";

export function DesktopRoleSelection({ hoveredIcon, setHoveredIcon, handleIconClick, visibleWords }: RoleSelectionProps) {
  const isLoading = visibleWords !== undefined;
  const showStudent = !isLoading || visibleWords.student;
  const showTeacher = !isLoading || visibleWords.teacher;
  const showBookings = !isLoading || visibleWords.bookings;

  return (
    <div className="hidden md:block relative">
      {/* Title with Interactive Entities */}
      <div className="text-center mb-8 text-gray-800 dark:text-gray-200">
        <h2 className="text-2xl font-bold tracking-tight mb-4" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '-0.02em' }}>
          Connecting{" "}
          <span
            className={`underline decoration-2 underline-offset-4 cursor-pointer transition-all duration-500 ${
              showStudent ? 'opacity-100' : 'opacity-0'
            } ${
              hoveredIcon === 0
                ? 'decoration-yellow-500 bg-yellow-500/10 px-2 rounded'
                : 'decoration-yellow-500/50 hover:decoration-yellow-500 hover:bg-yellow-500/10 hover:px-2 hover:rounded'
            }`}
            onMouseEnter={() => setHoveredIcon(0)}
            onMouseLeave={() => setHoveredIcon(null)}
          >
            Students
          </span>
          ,{" "}
          <span
            className={`underline decoration-2 underline-offset-4 cursor-pointer transition-all duration-500 ${
              showTeacher ? 'opacity-100' : 'opacity-0'
            } ${
              hoveredIcon === 1
                ? 'decoration-green-500 bg-green-500/10 px-2 rounded'
                : 'decoration-green-500/50 hover:decoration-green-500 hover:bg-green-500/10 hover:px-2 hover:rounded'
            }`}
            onMouseEnter={() => setHoveredIcon(1)}
            onMouseLeave={() => setHoveredIcon(null)}
          >
            Teachers
          </span>
          {" "}and{" "}
          <span
            className={`underline decoration-2 underline-offset-4 cursor-pointer transition-all duration-500 ${
              showBookings ? 'opacity-100' : 'opacity-0'
            } ${
              hoveredIcon === 2
                ? 'decoration-cyan-500 bg-cyan-500/10 px-2 rounded'
                : 'decoration-cyan-500/50 hover:decoration-cyan-500 hover:bg-cyan-500/10 hover:px-2 hover:rounded'
            }`}
            onMouseEnter={() => setHoveredIcon(2)}
            onMouseLeave={() => setHoveredIcon(null)}
          >
            Administration
          </span>
        </h2>
      </div>

      {!isLoading && (
        <div className="relative flex flex-col items-center gap-12 mb-8 py-8">
          {/* Connection lines between roles */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 200 120" preserveAspectRatio="xMidYMid meet">
          {/* Student to Teacher connection - uses yellow (student color) */}
          {(hoveredIcon === 0 || hoveredIcon === 1) && (
            <line 
              x1="50" y1="30" x2="150" y2="30" 
              stroke="currentColor" 
              strokeWidth="2" 
              className={`${ROLE_CONFIGS.student.tailwindConnection} opacity-60 animate-pulse`} 
              strokeDasharray="4 4" 
            />
          )}
          {/* Student to Bookings connection - uses cyan (bookings color) */}
          {(hoveredIcon === 0 || hoveredIcon === 2) && (
            <line
              x1="50" y1="30" x2="100" y2="90"
              stroke="currentColor"
              strokeWidth="2"
              className={`${ROLE_CONFIGS.bookings.tailwindConnection} opacity-60 animate-pulse`}
              strokeDasharray="4 4"
            />
          )}
          {/* Teacher to Bookings connection - uses green (teacher color) */}
          {(hoveredIcon === 1 || hoveredIcon === 2) && (
            <line
              x1="150" y1="30" x2="100" y2="90"
              stroke="currentColor"
              strokeWidth="2"
              className={`${ROLE_CONFIGS.teacher.tailwindConnection} opacity-60 animate-pulse`}
              strokeDasharray="4 4"
            />
          )}
        </svg>

        <div className="flex gap-20 relative z-10">
          {ROLE_ICONS.slice(0, 2).map(({ Icon, label, color, href }, index) => (
            <div
              key={label}
              className={`flex items-center gap-3 cursor-pointer ${index === 0 ? "flex-row-reverse" : "flex-row"}`}
              onMouseEnter={() => setHoveredIcon(index)}
              onMouseLeave={() => setHoveredIcon(null)}
              onClick={() => handleIconClick(href)}
            >
              <div
                className={`p-4 border-2 bg-transparent rounded-xl shadow-inner transition-all duration-300 ${
                  hoveredIcon === index ? `shadow-lg ring-2 ring-current/50` : ""
                }`}
                style={{ borderColor: color }}
              >
                <Icon className="h-10 w-10 text-slate-700 dark:text-slate-200" />
              </div>
              <span className="text-lg font-bold whitespace-nowrap text-slate-700 dark:text-slate-300">
                {label}
              </span>
            </div>
          ))}
        </div>

        <div className="flex justify-center relative z-10">
          {ROLE_ICONS.slice(2).map(({ Icon, label, color, href }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-2 cursor-pointer"
              onMouseEnter={() => setHoveredIcon(2)}
              onMouseLeave={() => setHoveredIcon(null)}
              onClick={() => handleIconClick(href)}
            >
              <div
                className={`p-4 border-2 bg-transparent rounded-xl shadow-inner transition-all duration-300 ${
                  hoveredIcon === 2 ? `shadow-lg ring-2 ring-current/50` : ""
                }`}
                style={{ borderColor: color }}
              >
                <Icon className="h-10 w-10 text-slate-700 dark:text-slate-200" />
              </div>
              <span className="text-lg font-bold text-slate-700 dark:text-slate-300">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
      )}
    </div>
  );
}