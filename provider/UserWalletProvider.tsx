"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { getCurrentUserWallet } from "@/actions/user-actions";
import type { TeacherWithRelations } from "@/actions/teacher-actions";

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
  teacher: TeacherWithRelations | null;
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
  const [loading, setLoading] = useState(true);

  const refreshUserData = async (userId: string) => {
    try {
      const { pk, role, teacher } = await getCurrentUserWallet();
      
      const name =
        initialUser?.user_metadata?.full_name ||
        initialUser?.user_metadata?.name ||
        null;
      const email = initialUser?.email || null;
      const phone = initialUser?.phone || null;
      const avatar_url = initialUser?.user_metadata?.avatar_url || null;

      const transformedUser: UserWalletData = {
        userAuth: {
          name,
          email,
          phone,
          avatar_url,
        },
        role,
        wallet: {
          pk,
          sk: userId,
        },
        teacher,
      };

      setUser(transformedUser);
      return transformedUser;
    } catch (error) {
      console.error("Failed to refresh user data:", error);
      return null;
    }
  };

  useEffect(() => {
    const resolveUser = async () => {
      if (!initialUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      await refreshUserData(initialUser.id);
      setLoading(false);
    };

    resolveUser();
  }, [initialUser]);


  return (
    <UserWalletContext.Provider value={{ user, loading }}>
      {children}
    </UserWalletContext.Provider>
  );
}

export function useUserWallet() {
  return useContext(UserWalletContext);
}