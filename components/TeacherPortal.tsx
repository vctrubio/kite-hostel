import { HeadsetIcon } from "@/svgs/HeadsetIcon";
import { FlagIcon } from "@/svgs/FlagIcon";
import { KiteIcon } from "@/svgs/KiteIcon";
import { PaymentIcon } from "@/svgs/PaymentIcon";

interface TeacherRowProps {
  name: string;
  lessonsCount: number;
  eventsCount: number;
  commissionsCount: number;
}

function TeacherHeader({
  name,
  lessonsCount,
  eventsCount,
  commissionsCount,
}: TeacherRowProps) {
  return (
    <div className="flex justify-between items-center p-4 border-b border-border dark:border-gray-700">
      <div className="flex items-center gap-2">
        <HeadsetIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
        <h4 className="text-lg font-medium text-foreground dark:text-white">
          {name}
        </h4>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <FlagIcon className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium">{lessonsCount}</span>
        </div>
        <div className="flex items-center gap-1">
          <KiteIcon className="w-4 h-4 text-green-800" />
          <span className="text-sm font-medium">{eventsCount}</span>
        </div>
        <div className="flex items-center gap-1">
          <PaymentIcon className="w-4 h-4 text-yellow-600" />
          <span className="text-sm font-medium">{commissionsCount}</span>
        </div>
      </div>
    </div>
  );
}

export default function TeacherPortal() {
  return (
    <TeacherHeader
      name="John Doe"
      lessonsCount={12}
      eventsCount={5}
      commissionsCount={300}
    />
  );
}
