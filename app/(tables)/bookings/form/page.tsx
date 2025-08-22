import MasterBookingForm from "@/components/forms/MasterBookingForm";
import { getPackages } from "@/actions/package-actions";
import { getStudents } from "@/actions/student-actions";
import { getUserWallets } from "@/actions/user-actions";
import { getTeachers } from "@/actions/teacher-actions";

export default async function BookingFormPage() {
  const { data: packages, error: packagesError } = await getPackages();
  const { data: students, error: studentsError } = await getStudents();
  const { data: userWallets, error: userWalletsError } = await getUserWallets();
  const { data: teachers, error: teachersError } = await getTeachers();

  if (packagesError) {
    return <div>Error loading packages: {packagesError}</div>;
  }

  if (studentsError) {
    return <div>Error loading students: {studentsError}</div>;
  }

  if (userWalletsError) {
    return <div>Error loading user wallets: {userWalletsError}</div>;
  }

  if (teachersError) {
    return <div>Error loading teachers: {teachersError}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <MasterBookingForm
        packages={packages}
        students={students}
        userWallets={userWallets}
        teachers={teachers}
      />
    </div>
  );
}