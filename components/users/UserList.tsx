"use client";

import { useEffect, useState } from "react";
import { getUsers } from "@/actions/getters";
import type { User } from "@supabase/supabase-js";

export function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const usersData = await getUsers();
        setUsers(usersData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch users");
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="mt-6 w-full">
        <h2 className="text-xl font-bold mb-4 text-foreground">Community Members</h2>
        <div className="rounded-lg overflow-hidden">
          <p className="text-muted-foreground p-4">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6 w-full">
        <h2 className="text-xl font-bold mb-4 text-foreground">Community Members</h2>
        <div className="rounded-lg overflow-hidden">
          <p className="text-red-500 p-4">{error}</p>
        </div>
      </div>
    );
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
