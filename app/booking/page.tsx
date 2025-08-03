import BookingForm from "@/components/forms/BookingForm";
import { getPackages } from "@/actions/package-actions";
import { getStudents } from "@/actions/student-actions";
import { getUserWallets } from "@/actions/user-actions";

export default async function BookingPage() {
  const { data: packages, error: packagesError } = await getPackages();
  const { data: students, error: studentsError } = await getStudents();
  const { data: userWallets, error: userWalletsError } = await getUserWallets();

  if (packagesError) {
    return <div>Error loading packages: {packagesError}</div>;
  }

  if (studentsError) {
    return <div>Error loading students: {studentsError}</div>;
  }

  if (userWalletsError) {
    return <div>Error loading user wallets: {userWalletsError}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <BookingForm packages={packages} students={students} userWallets={userWallets} />
    </div>
  );
}