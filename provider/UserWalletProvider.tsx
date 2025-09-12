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
import { createClient } from "@/lib/supabase/client";

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

      const cacheKey = `userWalletData_${userId}`;
      try {
        sessionStorage.setItem(cacheKey, JSON.stringify(transformedUser));
      } catch (error) {
        console.error("Failed to cache user data:", error);
      }

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
        sessionStorage.removeItem("userWalletData");
        setUser(null);
        setLoading(false);
        return;
      }

      const cacheKey = `userWalletData_${initialUser.id}`;
      try {
        const cachedData = sessionStorage.getItem(cacheKey);
        if (cachedData) {
          const parsed = JSON.parse(cachedData);
          
          // Force refresh if cached role is guest but we might have a new role
          if (parsed.role === 'guest') {
            sessionStorage.removeItem(cacheKey);
          } else {
            setUser(parsed);
            setLoading(false);
            return;
          }
        }
      } catch (error) {
        console.error("Failed to parse cached user data:", error);
        sessionStorage.removeItem(cacheKey);
      }

      await refreshUserData(initialUser.id);
      setLoading(false);
    };

    resolveUser();
  }, [initialUser]);

  useEffect(() => {
    if (!initialUser) return;

    const supabase = createClient();
    
    const subscription = supabase
      .channel('user_wallet_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_wallet',
        },
        async (payload) => {
          // Check if this change affects the current user
          const isCurrentUserNew = payload.new?.sk === initialUser.id;
          const isCurrentUserOld = payload.old?.sk === initialUser.id;
          const isCurrentUser = isCurrentUserNew || isCurrentUserOld;
          
          if (!isCurrentUser) {
            return;
          }
          
          // Clear all cache and reload page to get fresh server data
          sessionStorage.clear();
          window.location.reload();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
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