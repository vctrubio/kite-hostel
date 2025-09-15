import { ReactNode } from "react";

interface DropdownSection {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  color: string;
  children: ReactNode;
}

interface DropdownExpandableRowProps {
  isExpanded: boolean;
  colSpan: number;
  sections: DropdownSection[];
}

export function DropdownExpandableRow({ isExpanded, colSpan, sections }: DropdownExpandableRowProps) {
  if (!isExpanded) return null;

  return (
    <tr>
      <td colSpan={colSpan} className="py-4 px-4 bg-background/30">
        <div className="w-full space-y-4">
          {sections.map((section, index) => (
            <div key={index} className={`p-4 bg-background/50 border-l-4 border-${section.color.replace('text-', '')}`}>
              <div className="flex items-center gap-2 mb-3">
                {section.icon && <section.icon className={`w-5 h-5 ${section.color}`} />}
                <h4 className="font-semibold text-foreground">{section.title}</h4>
              </div>
              {section.children}
            </div>
          ))}
        </div>
      </td>
    </tr>
  );
}