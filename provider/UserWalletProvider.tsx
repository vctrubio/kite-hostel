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

  useEffect(() => {
    const resolveUser = async () => {
      if (!initialUser) {
        sessionStorage.removeItem("userWalletData");
        setUser(null);
        setLoading(false);
        return;
      }

      const cacheKey = `userWalletData_${initialUser.id}`;
      try {
        const cachedData = sessionStorage.getItem(cacheKey);
        if (cachedData) {
          setUser(JSON.parse(cachedData));
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error("Failed to parse cached user data:", error);
        sessionStorage.removeItem(cacheKey); // Clear corrupted cache
      }

      // If no valid cache, fetch from server
      const { pk, role, teacher } = await getCurrentUserWallet();

      const name =
        initialUser.user_metadata?.full_name ||
        initialUser.user_metadata?.name ||
        null;
      const email = initialUser.email || null;
      const phone = initialUser.phone || null;
      const avatar_url = initialUser.user_metadata?.avatar_url || null;

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
          sk: initialUser.id,
        },
        teacher,
      };
      
      try {
        sessionStorage.setItem(cacheKey, JSON.stringify(transformedUser));
      } catch (error) {
        console.error("Failed to cache user data:", error);
      }

      setUser(transformedUser);
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