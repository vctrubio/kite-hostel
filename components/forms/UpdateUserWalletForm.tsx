"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { userRole } from "@/drizzle/migrations/schema";
import { updateUserWallet } from "@/actions/user-actions";

interface UserWalletData {
  id: string;
  pk: string | null;
  sk: string;
  role: string;
  note: string | null;
  teacher_name: string | null;
  sk_email: string | null;
  sk_full_name: string | null;
}

interface UpdateUserWalletFormProps {
  availablePks: { id: string; name: string }[];
  availableSks: { id: string; email: string; full_name?: string }[];
  userWallet: UserWalletData | null;
  onUpdate?: () => void;
}

export function UpdateUserWalletForm({
  availablePks,
  availableSks,
  userWallet,
  onUpdate,
}: UpdateUserWalletFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    role: "reference",
    note: "",
    pk: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userWallet) {
      setFormData({
        role: userWallet.role,
        note: userWallet.note || "",
        pk: userWallet.pk || "",
      });
    } else {
      setFormData({
        role: "reference",
        note: "",
        pk: "",
      });
    }
  }, [userWallet]);

  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newFormData = {
        ...prev,
        [name]: value,
      };

      if (
        name === "role" &&
        (value === "admin" || value === "locked" || value === "reference")
      ) {
        newFormData.pk = ""; // Set PK to empty string, which will be converted to null on save
      }
      return newFormData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userWallet) {
      toast.error("No user wallet selected for update");
      return;
    }
    
    setLoading(true);

    const result = await updateUserWallet(userWallet.id, {
      role: formData.role,
      pk: formData.pk === "" ? null : formData.pk,
      note: formData.note,
      sk: userWallet.sk, // Keep the original SK - don't allow changing it
    });

    if (result.success) {
      toast.success("User wallet updated successfully!");
      router.refresh();
      onUpdate?.();
    } else {
      toast.error(result.error || "Failed to update user wallet.");
    }
    setLoading(false);
  };

  const handleClear = () => {
    setFormData({
      role: "reference", 
      note: "",
      pk: "",
    });
  };

  if (!userWallet) {
    return (
      <div className="p-4 border rounded-md shadow-sm bg-gray-50 dark:bg-gray-900">
        <h2 className="text-xl font-bold mb-4">Update User Wallet</h2>
        <p className="text-muted-foreground text-center py-8">
          Select a user with an existing role to update their wallet
        </p>
      </div>
    );
  }

  const getUserDisplayName = () => {
    return userWallet.sk_full_name || userWallet.sk_email || "Unknown User";
  };

  return (
    <div className="p-4 border rounded-md shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Update User Wallet</h2>
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          onClick={handleClear}
        >
          Clear
        </Button>
      </div>
      
      {/* User Info */}
      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 rounded-lg">
        <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
          Updating: <span className="font-semibold">{getUserDisplayName()}</span>
        </p>
        <p className="text-xs text-blue-600 dark:text-blue-400">
          ID: <code className="bg-white dark:bg-gray-800 px-1 rounded text-xs">{userWallet.id}</code>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Role Field */}
        <div>
          <label
            htmlFor="role"
            className="block text-sm font-medium text-gray-700"
          >
            Role:
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          >
            {userRole.enumValues.map((roleOption) => (
              <option key={roleOption} value={roleOption}>
                {roleOption}
              </option>
            ))}
          </select>
        </div>

        {/* PK Field */}
        {(formData.role === "teacher" || formData.role === "teacherAdmin") && (
          <div>
            <label
              htmlFor="pk"
              className="block text-sm font-medium text-gray-700"
            >
              PK (Teacher):
            </label>
            <select
              id="pk"
              name="pk"
              value={formData.pk}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            >
              <option value="">Select Teacher</option>
              {availablePks.map((teacher: any) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* SK Field - Read-only display */}
        <div>
          <label
            htmlFor="sk"
            className="block text-sm font-medium text-gray-700"
          >
            SK (User):
          </label>
          <div className="mt-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700">
            {userWallet.sk_full_name || userWallet.sk_email || userWallet.sk}
            <span className="text-xs text-gray-500 ml-2">
              (Fixed to selected user)
            </span>
          </div>
        </div>

        {/* Note Field */}
        <div>
          <label
            htmlFor="note"
            className="block text-sm font-medium text-gray-700"
          >
            Note:
          </label>
          <Input
            type="text"
            id="note"
            name="note"
            value={formData.note}
            onChange={handleChange}
            className="mt-1 block w-full"
          />
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? "Updating..." : "Update User Wallet"}
        </Button>
      </form>
    </div>
  );
}