import BookingForm from "@/components/forms/BookingForm";
import { getPackages, getStudents } from "@/actions/getters";

export default async function BookingPage() {
  const { data: packages, error: packagesError } = await getPackages();
  const { data: students, error: studentsError } = await getStudents();

  if (packagesError) {
    return <div>Error loading packages: {packagesError}</div>;
  }

  if (studentsError) {
    return <div>Error loading students: {studentsError}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <BookingForm packages={packages} students={students} />
    </div>
  );
}