import { CompassSVG } from "./CompassSVG";

export function LoadingSpinners({ isDarkMode }: { isDarkMode: boolean }) {
  return (
    <div className="relative flex flex-col items-center gap-12 mb-8 py-8">
      <div className="flex gap-16 relative z-10">
        {[0, 1].map((index) => (
          <div key={index} className="flex justify-center">
            <div className={`p-4 rounded-xl shadow-inner ${
              isDarkMode 
                ? 'bg-gradient-to-br from-slate-700 to-slate-600' 
                : 'bg-gradient-to-br from-slate-100 to-slate-200'
            }`}>
              <CompassSVG
                className={`h-10 w-10 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}
                isLoading={true}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center relative z-10">
        <div className={`p-4 rounded-xl shadow-inner ${
          isDarkMode 
            ? 'bg-gradient-to-br from-slate-700 to-slate-600' 
            : 'bg-gradient-to-br from-slate-100 to-slate-200'
        }`}>
          <CompassSVG
            className={`h-10 w-10 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}
            isLoading={true}
          />
        </div>
      </div>
    </div>
  );
}