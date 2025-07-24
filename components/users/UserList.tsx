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
      <h2 className="text-xl font-bold mb-4 text-foreground">Community Members</h2>
      <div className="rounded-lg overflow-hidden">
        {users.length === 0 ? (
          <p className="text-muted-foreground p-4">No users found yet. Be the first to join!</p>
        ) : (
          <ul className="divide-y divide-border/50">
            {users.map((user) => (
              <li key={user.id} className="flex items-center py-3 px-2 gap-4 hover:bg-primary/5 transition-colors duration-200 rounded-md">
                {user.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt={`${user.email}'s avatar`}
                    className="w-10 h-10 rounded-full object-cover border border-primary/20"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg border border-primary/20">
                    {user.email ? user.email[0].toUpperCase() : 'U'}
                  </div>
                )}
                <div className="flex-1 flex justify-between items-center">
                  <p className="font-medium text-foreground">{user.email}</p>
                  <p className="text-sm text-muted-foreground text-right">
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
