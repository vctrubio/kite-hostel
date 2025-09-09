"use client";

import { useState, useEffect } from "react";
import { getAvailablePks, getAvailableSk } from "@/actions/user-actions";
import { getUsers } from "@/actions/auth-actions";
import { CreateUserWalletForm } from "@/components/forms/CreateUserWalletForm";
import { UpdateUserWalletForm } from "@/components/forms/UpdateUserWalletForm";
import { UserSelectionPanel } from "@/components/users/UserSelectionPanel";

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

interface DataState {
  pks: { id: string; name: string }[];
  sks: { id: string; email: string; full_name?: string }[];
  users: any[];
  loading: boolean;
  error: string | null;
}

export default function CreateReferencePage() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserWallet, setSelectedUserWallet] = useState<UserWalletInfo | null>(null);
  const [data, setData] = useState<DataState>({
    pks: [],
    sks: [],
    users: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pksResult, sksResult, usersResult] = await Promise.all([
          getAvailablePks(),
          getAvailableSk(),
          getUsers(),
        ]);

        if (pksResult.error || sksResult.error) {
          setData(prev => ({ 
            ...prev, 
            error: pksResult.error || sksResult.error || "Failed to load data",
            loading: false 
          }));
          return;
        }

        setData({
          pks: pksResult.data || [],
          sks: sksResult.data || [],
          users: usersResult || [],
          loading: false,
          error: null
        });
      } catch (error) {
        setData(prev => ({ 
          ...prev, 
          error: error instanceof Error ? error.message : "Failed to load data",
          loading: false 
        }));
      }
    };

    fetchData();
  }, []);

  const handleDataRefresh = () => {
    setData(prev => ({ ...prev, loading: true }));
    fetchData();
  };

  const fetchData = async () => {
    try {
      const [pksResult, sksResult, usersResult] = await Promise.all([
        getAvailablePks(),
        getAvailableSk(),
        getUsers(),
      ]);

      if (pksResult.error || sksResult.error) {
        setData(prev => ({ 
          ...prev, 
          error: pksResult.error || sksResult.error || "Failed to load data",
          loading: false 
        }));
        return;
      }

      setData({
        pks: pksResult.data || [],
        sks: sksResult.data || [],
        users: usersResult || [],
        loading: false,
        error: null
      });
    } catch (error) {
      setData(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : "Failed to load data",
        loading: false 
      }));
    }
  };

  if (data.loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (data.error) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-red-500">Error loading form data: {data.error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">User Reference Management</h1>
        <p className="text-muted-foreground">Select an existing user to update or create a new user wallet reference</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Selection Panel */}
        <UserSelectionPanel 
          users={data.users} 
          availableSks={data.sks}
          onUserSelect={setSelectedUserId}
          onUserWalletSelect={setSelectedUserWallet}
        />

        {/* Forms Panel */}
        <div className="space-y-6">
          {/* Create Form */}
          <CreateUserWalletForm
            availablePks={data.pks}
            availableSks={data.sks}
            initialSk={selectedUserId}
          />

          {/* Update Form */}
          <UpdateUserWalletForm
            availablePks={data.pks}
            availableSks={data.sks}
            userWallet={selectedUserWallet}
            onUpdate={handleDataRefresh}
          />
        </div>
      </div>
    </div>
  );
}
