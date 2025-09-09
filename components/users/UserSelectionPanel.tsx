"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Users } from "lucide-react";
import { getUserWallets } from "@/actions/user-actions";
import { getRoleColor } from "@/lib/constants";
import type { User } from "@supabase/supabase-js";

interface UserWalletData {
  pk: string | null;
  sk: string;
  role: string;
}

interface UserWalletInfo {
  id: string;
  pk: string | null;
  sk: string;
  role: string;
  note: string | null;
  teacher_name: string | null;
  sk_email: string | null;
  sk_full_name: string | null;
}

interface UserSelectionPanelProps {
  users: User[];
  availableSks: { id: string; email: string; full_name?: string }[];
  onUserSelect?: (userId: string | null) => void;
  onUserWalletSelect?: (userWallet: UserWalletInfo | null) => void;
}

export function UserSelectionPanel({ 
  users, 
  availableSks, 
  onUserSelect,
  onUserWalletSelect
}: UserSelectionPanelProps) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userWallets, setUserWallets] = useState<UserWalletInfo[]>([]);

  useEffect(() => {
    const fetchUserWallets = async () => {
      try {
        const result = await getUserWallets();
        if (result.data) {
          setUserWallets(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch user wallets:", error);
      }
    };
    fetchUserWallets();
  }, []);

  // Check if user is available (in availableSks list)
  const isUserAvailable = (userId: string) => {
    return availableSks.some(sk => sk.id === userId);
  };

  // Get user wallet info including role
  const getUserWalletInfo = (userId: string) => {
    return userWallets.find(wallet => wallet.sk === userId);
  };


  const handleUserClick = (userId: string) => {
    const available = isUserAvailable(userId);
    const walletInfo = getUserWalletInfo(userId);
    
    if (available) {
      // For available users, handle selection for create form
      const newSelectedId = selectedUserId === userId ? null : userId;
      setSelectedUserId(newSelectedId);
      onUserSelect?.(newSelectedId);
      onUserWalletSelect?.(null); // Clear update form
    } else if (walletInfo) {
      // For users with existing wallets, select for update form
      setSelectedUserId(null); // Clear create form
      onUserSelect?.(null);
      onUserWalletSelect?.(walletInfo);
    }
  };

  const getUserDisplayName = (user: User) => {
    return user.user_metadata?.full_name || 
           user.user_metadata?.name || 
           user.email || 
           "Unknown User";
  };

  const getJoinedDate = (user: User) => {
    return new Date(user.created_at).toLocaleDateString();
  };

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Select Existing User
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Choose a user to link to a new user wallet reference
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {users.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              No users found
            </div>
          ) : (
            users.map((user) => {
              const available = isUserAvailable(user.id);
              const isSelected = selectedUserId === user.id;
              const displayName = getUserDisplayName(user);
              const walletInfo = getUserWalletInfo(user.id);
              
              return (
                <div
                  key={user.id}
                  onClick={() => handleUserClick(user.id)}
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                    available 
                      ? isSelected
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      : "border-orange-200 bg-orange-50 dark:bg-orange-900/20 hover:border-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/30"
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative">
                    {user.user_metadata?.avatar_url ? (
                      <Image
                        src={user.user_metadata.avatar_url}
                        alt={`${displayName}'s avatar`}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg border border-gray-200">
                        {displayName[0]?.toUpperCase() || "U"}
                      </div>
                    )}
                    {isSelected && available && (
                      <div className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full p-1">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                  
                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-sm truncate">
                        {displayName}
                      </p>
                      {walletInfo && (
                        <Badge className={`text-xs ${getRoleColor(walletInfo.role)}`}>
                          {walletInfo.role}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Joined: {getJoinedDate(user)}
                    </p>
                  </div>
                  
                  {/* Availability Status */}
                  <div className="flex flex-col items-end gap-1">
                    {available ? (
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                        Available
                      </Badge>
                    ) : walletInfo ? (
                      <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                        {walletInfo.role}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                        In Use
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        {/* Selected User Info */}
        {selectedUserId && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 rounded-lg">
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Selected User: <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded text-xs">{selectedUserId}</code>
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              This user will be pre-selected in the form
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}