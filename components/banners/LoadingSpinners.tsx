import { ROLE_ICONS } from "./RoleConfigs";

interface LoadingSpinnersProps {
  spinningIcons: {
    student: boolean;
    teacher: boolean;
    bookings: boolean;
  };
  visibleWords?: {
    student: boolean;
    teacher: boolean;
    bookings: boolean;
  };
}

export function LoadingSpinners({ spinningIcons, visibleWords }: LoadingSpinnersProps) {
  const spinStates = [spinningIcons.student, spinningIcons.teacher, spinningIcons.bookings];
  const labelVisible = visibleWords
    ? [visibleWords.student, visibleWords.teacher, visibleWords.bookings]
    : [true, true, true];

  return (
    <div className="relative flex flex-col items-center gap-12 mb-8 py-8">
      <div className="flex gap-16 relative z-10">
        {ROLE_ICONS.slice(0, 2).map(({ Icon, color, label }, index) => {
          const isSpinning = spinStates[index];
          const showLabel = labelVisible[index];
          return (
            <div key={index} className="flex flex-col items-center gap-2">
              <div
                className={`p-4 rounded-xl shadow-inner bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 border-2 transition-all duration-500 ${
                  isSpinning ? 'opacity-100' : 'opacity-50 scale-95'
                }`}
                style={{ borderColor: color }}
              >
                <Icon
                  className={`h-10 w-10 text-slate-600 dark:text-slate-300 transition-transform duration-300 ${
                    isSpinning ? 'animate-spin' : ''
                  }`}
                />
              </div>
              <span
                className={`text-lg font-bold text-slate-700 dark:text-slate-300 transition-opacity duration-500 ${
                  showLabel ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex justify-center relative z-10">
        {ROLE_ICONS.slice(2).map(({ Icon, color, label }, index) => {
          const isSpinning = spinStates[2];
          const showLabel = labelVisible[2];
          return (
            <div key="bookings" className="flex flex-col items-center gap-2">
              <div
                className={`p-4 rounded-xl shadow-inner bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 border-2 transition-all duration-500 ${
                  isSpinning ? 'opacity-100' : 'opacity-50 scale-95'
                }`}
                style={{ borderColor: color }}
              >
                <Icon
                  className={`h-10 w-10 text-slate-600 dark:text-slate-300 transition-transform duration-300 ${
                    isSpinning ? 'animate-spin' : ''
                  }`}
                />
              </div>
              <span
                className={`text-lg font-bold text-slate-700 dark:text-slate-300 transition-opacity duration-500 ${
                  showLabel ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
