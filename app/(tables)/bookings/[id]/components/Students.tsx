import { HelmetIcon } from "@/svgs";

interface StudentsProps {
  students: any[];
}

export function Students({ students }: StudentsProps) {
  return (
    <div className="bg-card rounded-lg border border-border p-4 space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <span>Students</span>
        <span className="text-sm text-muted-foreground font-normal">({students.length})</span>
      </h2>
      <div className="space-y-3">
        {students.map((student) => (
          <div key={student.id} className="flex items-center gap-2">
            <HelmetIcon className="w-5 h-5 text-yellow-500" />
            <span className="font-medium">{student.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
