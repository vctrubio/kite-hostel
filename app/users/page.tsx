import { getUserWallets, getUsers } from "@/actions/getters";

export default async function UsersPage() {
  const { data: userWallets, error: userWalletsError } = await getUserWallets();
  const usersData = await getUsers(); // getUsers returns raw user data, not { data, error }

  if (userWalletsError) {
    return <div>Error loading user wallets: {userWalletsError}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h2 className="text-xl font-bold mb-2">User Wallets</h2>
          <pre className="bg-muted p-2 rounded-md overflow-auto text-sm text-foreground">
            {JSON.stringify(userWallets, null, 2)}
          </pre>
        </div>
        <div>
          <h2 className="text-xl font-bold mb-2">Auth Users</h2>
          <pre className="bg-muted p-2 rounded-md overflow-auto text-sm text-foreground">
            {JSON.stringify(usersData, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
