import { getUserWalletById, getAvailableSk } from "@/actions/user-actions";
import { getTeachers } from "@/actions/teacher-actions";
import { UserWalletForm } from "@/components/forms/UserWalletForm";

export default async function UserDetailsPage({ params }: { params: { id: string } }) {
  const { data: userWallet, error: userWalletError } = await getUserWalletById(params.id);
  const { data: allTeachers, error: allTeachersError } = await getTeachers();
  const { data: availableSks, error: availableSksError } = await getAvailableSk();

  if (userWalletError) {
    return <div>Error: {userWalletError}</div>;
  }

  if (allTeachersError) {
    return <div>Error loading teachers: {allTeachersError}</div>;
  }

  if (availableSksError) {
    return <div>Error loading available users: {availableSksError}</div>;
  }

  if (!userWallet) {
    return <div>User wallet not found.</div>;
  }

  return <UserWalletForm initialUserWallet={userWallet} allTeachers={allTeachers} availableSks={availableSks} />;
}
