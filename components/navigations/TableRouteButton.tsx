import Link from "next/link";
import { Plus } from "lucide-react";

const ACTIVE_BUTTON_CLASSES = "bg-gray-200 text-gray-800 shadow-sm dark:bg-gray-700 dark:text-gray-200";

export function TableRouteButton({
  entity,
  isActive,
  showPlus = false,
}: {
  entity: {
    name: string;
    icon: any;
    color: string;
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
        className={`flex items-center space-x-2 px-3 py-2 rounded-l-lg text-sm font-medium transition-all duration-200 ${isActive ? ACTIVE_BUTTON_CLASSES : `${entity.color} hover:bg-gray-100 dark:hover:bg-gray-800`}`}
      >
        <EntityIcon className="h-4 w-4" />
        <span className="hidden lg:block">{entity.name}s</span>
      </Link>
      {showPlus && (
        <div className="hidden lg:block">
          <Link
            href={`${entity.link}/form`}
            className="flex items-center px-2 py-2 rounded-r-lg text-sm font-medium transition-all duration-200 border-l border-gray-300 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800"
            title={`Add new ${entity.name.toLowerCase()}`}
          >
            <Plus className="h-3 w-3" />
          </Link>
        </div>
      )}
    </div>
  );
}