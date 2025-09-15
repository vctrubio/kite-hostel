import { KiteIcon } from '@/svgs/KiteIcon';

interface EventHeadingProps {
  className?: string;
}

export function EventHeading({ className = 'w-5 h-5' }: EventHeadingProps) {
  return (
    <div className="flex items-center gap-2">
      <KiteIcon className={className} />
      <span>Events</span>
    </div>
  );
}

interface EventCountWithDurationProps {
  eventCount: number;
  totalHours: number;
}

export function EventCountWithDuration({ eventCount, totalHours }: EventCountWithDurationProps) {
  return (
    <div className="flex items-center gap-2">
      <span>{eventCount || 0}</span>
      <span>•</span>
      <span>{totalHours || 0} h</span>
    </div>
  );
}