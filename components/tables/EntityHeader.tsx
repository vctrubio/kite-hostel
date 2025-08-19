'use client';

import { usePathname } from "next/navigation";
import { ENTITY_DATA } from "@/lib/constants";
import { FileText } from "lucide-react";

interface Stat {
  description: string;
  value: number;
}

interface ActionButton {
  icon: React.ComponentType<any>;
  label: string;
  action: () => void;
}

interface EntityHeaderProps {
  name?: string;
  icon?: React.ComponentType<any>;
  color?: string;
  stats?: Stat[];
  actionButtons?: ActionButton[];
}

export function EntityHeader({ name, icon, color, stats, actionButtons }: EntityHeaderProps) {
  const pathname = usePathname();
  
  // Get entity info from pathname if not provided as props
  const getEntityFromPath = () => {
    const entity = ENTITY_DATA.find(e => pathname.startsWith(e.link));
    return entity;
  };

  const entity = getEntityFromPath();
  const displayName = name || entity?.name || "Forms";
  const IconComponent = icon || entity?.icon || FileText;
  const iconColor = color || entity?.color || "text-gray-500";

  const defaultStats: Stat[] = [
    { description: "Total", value: 0 },
    { description: "Active", value: 0 },
    { description: "This Month", value: 0 }
  ];

  const displayStats = stats || defaultStats;

  return (
    <div className="mb-8">
      {/* Entity Name, Icon, and Action Buttons */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <IconComponent className={`h-8 w-8 ${iconColor}`} />
          <h1 className="text-3xl font-bold text-foreground">{displayName}</h1>
        </div>
        
        {/* Action Buttons */}
        {actionButtons && actionButtons.length > 0 && (
          <div className="flex items-center space-x-2">
            {actionButtons.map((button, index) => {
              const IconComponent = button.icon;
              return (
                <button
                  key={index}
                  onClick={button.action}
                  className="flex items-center space-x-2 px-3 py-2 border border-border rounded-lg bg-background text-foreground hover:bg-muted transition-colors duration-200"
                  title={button.label}
                >
                  <IconComponent className="h-4 w-4" />
                  <span className="text-sm font-medium">{button.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {displayStats.map((stat, index) => (
          <div
            key={index}
            className="bg-card border border-border rounded-lg p-4"
          >
            <div className="text-2xl font-bold text-foreground mb-1">
              {stat.value.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">
              {stat.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}