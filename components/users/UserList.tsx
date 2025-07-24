import { createAdminClient } from "@/lib/supabase/admin";

export async function UserList() {
  const supabaseAdmin = createAdminClient();

  const {
    data: { users },
    error,
  } = await supabaseAdmin.auth.admin.listUsers();

  if (error) {
    console.error("Error fetching users:", error);
    return <p className="text-red-500">Error fetching users.</p>;
  }

  return (
    <div className="mt-6 w-full">
      <h2 className="text-xl font-bold mb-4 text-foreground">All Users</h2>
      <div className="bg-card p-4 rounded-lg shadow-sm">
        {users.length === 0 ? (
          <p className="text-muted-foreground">No users found.</p>
        ) : (
          <ul className="divide-y divide-border">
            {users.map((user) => (
              <li key={user.id} className="flex items-center py-3 gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                  {user.email ? user.email[0].toUpperCase() : "U"}
                </div>
                <div className="flex-1 flex flex-col justify-start items-center">
                  <p className="font-medium text-foreground">{user.email}</p>
                  <p className="text-sm text-muted-foreground">
                    Joined: {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
