"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { userRole } from "@/drizzle/migrations/schema";
import { createUserWallet } from "@/actions/user-actions";

interface CreateUserWalletFormProps {
  availablePks: { id: string; name: string }[];
  availableSks: { id: string; email: string; full_name?: string }[];
  initialSk?: string | null; // New prop
}

export function CreateUserWalletForm({
  availablePks,
  availableSks,
  initialSk,
}: CreateUserWalletFormProps) {
  const [formData, setFormData] = useState({
    role: "reference",
    note: "",
    pk: "",
    sk: initialSk || "", // Initialize sk with initialSk
  });

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      sk: initialSk || "",
    }));
  }, [initialSk]);
  const [loading, setLoading] = useState(false);

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
    setLoading(true);

    const result = await createUserWallet({
      role: formData.role,
      pk: formData.pk === "" ? null : formData.pk,
      note: formData.note,
      sk: formData.sk === "" ? null : formData.sk,
    });

    if (result.success) {
      toast.success("User wallet created successfully!");
      setFormData({
        role: "guest",
        note: "",
        pk: "",
        sk: "",
      });
    } else {
      toast.error(result.error || "Failed to create user wallet.");
    }
    setLoading(false);
  };

  return (
    <div className="p-4 border rounded-md shadow-sm">
      <h2 className="text-xl font-bold mb-4">Create New User Wallet</h2>
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

        {/* SK Field */}
        <div>
          <label
            htmlFor="sk"
            className="block text-sm font-medium text-gray-700"
          >
            SK (User):
          </label>
          <select
            id="sk"
            name="sk"
            value={formData.sk}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          >
            <option value="">Select User</option>
            {availableSks.map((user: any) => (
              <option key={user.id} value={user.id}>
                {user.full_name
                  ? `${user.full_name}: ${user.email}`
                  : user.email}
              </option>
            ))}
          </select>
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
          {loading ? "Creating..." : "Create User Wallet"}
        </Button>
      </form>
    </div>
  );
}
