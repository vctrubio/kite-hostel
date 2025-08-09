import EventCard from '@/components/cards/EventCard';

interface WhiteboardEventsProps {
  events: any[];
}

export default function WhiteboardEvents({ events }: WhiteboardEventsProps) {
  const eventCards = events.map((event, index) => {
    const teacher = event.lesson?.teacher?.name || 'Unknown Teacher';
    const students = event.booking?.students?.map((bs: any) => bs.student?.name).join(', ') || 'No students';
    const location = event.location || 'No location';
    const date = event.date || 'No date';
    const duration = event.duration || 0;
    const status = event.status || 'No status';

    return (
      <EventCard
        key={index}
        teacher={teacher}
        students={students}
        location={location}
        duration={duration}
        date={date}
        status={status}
      />
    );
  });

  return (
    <div>
      <h3 className="text-lg font-medium mb-3">Events ({events.length})</h3>
      {events.length === 0 ? (
        <div className="p-8 bg-muted rounded-lg text-center">
          <p className="text-muted-foreground">No events found for this date</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {eventCards}
        </div>
      )}
    </div>
  );
}
