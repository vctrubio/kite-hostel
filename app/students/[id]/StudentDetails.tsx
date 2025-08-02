"use client";

interface StudentDetailsProps {
  student: any;
}

export function StudentDetails({ student }: StudentDetailsProps) {
  if (!student) {
    return <div>Student not found.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{student.name}</h1>
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-semibold">Languages:</p>
            <p>{student.languages.join(", ")}</p>
          </div>
          <div>
            <p className="font-semibold">Passport Number:</p>
            <p>{student.passport_number}</p>
          </div>
          <div>
            <p className="font-semibold">Country:</p>
            <p>{student.country}</p>
          </div>
          <div>
            <p className="font-semibold">Phone:</p>
            <p>{student.phone}</p>
          </div>
          <div>
            <p className="font-semibold">Size:</p>
            <p>{student.size}</p>
          </div>
          <div>
            <p className="font-semibold">Description:</p>
            <p>{student.desc}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
