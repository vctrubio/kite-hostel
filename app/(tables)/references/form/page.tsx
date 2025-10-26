import { getAvailablePks, getAvailableSk, getUserWallets, getCurrentUserWallet } from "@/actions/user-actions";
import { getUsers } from "@/actions/auth-actions";
import ReferenceUserWalletPage from "./ReferenceUserWalletPage";
import { redirect } from "next/navigation";

export default async function CreateReferencePage() {
  // Check if user is admin
  const currentUser = await getCurrentUserWallet();

  if (currentUser.role !== "admin") {
    redirect("/invitation");
  }
  // Server-side data fetching
  const [pksResult, sksResult, usersResult, userWalletsResult] = await Promise.all([
    getAvailablePks(),
    getAvailableSk(),
    getUsers(),
    getUserWallets(),
  ]);

  // Handle errors
  if (pksResult.error || sksResult.error || userWalletsResult.error) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-red-500">
          Error loading form data: {pksResult.error || sksResult.error || userWalletsResult.error}
        </div>
      </div>
    );
  }

  // Pass data to client component
  return (
    <ReferenceUserWalletPage
      initialPks={pksResult.data || []}
      initialSks={sksResult.data || []}
      initialUsers={usersResult || []}
      initialUserWallets={userWalletsResult.data || []}
    />
  );
}
