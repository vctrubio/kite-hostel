"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateUserWallet } from "@/actions/user-actions";
import { userRole } from "@/drizzle/migrations/schema";

interface UserWalletFormProps {
  initialUserWallet: any;
  allTeachers: { id: string; name: string }[];
  availableSks: { id: string; email: string; full_name?: string }[];
}

export function UserWalletForm({ initialUserWallet, allTeachers, availableSks }: UserWalletFormProps) {
  const router = useRouter();
  const [userWallet, setUserWallet] = useState(initialUserWallet);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    role: initialUserWallet.role,
    note: initialUserWallet.note || "",
    pk: initialUserWallet.pk || "",
    sk: initialUserWallet.sk || "",
  });

  useEffect(() => {
    // Update local state if initialUserWallet changes (e.g., after a successful save)
    setUserWallet(initialUserWallet);
    setFormData({
      role: initialUserWallet.role,
      note: initialUserWallet.note || "",
      pk: initialUserWallet.pk || "",
      sk: initialUserWallet.sk || "",
    });
  }, [initialUserWallet]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newFormData = {
        ...prev,
        [name]: value,
      };

      if (name === "role" && (value === "admin" || value === "locked" || value === "reference")) {
        newFormData.pk = ""; // Set PK to empty string, which will be converted to null on save
      }
      return newFormData;
    });
  };

  const handleSave = async () => {
    const result = await updateUserWallet(userWallet.id, {
      role: formData.role,
      pk: formData.pk === "" ? null : formData.pk,
      note: formData.note,
      sk: formData.sk === "" ? null : formData.sk,
    });

    if (result.success) {
      // setUserWallet(result.wallet); // This is handled by useEffect now
      setEditMode(false);
      toast.success("User wallet updated successfully!");
      // router.refresh(); // Removed to prevent infinite loop, revalidatePath in action handles it
    } else {
      toast.error(result.error);
    }
  };

  const handleCancel = () => {
    setFormData({
      role: userWallet.role,
      note: userWallet.note || "",
      pk: userWallet.pk || "",
      sk: userWallet.sk || "",
    });
    setEditMode(false);
  };

  if (!userWallet) {
    return <div>User wallet not found.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">User Wallet Details for {userWallet.teacher_name || userWallet.id}</h1>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Role Field */}
          <div className="col-span-1">
            <p className="font-semibold text-lg mb-1">Role:</p>
            {editMode ? (
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {userRole.enumValues.map((roleOption) => (
                  <option key={roleOption} value={roleOption}>
                    {roleOption}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-base">{userWallet.role}</p>
            )}
          </div>

          {/* PK Field */}
          <div className="col-span-1">
            <p className="font-semibold text-lg mb-1">PK:</p>
            {editMode && (formData.role === "teacher" || formData.role === "teacherAdmin") ? (
              <select
                name="pk"
                value={formData.pk || ""}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">NULL</option>
                {allTeachers.map((teacher: any) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-base">{userWallet.pk || "N/A"}</p>
            )}
            {userWallet.pk && userWallet.teacher_name && (
              <p className="text-base text-gray-500">Teacher: {userWallet.teacher_name}</p>
            )}
          </div>

          {/* SK Field */}
          <div className="col-span-1">
            <p className="font-semibold text-lg mb-1">SK:</p>
            {editMode ? (
              <select
                name="sk"
                value={formData.sk || ""}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">NULL</option>
                {userWallet.sk && !availableSks.find((user: any) => user.id === userWallet.sk) && (
                  <option key={userWallet.sk} value={userWallet.sk}>
                    {userWallet.sk_full_name ? `${userWallet.sk_full_name}: ${userWallet.sk_email}` : userWallet.sk_email || userWallet.sk}
                  </option>
                )}
                {availableSks.map((user: any) => (
                  <option key={user.id} value={user.id}>
                    {user.full_name ? `${user.full_name}: ${user.email}` : user.email || user.id}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-base">
                {userWallet.sk || "N/A"}
                {userWallet.sk && (userWallet.sk_full_name || userWallet.sk_email) && (
                  <span className="text-gray-500 block">
                    {userWallet.sk_full_name && userWallet.sk_email
                      ? `${userWallet.sk_full_name}: ${userWallet.sk_email}`
                      : userWallet.sk_email}
                  </span>
                )}
              </p>
            )}
          </div>

          {/* Note Field */}
          <div className="col-span-1">
            <p className="font-semibold text-lg mb-1">Note:</p>
            {editMode ? (
              <Input type="text" name="note" value={formData.note} onChange={handleChange} className="w-full" />
            ) : (
              <p className="text-base">{userWallet.note || "N/A"}</p>
            )}
          </div>
        </div>
        <div className="mt-6 flex space-x-2">
          {editMode ? (
            <>
              <Button onClick={handleSave}>Save</Button>
              <Button variant="outline" onClick={handleCancel}>Cancel</Button>
            </>
          ) : (
            <Button onClick={() => setEditMode(true)}>Edit</Button>
          )}
        </div>
      </div>
    </div>
  );
}
