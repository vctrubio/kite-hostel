import { getUserWallets } from "@/actions/user-actions";
import { getUsers } from "@/actions/auth-actions";
import { UserCard } from "@/components/cards/User";
import { CreateUserWalletForm } from "@/components/forms/CreateUserWalletForm";

export async function UserManagementDebug({
  userWallets,
  usersData,
  allTeachers,
  availableSks,
  availablePks,
}: {
  userWallets: any;
  usersData: any;
  allTeachers: any;
  availableSks: any;
  availablePks: any;
}) {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h2 className="text-xl font-bold mb-2">User Wallets</h2>
          <pre className="bg-muted p-2 rounded-md overflow-auto text-sm text-foreground">
            {JSON.stringify(userWallets, null, 2)}
          </pre>
          <div className="mt-4 space-y-2">
            {userWallets.map((wallet: any) => (
              <UserCard
                key={wallet.id}
                role={wallet.role}
                teacher_name={wallet.teacher_name}
                sk_full_name={wallet.sk_full_name}
                sk_email={wallet.sk_email}
                note={wallet.note}
                id={wallet.id}
              />
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-xl font-bold mb-2">Auth Users</h2>
          <pre className="bg-muted p-2 rounded-md overflow-auto text-sm text-foreground">
            {JSON.stringify(usersData, null, 2)}
          </pre>
          <div className="mt-4">
            <CreateUserWalletForm allTeachers={allTeachers} availableSks={availableSks} availablePks={availablePks} />
          </div>
        </div>
      </div>
    </div>
  );
}
