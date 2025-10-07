import { createElement } from "react";
import { HelmetIcon } from "@/svgs/HelmetIcon";

interface StudentCreatedToastProps {
  fullName: string;
  description?: string;
}

export function createStudentCreatedToast(fullName: string, description?: string) {
  return createElement(
    'div',
    { className: 'flex items-start gap-2' },
    createElement(HelmetIcon, { className: 'w-5 h-5 flex-shrink-0 mt-0.5' }),
    createElement(
      'div',
      { className: 'flex-1' },
      createElement('div', { className: 'font-semibold' }, `New Student: ${fullName}`),
      description && createElement('div', { className: 'text-sm text-muted-foreground' }, description)
    )
  );
}

// Alternative: If you want to use it as a component directly
export function StudentCreatedToast({ fullName, description }: StudentCreatedToastProps) {
  return (
    <div className="flex items-start gap-2">
      <HelmetIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <div className="font-semibold">New Student: {fullName}</div>
        {description && <div className="text-sm text-muted-foreground">{description}</div>}
      </div>
    </div>
  );
}
