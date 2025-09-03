import { HeadsetIcon } from "@/svgs";
import { LessonCard } from "./LessonCard";

interface LessonsProps {
  lessons: any[];
  formatEventDate: (dateString: string) => string;
}

export function Lessons({ lessons, formatEventDate }: LessonsProps) {
  return (
    <div className="bg-card rounded-lg border border-border p-4 space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <HeadsetIcon className="w-5 h-5 text-green-600" />
        <span>Lessons</span>
        <span className="text-sm text-muted-foreground font-normal">({lessons.length})</span>
      </h2>

      {lessons.length > 0 ? (
        <div className="space-y-4">
          {lessons.map((lesson) => (
            <LessonCard 
              key={lesson.id} 
              lesson={lesson} 
              formatEventDate={formatEventDate} 
            />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No lessons associated with this booking.</p>
      )}
    </div>
  );
}
