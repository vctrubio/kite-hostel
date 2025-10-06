import { CompassSVG } from "./CompassSVG";

export function LoadingSpinners() {
  return (
    <div className="relative flex flex-col items-center gap-12 mb-8 py-8">
      <div className="flex gap-16 relative z-10">
        {[0, 1].map((index) => (
          <div key={index} className="flex justify-center">
            <div className="p-4 rounded-xl shadow-inner bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600">
              <CompassSVG
                className="h-10 w-10 text-slate-600 dark:text-slate-300"
                isLoading={true}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center relative z-10">
        <div className="p-4 rounded-xl shadow-inner bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600">
          <CompassSVG
            className="h-10 w-10 text-slate-600 dark:text-slate-300"
            isLoading={true}
          />
        </div>
      </div>
    </div>
  );
}