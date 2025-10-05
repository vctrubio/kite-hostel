"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Users } from "lucide-react";
import { getRoleColor } from "@/lib/constants";
import type { User } from "@supabase/supabase-js";


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
  userWallets: UserWalletInfo[]; // Pass user wallets from server instead of fetching
  onUserSelect?: (userId: string | null) => void;
  onUserWalletSelect?: (userWallet: UserWalletInfo | null) => void;
}

export function UserSelectionPanel({ 
  users, 
  availableSks, 
  userWallets,
  onUserSelect,
  onUserWalletSelect
}: UserSelectionPanelProps) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

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
    const date = new Date(user.created_at);
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format for consistent server/client rendering
  };

  return (
    <Card className="bg-card border-border shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Users className="h-5 w-5 text-primary" />
          Community Members
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          View existing members or select a user to create a new reference
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {users.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              No users found
            </div>
          ) : (
            users
              .sort((a, b) => {
                // Sort: Community members (with wallets) first, then available users
                const aWallet = getUserWalletInfo(a.id);
                const bWallet = getUserWalletInfo(b.id);
                if (aWallet && !bWallet) return -1;
                if (!aWallet && bWallet) return 1;
                return 0;
              })
              .map((user) => {
              const available = isUserAvailable(user.id);
              const isSelected = selectedUserId === user.id;
              const displayName = getUserDisplayName(user);
              const walletInfo = getUserWalletInfo(user.id);
              
              return (
                <div
                  key={user.id}
                  onClick={() => handleUserClick(user.id)}
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer hover-lift ${
                    available 
                      ? isSelected
                        ? "border-primary bg-primary/10 shadow-md"
                        : "border-border bg-card hover:border-primary/50 hover:shadow-sm"
                      : walletInfo
                      ? "border-primary/60 bg-primary/5 hover:border-primary hover:bg-primary/10"
                      : "border-destructive/50 bg-destructive/5 hover:border-destructive hover:bg-destructive/10"
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
                        className="w-12 h-12 rounded-full object-cover border-2 border-border"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg border-2 border-primary/30">
                        {displayName[0]?.toUpperCase() || "U"}
                      </div>
                    )}
                    {isSelected && available && (
                      <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full p-1 shadow-md">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                  
                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-sm truncate text-foreground">
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
                      <Badge variant="outline" className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700">
                        Available
                      </Badge>
                    ) : walletInfo ? (
                      <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
                        {walletInfo.role}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs bg-destructive/10 text-destructive border-destructive/30">
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
          <div className="mt-4 p-4 bg-primary/10 border border-primary/30 rounded-lg">
            <p className="text-sm font-medium text-primary">
              Selected User: <code className="bg-card px-2 py-1 rounded text-xs border border-border">{selectedUserId}</code>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              This user will be pre-selected in the form below
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}