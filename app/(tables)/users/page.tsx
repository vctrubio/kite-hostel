import { getUserWallets, getAvailableSk, getAvailablePks } from "@/actions/user-actions";
import { getUsers } from "@/actions/auth-actions";
import { getTeachers } from "@/actions/teacher-actions";
import { UserOverview } from "./UserOverview";

export default async function UsersPage() {
  const { data: userWallets, error: userWalletsError } = await getUserWallets();
  const { data: usersData, error: usersDataError } = await getUsers();
  const { data: allTeachers, error: allTeachersError } = await getTeachers(); // This will be replaced by availablePks
  const { data: availableSks, error: availableSksError } = await getAvailableSk();
  const { data: availablePks, error: availablePksError } = await getAvailablePks();

  if (userWalletsError) {
    return <div>Error loading user wallets: {userWalletsError}</div>;
  }

  if (usersDataError) {
    return <div>Error loading auth users: {usersDataError}</div>;
  }

  if (allTeachersError) {
    return <div>Error loading teachers: {allTeachersError}</div>;
  }

  if (availableSksError) {
    return <div>Error loading available users: {availableSksError}</div>;
  }

  if (availablePksError) {
    return <div>Error loading available PKs: {availablePksError}</div>;
  }

  return <UserOverview userWallets={userWallets} usersData={usersData || []} allTeachers={allTeachers} availableSks={availableSks} availablePks={availablePks} />;
}
