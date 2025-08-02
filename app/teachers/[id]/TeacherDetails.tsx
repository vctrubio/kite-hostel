"use client";

interface TeacherDetailsProps {
  teacher: any;
}

export function TeacherDetails({ teacher }: TeacherDetailsProps) {
  if (!teacher) {
    return <div>Teacher not found.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{teacher.name}</h1>
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-semibold">Languages:</p>
            <p>{teacher.languages.join(", ")}</p>
          </div>
          <div>
            <p className="font-semibold">Passport Number:</p>
            <p>{teacher.passport_number}</p>
          </div>
          <div>
            <p className="font-semibold">Country:</p>
            <p>{teacher.country}</p>
          </div>
          <div>
            <p className="font-semibold">Phone:</p>
            <p>{teacher.phone}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
