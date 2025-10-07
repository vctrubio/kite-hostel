import Link from "next/link";
import { Plus } from "lucide-react";

export function TableRouteButton({
  entity,
  isActive,
  showPlus = false,
}: {
  entity: {
    name: string;
    icon: any;
    color: string;
    bgColor: string;
    link: string;
  };
  isActive: boolean;
  showPlus?: boolean;
}) {
  const EntityIcon = entity.icon;
  return (
    <div className="flex items-center">
      <Link
        href={entity.link}
        className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium transition-all duration-200 ${isActive ? `${entity.bgColor}/20 ${entity.color} font-semibold shadow-sm border-b-2 border-current` : `${entity.color} hover:bg-gray-100 dark:hover:bg-gray-800`}`}
      >
        <EntityIcon className="h-4 w-4" />
        <span className="hidden lg:block">{entity.name}s</span>
      </Link>
      {showPlus && (
        <div className={`hidden lg:block ${entity.color.replace('text-', 'hover:text-')} ${entity.bgColor.replace('bg-', 'hover:bg-')}/20 transition-all duration-200`}>
          <Link
            href={`${entity.link}/form`}
            className="flex items-center px-2 py-2 text-sm font-medium border-l border-gray-300 text-gray-500 dark:border-gray-600 dark:text-gray-400 inherit"
            title={`Add new ${entity.name.toLowerCase()}`}
          >
            <Plus className="h-3 w-3" />
          </Link>
        </div>
      )}
    </div>
  );
}