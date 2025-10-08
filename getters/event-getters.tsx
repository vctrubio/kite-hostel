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

export function formatFriendlyDate(dateString: string, showYear: boolean = true) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid Date';
  
  const day = date.getDate();
  const suffix = day === 1 || day === 21 || day === 31 ? 'st' : 
                 day === 2 || day === 22 ? 'nd' : 
                 day === 3 || day === 23 ? 'rd' : 'th';
  const month = date.toLocaleDateString('en-GB', { month: 'short' });
  const year = date.getFullYear();
  
  return showYear ? `${day}${suffix} ${month} ${year}` : `${day}${suffix} ${month}`;
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