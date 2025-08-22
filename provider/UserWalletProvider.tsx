"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

interface UserAuth {
  name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
}

interface Wallet {
  pk: string | null;
  sk: string;
}

interface UserWalletData {
  userAuth: UserAuth;
  role: string;
  wallet: Wallet;
}

interface UserWalletContextType {
  user: UserWalletData | null;
  loading: boolean;
}

const UserWalletContext = createContext<UserWalletContextType>({
  user: null,
  loading: true,
});

interface UserWalletProviderProps {
  children: ReactNode;
  initialUser?: User | null;
}

export function UserWalletProvider({
  children,
  initialUser,
}: UserWalletProviderProps) {
  const [user, setUser] = useState<UserWalletData | null>(null);
  const [loading, setLoading] = useState(!initialUser);
  const supabase = createClient();
  console.log("dev:User in UserWalletProvider:", initialUser);

  const fetchUserWallet = async (
    userId: string,
  ): Promise<{ pk: string | null; role: string }> => {
    try {
      const { data, error } = await supabase
        .from("user_wallet")
        .select("pk, role")
        .eq("sk", userId)
        .single();

      if (error || !data) {
        return { pk: null, role: "guest" };
      }

      return {
        pk: data.pk,
        role: data.role || "guest",
      };
    } catch (error) {
      console.error("Error fetching user wallet:", error);
      return { pk: null, role: "guest" };
    }
  };

  const transformUser = async (
    supabaseUser: User | null,
  ): Promise<UserWalletData | null> => {
    if (!supabaseUser) return null;

    const name =
      supabaseUser.user_metadata?.full_name ||
      supabaseUser.user_metadata?.name ||
      null;
    const email = supabaseUser.email || null;
    const phone = supabaseUser.phone || null;
    const avatar_url = supabaseUser.user_metadata?.avatar_url || null;

    // Fetch pk and role from user_wallet table
    const { pk, role } = await fetchUserWallet(supabaseUser.id);

    return {
      userAuth: {
        name,
        email,
        phone,
        avatar_url,
      },
      role,
      wallet: {
        pk,
        sk: supabaseUser.id,
      },
    };
  };

  useEffect(() => {
    // If we have initial user from server, transform and set it
    if (initialUser !== undefined) {
      transformUser(initialUser).then((transformedUser) => {
        setUser(transformedUser);
        setLoading(false);
      });
    }

    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const transformedUser = await transformUser(session?.user ?? null);
        setUser(transformedUser);
        setLoading(false);
      },
    );

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [supabase, initialUser]);

  return (
    <UserWalletContext.Provider value={{ user, loading }}>
      {children}
    </UserWalletContext.Provider>
  );
}

export function useUserWallet() {
  return useContext(UserWalletContext);
}
