import { RoleSelectionProps } from "./RoleSelectionComponent";
import { ROLE_ICONS } from "./RoleConfigs";

export function MobileRoleSelection({ hoveredIcon, setHoveredIcon, handleIconClick }: RoleSelectionProps) {
  return (
    <div className="md:hidden flex flex-col gap-4 mb-8 py-4">
      {ROLE_ICONS.map(({ Icon, label, color }, index) => (
        <div
          key={label}
          className={`flex items-center gap-4 cursor-pointer p-4 border-4 bg-transparent rounded-xl transition-all duration-300 hover:shadow-lg ${
            hoveredIcon === index ? `ring-2 ring-current/50 shadow-lg` : ""
          }`}
          style={{ borderColor: color }}
          onMouseEnter={() => setHoveredIcon(index)}
          onMouseLeave={() => setHoveredIcon(null)}
          onClick={handleIconClick}
        >
          <div className="p-3 rounded-lg">
            <Icon className="h-8 w-8 text-slate-700 dark:text-slate-200" />
          </div>
          <span className="text-xl font-bold text-slate-700 dark:text-slate-300">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}